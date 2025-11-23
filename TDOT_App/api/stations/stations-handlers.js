import mongoose from "mongoose";

import { logger } from "../../logging/log.js";
import { Station } from "./stations-model.js";
import { Student } from "../students/students-model.js";
import { StationFeedback } from "../feedback/station-feedback-model.js";
import auditLogHandlers from "../audit-log/audit-log-handlers.js";

export const getAll = async (req, resp) => {
    try {
        logger.debug(`Stations - Fetching Stations with filter`, req.query);
        // blindly accept filter from client - never do this in production
        // also, add a field "rating" which is the average of all feedback ratings from "stationfeedbacks" table
        let resultSet = await Station.find(req.query);
        resultSet = await Promise.all(
            resultSet.map(async (s) => {
                const feedbacks = await StationFeedback.find({
                    station: s._id,
                });
                if (feedbacks.length == 0)
                    return { ...s.toObject(), rating: 0 };

                const ratings = feedbacks.map((f) => f.rating);
                const avgRating =
                    ratings.reduce((acc, curr) => acc + curr, 0) /
                    ratings.length;
                return { ...s.toObject(), rating: avgRating };
            })
        );
        resp.status(200);
        resp.json(resultSet);
    } catch (err) {
        logger.warn(err);
        resp.status(400).send();
    }
};

export const create = async (req, resp) => {
    try {
        logger.debug(`Stations - Adding new Station`);
        if (!req.body.capacity || req.body.capacity < 1) {
            resp.status(400)
                .type("text/plain")
                .send("Invalid Station object (Capacity)");
            return;
        }

        if (req.body.maxWorkers) {
            if (req.body.minWorkers > req.body.maxWorkers) {
                resp.status(400)
                    .type("text/plain")
                    .send("Invalid Station object (Worker Capacity invalid)");
                return;
            }
        }

        let newStation = await Station.create(req.body);
        await auditLogHandlers.addLog(
            `Station ${newStation.name} has been created`,
            req.authenticatedUser,
            {
                after: req.body,
                changeType: "add"
            }
        );
        resp.status(201);
        resp.location("/api/stations/" + newStation._id);
        resp.json(newStation);
    } catch (err) {
        logger.debug(err);
        resp.status(400).type("text/plain").send("Invalid Station object");
    }
};

export const getById = async (req, resp) => {
    try {
        let StationId = req.params.id;
        logger.debug(`Stations - Fetch Station with id=${StationId}`);

        let stat = await Station.findById(StationId);

        let feedbacks = await StationFeedback.find({ station: StationId });

        if (stat) {
            if (feedbacks.length != 0) {
                let ratings = feedbacks.map((f) => f.rating);
                let avgRating =
                    ratings.reduce((acc, curr) => acc + curr, 0) /
                    ratings.length;

                stat = { ...stat.toObject(), rating: avgRating };
            } else stat = { ...stat.toObject(), rating: 0 };
            resp.status(200).json(stat);
        } else {
            resp.status(404)
                .type("text/plain")
                .send(`Station with id ${req.params.id} not found`);
        }
    } catch (err) {
        logger.warn(err);
        resp.status(400).send();
    }
};

export const deleteById = async (req, resp) => {
    let StationId = req.params.id;
    logger.debug(`Stations - Delete Station with id=${StationId}`);
    let opResult = await Station.findByIdAndDelete(StationId);
    if (opResult) {
        await auditLogHandlers.addLog(
            `Station ${opResult.name} has been deleted`,
            req.authenticatedUser,
            {
                before: opResult,
                changeType: "delete"
            }
        );
        resp.status(204).send();
    } else {
        resp.status(404)
            .type("text/plain")
            .send(`Station with id ${req.params.id} not found`);
    }
};

// PUT /api/stations/:id
export const updateById = async (req, resp) => {
    try {
        let StationId = req.params.id;
        logger.debug(`Stations - Updating Station with id=${StationId}`);
        let opResult = await Station.findOneAndUpdate(
            { _id: StationId },
            req.body
        );
        if (opResult) {
            const newStation = await Station.findById(StationId);
            await auditLogHandlers.addLog(
                `Station ${opResult.name} has been updated`,
                req.authenticatedUser,
                {
                    before: opResult,
                    after: newStation
                }
            );
            resp.status(204).send();
        } else {
            resp.status(404)
                .type("text/plain")
                .send(`Station with id ${req.params.id} not found`);
        }
    } catch (err) {
        logger.warn(err);
        resp.status(400).send();
    }
};

// GET /api/stations/:id/teamLeader
export const getTeamLeader = async (req, resp) => {
    try {
        let StationId = req.params.id;
        logger.debug(
            `Stations - Getting teamleader from station with id=${StationId}`
        );
        const station = await Station.findById(StationId);
        if (!station) {
            resp.status(404).json({ message: "Station not found" });
            return;
        }
        const students = await Student.find({
            "stations.stationId": StationId,
        });
        const teamLeader = students.find(
            (s) => s.stations.find((st) => st.stationId == StationId).isLeader
        );
        resp.status(200).json(teamLeader);
    } catch (err) {
        logger.warn(err);
        resp.status(400).send();
    }
};

// GET /api/stations/:id/members
export const getStudentsById = async (req, resp) => {
    let stationTeamId = req.params.id;
    if (!stationTeamId.match(/^[0-9a-fA-F]{24}$/)) {
        resp.status(400).type("text/plain").send("Invalid Id!");
        return;
    }
    logger.debug(`Station-Teams - Station-teams with id=${stationTeamId}`);

    let team = await Station.findById(stationTeamId);

    if (team) {
        let students = await Student.find();
        let members = students.filter((std) => {
            return (
                std.stations.find((stion) => stion.stationId == team._id) !=
                undefined
            );
        });

        members = members.map((mber) => {
            let member = { ...mber }._doc;
            member.isLeader = false;
            if (
                mber.stations.find(
                    (stion) =>
                        stion.stationId == team._id && stion.isLeader == true
                )
            )
                member.isLeader = true;
            return member;
        });

        logger.debug(
            "Station Team members: " + team._id + "\n" + JSON.stringify(members)
        );

        resp.status(200).json(members);
    } else {
        resp.status(404)
            .type("text/plain")
            .send(`Guide-team with id ${req.params.id} not found`);
    }
};

export default {
    getAll,
    create,
    getById,
    updateById,
    deleteById,
    getTeamLeader,
    getStudentsById,
};
