import mongoose from "mongoose";
import { Student } from "../students/students-model.js";
import { NotificationService } from "./notifications-service.js";
import { Tour } from "../tours/tours-model.js";
import auditLogHandlers from "../audit-log/audit-log-handlers.js";
import { logger } from "../../logging/log.js";
import { generateNewTourIdentifier } from "../tours/tours-handlers.js";

const requestSchema = mongoose.Schema({
    amount: Number,
    location: String,
    pending: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
        },
    ],
    expireAt: {
        type: Date,
        default: Date.now,
        // After 10 minutes, the request is considered expired
        expires: 600,
    },
});

const Request = mongoose.model("GuideRequest", requestSchema);

const getRequestableGuides = async (n) => {
    const currentlyRequestedGuides = (
        await Request.aggregate([
            {
                $match: {
                    pending: { $exists: true },
                },
            },
            {
                $project: {
                    pending: 1,
                },
            },
            {
                $unwind: "$pending",
            },
            {
                $group: {
                    _id: "$pending",
                },
            },
            {
                $project: {
                    _id: 0,
                    student: "$_id",
                },
            },
        ])
    ).map((r) => r.student);

    return await Student.aggregate([
        {
            $addFields: {
                lastActivity: {
                    // Sort the activity array by time and select the latest
                    $reduce: {
                        input: "$activity",
                        initialValue: { time: new Date(0) },
                        in: {
                            $cond: {
                                if: { $gt: ["$$this.time", "$$value.time"] },
                                then: "$$this",
                                else: "$$value",
                            },
                        },
                    },
                },
            },
        },
        {
            // Select students that
            $match: {
                // are not currently requested
                _id: { $nin: currentlyRequestedGuides },
                // are guides (in a guide team)
                "guideTeams.0": { $exists: true },
                // are currently available (sort activity by time and select the latest)
                "lastActivity.activity": "available",
            },
        },
        {
            $addFields: {
                // Add a field that tracks the length of the activity array
                activity_count: { $size: { $ifNull: ["$activity", []] } },
            },
        },
        {
            // Grab 100 random guides to avoid always selecting the same guides
            $sample: { size: 100 },
        },
        {
            $sort: {
                // Sort by the length of the activity array
                activity_count: 1,
            },
        },
        {
            // Limit the results to n
            $limit: n,
        },
    ]);
};

export const rejectRequest = async (baseurl, guideId, requestId) => {
    const request = await Request.findById(requestId);

    if (!request) return false;
    if (!request.pending.includes(guideId)) return false;

    const requestable = await getRequestableGuides(1);

    await Request.findByIdAndUpdate(requestId, {
        $pull: { pending: guideId },
    });

    if (requestable.length !== 0) {
        await Request.findByIdAndUpdate(requestId, {
            $push: { pending: requestable[0]._id },
        });

        requestable.forEach((g) => {
            sendRequestToGuide(g._id, requestId);
        });
    }

    return true;
};

export const acceptRequest = async (guideId, requestId) => {
    const request = await Request.findById(requestId);

    if (!request) return false;
    if (!request.pending.includes(guideId)) return false;

    await Request.findByIdAndUpdate(requestId, {
        $pull: { pending: guideId },
    });

    // STUDENT ENDPOINT
    const studentId = guideId;
    let student;
    const pre = {};
    if (studentId) {
        student = await Student.findById(studentId);
        pre.startTime = new Date();
        pre.endTime = null;
        pre.stations = [];
        pre.visitors = [];
        pre.feedbacks = [];
    }
    const tour = await Tour.create({
        guide: studentId,
        startTime: pre.startTime,
        endTime: pre.endTime,
        stations: pre.stations,
        visitors: pre.visitors,
        feedbacks: pre.feedbacks,
        identifier: await generateNewTourIdentifier(),
    });
    await auditLogHandlers.addLog(
        `Tour starting at ${new Date(tour.startTime).toISOString()} for the guide ${student?.shortform || tour.guide} has been created by accepting the request ${requestId}`
    );
    if (studentId) {
        let activities = student.activity;
        activities.push({ activity: "tour", time: tour.startTime });
        await Student.updateOne(
            { _id: student.id },
            { currentTour: tour._id, activity: activities }
        );
    }

    return true;
};

const sendRequestToGuide = (guideId, requestId, location, baseurl) => {
    // Send notification to guide
    // Call to action url is
    // "/api/notifications/accept?r=id&g=guideId"
    // "/api/notifications/reject?r=id&g=guideId"

    setTimeout(() => {
        rejectRequest(guideId, requestId);
    }, 60000);

    NotificationService.sendNotification(
        {
            title: `Guide request - ${location}`,
            body: `Please report to ${location} for a tour\n\nAccept: ${baseurl}/notifications/accept?r=${requestId}&g=${guideId}\nReject: ${baseurl}/notifications/reject?r=${requestId}&g=${guideId}`,
        },
        [{ _id: guideId }]
    );
};

export const getGuideRequests = async () => {
    return await Request.find();
};

export const createGuideRequest = async (amount, location, baseurl) => {
    // - Find guides with least tours that are available
    // - Send notification to n guides with call to action
    // Call to action url is
    // "/api/notifications/accept?r=id"
    // "/api/notifications/reject?r=id"

    // Guides have 60s to respond to a request
    // Requests expire after 10 minutes

    const guides = await getRequestableGuides(amount);

    if (guides.length < amount) throw guides.length;

    const r = await Request.create({
        amount,
        location,
        pending: guides,
    });

    guides.forEach((g) => {
        sendRequestToGuide(g._id, r._id, location, baseurl);
    });
    try {
        const guideTeams = guides.reduce((acc, g) => {
            g.guideTeams.forEach((team) => {
                if (!acc[team.teamId]) acc[team.teamId] = [];
                acc[team.teamId].push(g);
            });
            return acc;
        }, {});
        const teamLeaders = await Student.find({
            "guideTeams.teamId": { $in: Object.keys(guideTeams) },
            "guideTeams.isLeader": true,
        });

        Object.entries(guideTeams).forEach(([teamId, guides]) => {
            const leader = teamLeaders.find((l) =>
                l.guideTeams.some((t) => t.teamId === teamId && t.isLeader)
            );

            if (leader) {
                NotificationService.sendNotification(
                    {
                        title:
                            guides.length +
                            " Guide" +
                            (guides.length > 1 ? "s" : "") +
                            " from your team requested",
                        body:
                            guides
                                .map((g) => `${g.firstname} ${g.lastname}`)
                                .join(", ") +
                            " " +
                            (guides.length > 1 ? "are" : "is") +
                            " requested to come to " +
                            location,
                    },
                    [leader]
                );
            }
        });
    } catch (e) {
        logger.warn(e);
    }

    return true;
};
