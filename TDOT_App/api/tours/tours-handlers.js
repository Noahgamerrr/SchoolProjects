import { Tour } from "./tours-model.js";
import { Visitor } from "../visitors/visitors-model.js";
import mongoose from "mongoose";
import { BadRequest } from "../../middlewares/error-handling.js";
import { Station } from "../stations/stations-model.js";
import { Student } from "../students/students-model.js";
import { Openday } from "../opendays/opendays-model.js";
import auditLogHandlers from "../audit-log/audit-log-handlers.js";
import { ObjectId } from "bson";
import { logger } from "../../logging/log.js";

// TODO: Implement the following:
/*
Note: guide and teamlead only have access to tours via different endpoints
such as /guide-teams/:id/tours and /students/:id/tours

// /tours
GET:
admin, teacher, respective guide, teamlead
POST:
admin, teacher, respective guide
// /tours/:id
GET:
admin, teacher, respective guide, teamlead of guide
PUT:
admin, teacher, respective guide 
DELETE:
admin, teacher, (guide?)
// /tours/:id/end
POST:
admin, teacher, respective guide
// /tours/:id/stations
POST, DELETE:
admin, teacher, respective guide
// /tours/:id/visitors
GET, POST, DELETE:
admin, teacher, respective guide
// /tours/:id/visitors/:visitorId
GET:
admin, teacher, respective guide
// /tours/:id/feedback
GET:
admin, teacher, respective guide, teamlead of guide
POST:
anyone (unauthenticated)
// /tours/:id/feedback/average
GET:
admin, teacher, respective guide, teamlead of guide
// /tours/:id/feedback/:feedbackId
DELETE:
admin, teacher

*/

// GET /api/tours
// GET /api/students/:studentId/tours
// GET /api/guide-teams/:guideTeamId/tours
export const getAll = async (req, res) => {
    // STUDENT ENDPOINT
    const studentId = req.params.studentId;
    if (studentId) {
        const student = await Student.findById(studentId);
        if (!student) return res.status(404).send();
        const tours = await Tour.find({ guide: studentId }).populate(
            "stationQueue.station"
        );
        return res.status(200).json(tours);
    }

    // GUIDE TEAM ENDPOINT
    /*
        const guideTeamId = req.params.guideTeamId;
        if (guideTeamId) {
            const guideTeam = await GuideTeam.findById(guideTeamId);
            if (!guideTeam) return res.status(404).send();
            // Get all students where the guideTeam id is in the guideTeams array
            const students = await Student.find({
                guideTeams: guideTeamId,
            });
            const studentIds = students.map((student) => student._id);
            const tours = await Tour.find({ guide: { $in: studentIds } });

            return res.status(200).json(tours);
        }
        */
    res.status(200).json(await Tour.find().populate("stationQueue"));
};

// GET /api/tours/notVerified
export const getNotVerified = async (req, res) => {
    const tours = await Tour.find({ endTime: { $ne: null }, verified: false })
        .populate("guide")
        .populate("stations.id")
        .populate("stationQueue")
        .populate("visitors");
    res.status(200).json(tours);
};

// POST /api/tours
// POST /api/students/:studentId/tours
export const create = async (req, res) => {
    try {
        const od = await Openday.findOne({ active: true });
        // STUDENT ENDPOINT
        const studentId = req.params.studentId;
        let student;
        if (studentId) {
            student = await Student.findById(studentId);

            if (!student) return res.status(404).send();
            if (!student._id.equals(req.body.guide))
                return res.status(400).send();
            if (student.currentTour)
                return res
                    .status(400)
                    .send(
                        "You need to end your current tour before being able to start a new one."
                    );
            req.body.openday = od._id;
            req.body.endTime = null;
            req.body.stations = [];
            req.body.visitors = [];
            req.body.feedbacks = [];
        }

        const stationsOrder = od.stationOrdering;

        const sortedStations = (await Promise.all(stationsOrder.map(s => Station.findById(s.id))))
            .map(s => {
                return {
                    station: s,
                    order: stationsOrder.find(o => s._id.equals(o.id)).order
                }
            });
        

        logger.info("Found stations : " + JSON.stringify(sortedStations));

        const tour = await Tour.create({
            identifier: await generateNewTourIdentifier(),
            guide: studentId ? studentId : req.body.guide,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            stations: req.body.stations,
            visitors: req.body.visitors,
            feedbacks: req.body.feedbacks,
            numberOfVisitors: req.body.numberOfVisitors,
            stationQueue: sortedStations,
        });
        await auditLogHandlers.addLog(
            `Tour ${tour.identifier} for the guide ${student?.shortform || tour.guide} has been created`,
            req.authenticatedUser
        );
        if (studentId) {
            let activities = student.activity;
            activities.push({ activity: "tour", time: tour.startTime });
            await Student.updateOne(
                { _id: student.id },
                { currentTour: tour._id, activity: activities }
            );
        }
        return res.status(201).json(tour);
    } catch (err) {
        if (err instanceof mongoose.Error.ValidationError)
            return res.status(400).send();
        logger.error(err);
        return res.status(500).send(err);
    }
};

export async function generateNewTourIdentifier() {
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < 5; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
    }
    if (await Tour.findOne({ identifier: result }))
        return generateNewTourIdentifier();
    return result;
}

// GET /api/tours/:id
// GET /api/students/:studentId/tours/:id
// GET /api/guide-teams/:guideTeamId/tours/:id
export const getOne = async (req, res) => {
    const studentId = req.params.studentId;
    try {
        // STUDENT ENDPOINT
        if (studentId) {
            const student = await Student.findById(studentId);
            if (!student) return res.status(404).send();
        }

        // GUIDE TEAM ENDPOINT
        /*if (guideTeamId) {
        const guideTeam = await GuideTeam.findById(guideTeamId);
        if (!guideTeam) return res.status(404).send();
        }*/

        const id = req.params.id;
        // Check if id is valid
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            res.status(400).send();
            return;
        }
        const tour = await Tour.findById(id);

        if (!tour) return res.status(404).send();

        if (studentId && !tour.guide.equals(studentId))
            return res.status(403).send();
        /*if (
            guideTeamId &&
            !(await Student.findById(tour.guide)).guideTeams.includes(
                guideTeamId
                )
                )
                return res.status(403).send();*/
        res.status(200).json(tour);
    } catch {
        res.status(400).send();
    }
};

export const getHandover = async (req, res, next) => {
    try {
        const identifier = req.params.identifier;
        // Check if id is valid
        if (!identifier.match(/^[0-9a-z]{5}$/)) {
            res.status(400).send();
            return;
        }
        const tour = await Tour.findOne({ identifier: identifier })
            .populate(["visitors", "guide"])
            .lean();

        if (!tour) return res.status(404).send();

        let report = { ...tour };
        report.stations = undefined;
        if (report.guide) {
            report.guide.stations = undefined;
            report.guide.guideTeams = undefined;
            report.guide.activity = undefined;
        }
        report.stationsVisited = tour.stations ? tour.stations.length : 0;
        report.tourLengthMs = tour.endTime - tour.startTime;
        report.averageFeedback =
            tour.feedbacks.length ?
                tour.feedbacks.reduce(
                    (sum, feedback) => sum + feedback.rating,
                    0
                ) / tour.feedbacks.length
                :   0;
        await auditLogHandlers.addLog(
            `Handover for tour ${tour.identifier} has been created`,
            req.authenticatedUser
        );
        res.status(200).json(report);
    } catch (e) {
        res.status(400).send();
    }
};

// GET /api/students/:studentId/currentTour
export const getCurrent = async (req, res) => {
    const studentId = req.params.studentId;

    if (!studentId.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).send();

    const student = await Student.findById(studentId);

    if (!student) return res.status(400).send();

    const tour = await Tour.findOne({
        guide: new ObjectId(`${studentId}`),
        endTime: null,
    }).populate("stationQueue");

    if (!tour) return res.status(404).send();
    res.status(200).json(tour);
};

// PUT /api/tours/:id
// PUT /api/students/:studentId/tours/:id
export const update = async (req, res) => {
    try {
        const id = req.params.id;
        // STUDENT ENDPOINT
        const studentId = req.params.studentId;
        let student;
        if (studentId) {
            if (!studentId.match(/^[0-9a-fA-F]{24}$/))
                return res.status(400).send("Invalid studentId");

            student = await Student.findById(studentId);

            if (!student) return res.sendStats(404);
            if (
                !(await Tour.exists({
                    guide: studentId,
                    _id: id,
                    endTime: null,
                })) ||
                !student.currentTour ||
                !student.currentTour._id.equals(id)
            )
                return res
                    .status(403)
                    .send(
                        "You can only change your currently active tour," +
                            "if there is changes you need to make retroactively, please inform an administrator."
                    );
        }
        if (!id.match(/^[0-9a-fA-F]{24}$/))
            return res.status(400).send("Invalid tourId");
        const old = await Tour.findById(id);
        const tour = await Tour.findByIdAndUpdate(
            id,
            {
                openday: req.body.openday,
                guide: studentId ? studentId : req.body.guide,
                startTime: req.body.startTime,
                endTime: req.body.endTime,
                stations: req.body.stations,
                visitors: req.body.visitors,
                feedbacks: req.body.feedbacks,
            },
            { new: true, runValidators: true }
        );
        if (!tour) return res.status(404).send();
        if (studentId && tour.endTime) {
            let activities = student.activity;
            activities.push({ activity: "available", time: tour.endTime });
            await Student.updateOne(
                { _id: student._id },
                { currentTour: null, activity: activities }
            );
        }
        await auditLogHandlers.addLog(
            `Tour ${tour.identifier} has been updated`,
            req.authenticatedUser,
            {
                before: old,
                after: tour
            }
        );
        res.status(204).send();
    } catch {
        // logger.warn(err);
        return res.status(400).send();
    }
};

// PUT /api/tours/:id/priority/:priorityID
export const prioritizeIDCurrentTour = async (req, res, next) => {
    try {
        const id = req.params.id;
        const priorityId = req.params.priorityId;
        // STUDENT ENDPOINT
        const studentId = req.params.studentId;
        let student;

        let toChangeTour;

        if (!priorityId) return res.status(400).send("NO PRIORITY id Attached");

        if (!priorityId.match(/^[0-9a-fA-F]{24}$/))
            return res.status(400).send("Invalid priority id");

        if (!id.match(/^[0-9a-fA-F]{24}$/))
            return res.status(400).send("Invalid tour id");

        if (studentId) {
            if (!studentId.match(/^[0-9a-fA-F]{24}$/))
                return res.status(400).send("Invalid studentId");

            student = await Student.findById(studentId);

            if (!student) return res.status(404).send("Student not found");

            if (
                !(await Tour.exists({
                    guide: studentId,
                    _id: id,
                    endTime: null,
                })) ||
                !student.currentTour ||
                !student.currentTour._id.equals(id)
            )
                return res
                    .status(403)
                    .send(
                        "You can only change your currently active tour," +
                            "if there is changes you need to make retroactively, please inform an administrator."
                    );
            else
                toChangeTour = await Tour.find({
                    guide: studentId,
                    _id: id,
                    endTime: null,
                });
        }

        let priorities = undefined;

        if (toChangeTour && toChangeTour?.length > 0) {
            priorities = toChangeTour[0].stationQueue;
            let first = priorities.filter(e => e.order == 1);
            priorities = priorities.slice(first.length);
            for (let priority of first)
                priority.order = priorities.at(-1).order;
            if (priorities) {
                let newPriority = priorities.find(e => e.station == priorityId);
                let secondaryPriorities = priorities.filter(e => e != newPriority && e.order == newPriority.order);
                priorities = priorities.filter((e) => e.order != newPriority.order);
                for (let priority of priorities.filter(e => e.order > newPriority.order))
                    priority.order -= 1;
                newPriority.order = 1;
                for (let priority of secondaryPriorities) priority.order = 1;
                priorities.unshift(...secondaryPriorities);
                priorities.unshift(newPriority);
                priorities.push(...first);
            }
        } else {
            return res.status(403).send("Tour to be updated not found.");
        }

        if (!priorities)
            return res
                .status(400)
                .send("An issue occured with setting a priority");

        logger.info("PRIORITIES : " + JSON.stringify(priorities));

        const tour = await Tour.findByIdAndUpdate(
            id,
            {
                stationQueue: priorities,
            },
            { new: true, runValidators: true }
        );
        if (!tour) return res.status(404).send("Tour not found");

        const station = await Station.findById(priorityId);
        await auditLogHandlers.addLog(
            `Station ${station.name} has been proiritized for tour ${tour.identifier}`,
            req.authenticatedUser,
        );
        res.status(204).send();
    } catch (err) {
        logger.warn(err);
        return res.status(400).send();
    }
};

// DELETE /api/tours/:id
export const remove = async (req, res, next) => {
    try {
        const id = req.params.id;
        const tour = await Tour.findByIdAndDelete(id);
        if (!tour) return res.status(404).send();
        const guide = await Student.findById(tour.guide);
        await auditLogHandlers.addLog(
            `Tour ${tour.identifier} for student ${guide.shortform} has been removed`,
            req.authenticatedUser
        );
        res.status(204).send();
    } catch (err) {
        res.status(500).send();
    }
};

// POST /api/tours/:id/end
// POST /api/students/:studentId/tours/:id/end
export const endTour = async (req, res, next) => {
    try {
        const id = req.params.id;
        if (!id.match(/^[0-9a-fA-F]{24}$/)) throw new BadRequest();

        // STUDENT ENDPOINT
        const studentId = req.params.studentId;
        if (studentId) {
            const student = await Student.findById(studentId);
            if (!student) return res.status(404).send();
            if (!(await Tour.findById(id)).guide.equals(studentId))
                return res.status(403).send();
            if (!student.currentTour || student.currentTour._id != id)
                return res
                    .status(403)
                    .send(
                        "You can only change your currently active tour," +
                            "if there is changes you need to make retroactively, please inform an administrator."
                    );
        }

        const tour = await Tour.findById(id);

        if (!tour) return res.status(404).send();
        if (tour.endTime) return res.status(400).send("Tour already ended");

        const endTime = new Date().toISOString();

        await Tour.findByIdAndUpdate(
            id,
            { startTime: tour.startTime, endTime },
            { runValidators: true }
        );
        function formatDate(date) {
            return `${date.getHours()}:${date.getMinutes()}`;
        }

        const lastVisitedStation = tour.stations.at(-1);
        if (lastVisitedStation) {
            const s = await Station.findById(lastVisitedStation.id);
            await Station.findOneAndUpdate(
                { _id: s._id },
                {
                    visitorsAtTime: [
                        ...s.visitorsAtTime,
                        {
                            name: formatDate(
                                lastVisitedStation.time.end ? new Date(lastVisitedStation.time.end) : new Date()
                            ),
                            value:
                                findLastTimeInstance(s.visitorsAtTime).value -
                                tour.numberOfVisitors,
                        },
                    ],
                }
            );
        }
        const guide = await Student.findById(tour.guide);
        if (guide.currentTour.equals(tour._id)) {
            let activities = guide.activity;
            activities.push({ activity: "available", time: endTime });
            await Student.updateOne(
                { _id: guide._id },
                { currentTour: null, activity: activities }
            );
        }
        await auditLogHandlers.addLog(
            `Tour ${tour.identifier} for student ${guide.shortform} has been ended`,
            req.authenticatedUser
        );
        res.status(204).send();
    } catch (err) {
        return res.sendStatus(400);
    }
};

// GET /api/tours/:id/stations
export const getTourStations = async (req, res, next) => {
    const id = req.params.id;
    // Check if id is valid
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).send();
        return;
    }
    const tour = await Tour.findById(id);

    if (!tour) return res.status(404).send();

    const stationIds = tour.stations.map((s) => Station.findById(s.id));
    let stations = await Promise.all(stationIds);

    res.status(200).json(stations);
};

// POST /api/tours/:id/stations
// POST /api/students/:studentId/tours/:id/stations
// Body: { stationId: "stationId" }
export const addTourStation = async (req, res, next) => {
    const id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).send();

    // STUDENT ENDPOINT
    const studentId = req.params.studentId;
    if (studentId) {
        const student = await Student.findById(studentId);
        if (!student) return res.status(404).send();
    }

    const tour = await Tour.findById(id);

    if (!tour) return res.status(404).send("Tour not found");
    if (studentId && !tour.guide.equals(studentId))
        return res.status(403).send();

    if (!req.body.id) return res.status(400).send("id missing");

    const station = await Station.findById(req.body.id);
    if (!station) return res.status(404).send("Station not found");

    if (tour.stations.find((s) => station._id.toString() == s.id.toString()))
        return res
            .status(400)
            .send("Station has already been registered to tour");

    function formatDate(date) {
        console.log(typeof date);
        return `${date.getHours()}:${date.getMinutes()}`;
    }

    let newStationVisitorsAtTime = 
        (findLastTimeInstance(station.visitorsAtTime)?.value || 0) + tour.numberOfVisitors;
    
    if (newStationVisitorsAtTime > station.capacity) 
        return res.status(400).send("Too many visitors! Please visit later!");

    // add the data to the station time series
    if (req.body?.time?.start) {
        await Station.findOneAndUpdate(
            { _id: station._id },
            {
                visitorsAtTime: [
                    ...station.visitorsAtTime,
                    {
                        name: formatDate(new Date(req.body.time.start)),
                        value: newStationVisitorsAtTime,
                    },
                ],
            }
        );
    }

    const lastVisitedStation = tour.stations.at(-1);
    if (
        req.body?.time &&
        lastVisitedStation?.time &&
        !lastVisitedStation.time.end
    ) {
        lastVisitedStation.time.end =
            req.body.time ? req.body.time.start : new Date();

        const s = await Station.findById(lastVisitedStation.id);
        await Station.findOneAndUpdate(
            { _id: s._id },
            {
                visitorsAtTime: [
                    ...s.visitorsAtTime,
                    {
                        name: formatDate(new Date(lastVisitedStation.time.end)),
                        value: findLastTimeInstance(s.visitorsAtTime).value - tour.numberOfVisitors,
                    },
                ],
            }
        );
    }

    tour.stations.push({
        id: station._id,
        time: req.body?.time,
    });
    try {
        await tour.save();
    } catch (err) {
        return res.status(400).send();
    }
    const guide = await Student.findById(tour.guide);
    await auditLogHandlers.addLog(
        `Station ${station.name} has been added to ${guide.shortform}'s tour ${tour.identifier}.`,
        req.authenticatedUser
    );
    res.status(204).send();
};

// DELETE /api/tours/:id/stations/:stationId
// DELETE /api/students/:studentId/tours/:id/stations/:stationId
export const removeTourStation = async (req, res, next) => {
    const id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).send();

    // STUDENT ENDPOINT
    const studentId = req.params.studentId;
    if (studentId) {
        const student = await Student.findById(studentId);
        if (!student) return res.status(404).send();
    }

    const tour = await Tour.findById(id);

    if (!tour) return res.status(404).send();
    if (studentId && !tour.guide.equals(studentId))
        return res.status(403).send();

    const stationId = req.params.stationId;
    if (!req.params.stationId) return res.status(400).send();

    try {
        if (!stationId.match(/^[0-9a-fA-F]{24}$/))
            throw new BadRequest("Invalid stationId");
        await Tour.findByIdAndUpdate(id, {
            $pull: { stations: { id: stationId } },
        });
    } catch (err) {
        return res.status(400).send();
    }

    const station = await Station.findById(stationId);
    const guide = await Student.findById(tour.guide);
    await auditLogHandlers.addLog(
        `Station ${station.name} has been removed from ${guide.shortform}'s tour ${tour.identifier}.`,
        req.authenticatedUser
    );
    res.status(204).send();
};

// GET /api/tours/:id/visitors
// GET /api/students/:studentId/tours/:id/visitors
// GET /api/guide-teams/:guideTeamId/tours/:id/visitors
export const getTourVisitors = async (req, res, next) => {
    const id = req.params.id;
    if (!id?.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).send();

    // STUDENT ENDPOINT
    const studentId = req.params.studentId;
    if (studentId) {
        const student = await Student.findById(studentId);
        if (!student) return res.status(404).send();
    }
    // GUIDE TEAM ENDPOINT
    /*const guideTeamId = req.params.guideTeamId;
    if (guideTeamId) {
        const guideTeam = await GuideTeam.findById(guideTeamId);
        if (!guideTeam) return res.status(404).send();
    }*/

    const tour = await Tour.findById(id);

    if (!tour) return res.status(404).send();
    if (studentId && !tour.guide.equals(studentId)) return res.sendStatus(403);
    /*
    if (
        guideTeamId &&
        !(await Student.findById(tour.guide)).guideTeams.includes(guideTeamId)
    )
        return res.status(403).send();
    */
    res.status(200).json(tour.visitors);
};

// POST /api/tours/:id/visitors
// POST /api/students/:studentId/tours/:id/visitors
export const addTourVisitor = async (req, res, next) => {
    const id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).send();

    // STUDENT ENDPOINT
    const studentId = req.params.studentId;
    if (studentId) {
        const student = await Student.findById(studentId);
        if (!student) return res.status(404).send();
    }

    const tour = await Tour.findById(id);

    if (!tour) return res.status(404).send();
    if (studentId && !tour.guide.equals(studentId))
        return res.status(403).send();

    const visitor = req.body.visitor;
    if (!visitor) return res.status(400).send();

    const visitorExists = await Visitor.exists({ _id: visitor });
    if (!visitorExists) return res.status(400).send();

    tour.visitors.push(visitor);
    try {
        await tour.save();
        const guide = await Student.findById(tour.guide);
        const dbVisitor = await Visitor.findById(visitor);
        await auditLogHandlers.addLog(
            `Visitor ${dbVisitor.name} has been added to ${guide.shortform}'s tour ${tour.identifier}.`,
            req.authenticatedUser
        );
    } catch (err) {
        return res.sendStatus(400);
    }
    res.status(204).send(visitor);
};

// DELETE /api/tours/:id/visitors/:visitorId
export const removeTourVisitor = async (req, res, next) => {
    const id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).send();

    const tour = await Tour.findById(id);

    if (!tour) return res.status(404).send();

    const visitorId = req.params.visitorId;
    if (!visitorId.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).send();

    const visitor = await Visitor.findById(visitorId);
    if (!visitor) return res.status(404).send();

    await Tour.findByIdAndUpdate(id, {
        $pull: { visitors: visitorId },
    });

    const guide = await Student.findById(tour.guide);
    await auditLogHandlers.addLog(
        `Visitor ${visitor.name} has been removed from ${guide.shortform}'s tour ${tour.identifier}.`,
        req.authenticatedUser,
        {
            before: visitor,
            changeType: "delete"
        }
    );

    res.status(204).send();
};

// GET /api/tours/:id/visitors/:visitorId
// GET /api/students/:studentId/tours/:id/visitors/:visitorId
// GET /api/guide-teams/:guideTeamId/tours/:id/visitors/:visitorId
export const getTourVisitorById = async (req, res, next) => {
    const id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).send();

    // STUDENT ENDPOINT
    const studentId = req.params.studentId;
    if (studentId) {
        const student = await Student.findById(studentId);
        if (!student) return res.status(404).send();
    }

    // GUIDE TEAM ENDPOINT
    /*const guideTeamId = req.params.guideTeamId;
    if (guideTeamId) {
        const guideTeam = await GuideTeam.findById(guideTeamId);
        if (!guideTeam) return res.status(404).send();
    }*/

    const tour = await Tour.findById(id);
    if (!tour) return res.status(404).send();
    if (studentId && !tour.guide.equals(studentId))
        return res.status(403).send();
    /*
    if (
        guideTeamId &&
        !(await Student.findById(tour.guide)).guideTeams.includes(guideTeamId)
    )
        return res.status(403).send();
    */

    const visitorId = req.params.visitorId;
    if (!visitorId.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).send();

    if (!tour.visitors.includes(req.params.visitorId))
        return res.status(404).send();

    const visitor = await Visitor.findById(visitorId);
    if (!visitor) return res.status(404).send();

    res.status(200).json(visitor);
};

// GET /tours/:id/feedback
// GET /students/:studentId/tours/:id/feedback
// GET /guide-teams/:guideTeamId/tours/:id/feedback
export const getTourFeedback = async (req, res, next) => {
    const id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).send();

    // STUDENT ENDPOINT
    const studentId = req.params.studentId;
    if (studentId) {
        const student = await Student.findById(studentId);
        if (!student) return res.status(404).send();
    }

    // GUIDE TEAM ENDPOINT
    /*const guideTeamId = req.params.guideTeamId;
    if (guideTeamId) {
        const guideTeam = await GuideTeam.findById(guideTeamId);
        if (!guideTeam) return res.status(404).send();
    }*/

    const tour = await Tour.findById(id);

    if (!tour) return res.status(404).send();
    if (studentId && !tour.guide.equals(studentId))
        return res.status(403).send();
    /*
    if (
        guideTeamId &&
        !(await Student.findById(tour.guide)).guideTeams.includes(guideTeamId)
    )
        return res.status(403).send();
    */

    res.status(200).json(tour.feedbacks);
};

// POST /tours/:id/feedback
// POST /students/:studentId/tours/:id/feedback
// POST /guide-teams/:guideTeamId/tours/:id/feedback
export const addTourFeedback = async (req, res, next) => {
    try {
        const id = req.params.id;
        if (!id.match(/^[0-9a-fA-F]{24}$/)) throw new BadRequest();

        // STUDENT ENDPOINT
        const studentId = req.params.studentId;
        if (studentId) {
            const student = await Student.findById(studentId);
            if (!student) return res.status(404).send();
        }

        // GUIDE TEAM ENDPOINT
        /*const guideTeamId = req.params.guideTeamId;
    if (guideTeamId) {
        const guideTeam = await GuideTeam.findById(guideTeamId);
        if (!guideTeam) return res.status(404).send();
    }*/

        const tour = await Tour.findById(id);

        if (!tour) return res.status(404).send();
        if (studentId && !tour.guide.equals(studentId))
            return res.status(403).send();
        /*
    if (
        guideTeamId &&
        !(await Student.findById(tour.guide)).guideTeams.includes(guideTeamId)
    )
        return res.status(403).send();
    */

        const feedback = req.body.feedback;
        if (!feedback) return res.status(400).send();

        if (feedback.favouriteStation == "") delete feedback.favouriteStation;
        if (feedback.leastFavouriteStation == "")
            delete feedback.leastFavouriteStation;

        tour.feedbacks.push(feedback);
        await tour.save();
        const guide = await Student.findById(tour.guide);
        await auditLogHandlers.addLog(
            `Tour ${tour.identifier} by ${guide.shortform} has received rating of ${feedback.rating}.`,
            undefined,
            {
                after: feedback,
                changeType: "addTourFeedback"
            }
        );
    } catch (err) {
        return res.status(400).send();
    }
    res.status(204).send();
};

// GET /tours/:id/feedback/average
// GET /students/:studentId/tours/:id/feedback/average
// GET /guide-teams/:guideTeamId/tours/:id/feedback/average
export const getTourFeedbackAverage = async (req, res, next) => {
    const id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).send();

    // STUDENT ENDPOINT
    const studentId = req.params.studentId;
    if (studentId) {
        const student = await Student.findById(studentId);
        if (!student) return res.status(404).send();
    }

    // GUIDE TEAM ENDPOINT
    /*const guideTeamId = req.params.guideTeamId;
    if (guideTeamId) {
        const guideTeam = await GuideTeam.findById(guideTeamId);
        if (!guideTeam) return res.status(404).send();
    }*/

    const tour = await Tour.findById(id);

    if (!tour) return res.status(404).send();
    if (studentId && !tour.guide.equals(studentId))
        return res.status(403).send();
    /*
    if (
        guideTeamId &&
        !(await Student.findById(tour.guide)).guideTeams.includes(guideTeamId)
    )
        return res.status(403).send();
    */

    const feedbacks = tour.feedbacks;
    if (feedbacks.length === 0) return res.status(200).json({ average: 0 });

    const sum = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
    const average = sum / feedbacks.length;

    res.status(200).json({ average });
};

// DELETE /tours/:id/feedback/:feedbackId
export const removeTourFeedbackById = async (req, res, _next) => {
    try {
        const id = req.params.id;
        if (!id.match(/^[0-9a-fA-F]{24}$/)) throw new BadRequest();

        const tour = await Tour.findById(id);

        if (!tour) return res.status(404).send();

        const feedbackId = req.params.feedbackId;
        if (!feedbackId.match(/^[0-9a-fA-F]{24}$/)) throw new BadRequest();

        const feedback = tour.feedbacks.find((f) => f._id.equals(feedbackId));
        if (!feedback) return res.status(404).send();

        await Tour.findByIdAndUpdate(id, {
            $pull: { feedbacks: { _id: feedbackId } },
        });
        const guide = await Student.findById(tour.guide);
        await auditLogHandlers.addLog(
            `Rating of ${feedback.rating} has been removed from tour ${tour.identifier} by ${guide.shortform}`,
            req.authenticatedUser,
            {
                before: feedback,
                changeType: "deleteTourFeedback"
            }
        );
    } catch (err) {
        return res.status(400).send();
    }

    res.status(204).send();
};

function findLastTimeInstance(data) {
    if (!Array.isArray(data) || data.length === 0) {
        return null; // Handle invalid or empty input
    }

    // Convert time strings to comparable Date objects, find max, and return the name
    const dateRegex = /^(?<hours>[0-9]{1,2}):(?<minutes>[0-9]{2})$/;
    const lastTimeEntry = data.reduce((latest, current) => {
        const regexLatest = dateRegex.exec(latest.name)?.groups;
        let latestTime, currentTime;

        if (regexLatest) {
            const { hours, minutes } = regexLatest;
            latestTime = new Date(
                `1970-01-01T${`${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`}:00`
            );
        } else return latest;
        const regexCurrent = dateRegex.exec(current.name)?.groups;
        if (regexCurrent) {
            const { hours, minutes } = regexCurrent;
            currentTime = new Date(
                `1970-01-01T${`${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`}:00`
            );
        } else return latest;

        return currentTime > latestTime ? current : latest;
    });

    return lastTimeEntry || { name: "00:00", value: 0 };
}

// PUT /tours/:tourId/registerVisitors
// PUT /students/:studentId/tours/:tourId/registerVisitors
export const registerVisitors = async (req, res, _) => {
    const tourId = req.params.tourId;
    if (!tourId.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).send();

    // STUDENT ENDPOINT
    const studentId = req.params.studentId;
    if (studentId) {
        if (!studentId.match(/^[0-9a-fA-F]{24}$/))
            return res.status(400).send();
        const student = await Student.findById(studentId);
        if (!student) return res.status(404).send();
    }

    let tour = await Tour.findById(tourId);

    if (!tour) return res.status(404).send();

    if (studentId && !tour.guide.equals(studentId))
        return res.status(403).send();

    const visitors = req.body;
    if (!visitors || !visitors.length) return res.status(400).send();

    const dbVisitors = [];

    for (let visitor of visitors) {
        visitor.openday = (await Openday.findOne({ active: true }))._id;
        dbVisitors.push((await Visitor.create(visitor))._id);
    }

    tour.visitors = dbVisitors;
    // VALIDATOR ENDPOINT
    if (!studentId) tour.verified = true;

    tour = await tour.save();
    await auditLogHandlers.addLog(
        `Visitors have been registered to tour ${tour.identifier}`,
        req.authenticatedUser,
        {
            after: visitors,
            changeType: "addVisitors"
        }
    );
    res.status(200).send(tour);
};

// PUT /tours/:tourId/verify
export const verify = async (req, res, _) => {
    const tourId = req.params.tourId;
    if (!tourId.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).send();

    const tour = await Tour.findById(tourId);

    if (!tour) return res.status(404).send();

    tour.verified = true;

    await tour.save();
    await auditLogHandlers.addLog(`Tour ${tour.identifier} has been verified`, req.authenticatedUser);
    res.status(200).send(tour);
};

export default {
    prioritizeIDCurrentTour,
    getAll,
    getNotVerified,
    create,
    getOne,
    getHandover,
    getCurrent,
    update,
    remove,
    endTour,
    getTourStations,
    addTourStation,
    removeTourStation,
    getTourVisitors,
    addTourVisitor,
    removeTourVisitor,
    getTourVisitorById,
    getTourFeedback,
    addTourFeedback,
    getTourFeedbackAverage,
    removeTourFeedbackById,
    registerVisitors,
    verify,
};
