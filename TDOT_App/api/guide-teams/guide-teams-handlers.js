import mongoose from "mongoose";

import { logger } from "../../logging/log.js";
import { GuideTeam } from "./guide-teams-model.js";
import auditLogHandlers from "../audit-log/audit-log-handlers.js";
import { Student } from "../students/students-model.js";

export const getAll = async (req, resp) => {
    try {
        logger.debug(
            `Guide-Teams - Fetching Guide-Teams with filter`,
            req.query
        );
        // blindly accept filter from client - never do this in production
        let resultSet = await GuideTeam.find(req.query);
        resp.status(200);
        resp.json(resultSet);
    } catch (err) {
        logger.warn(err);
        resp.status(500).send();
    }
};

export const create = async (req, resp) => {
    try {
        logger.debug(`Guide-teams - Adding new guide-teams`);

        let newTeam = await GuideTeam.create(req.body);
        resp.status(201);
        resp.location("/api/guide-teams/" + newTeam._id);
        await auditLogHandlers.addLog(
            `Created guide-team ${req.body.name}`,
            req.authenticatedUser
        );
        resp.json(newTeam);
    } catch (err) {
        resp.status(400)
            .type("text/plain")
            .send("A guide-team with this name already exists");
    }
};

export const getById = async (req, resp) => {
    let GuideTeamId = req.params.id;
    if (!GuideTeamId.match(/^[0-9a-fA-F]{24}$/)) {
        resp.status(400).type("text/plain").send("Invalid Id!");
        return;
    }
    logger.debug(`Guide-Teams - Guide-teams with id=${GuideTeamId}`);

    let team = await GuideTeam.findById(GuideTeamId);
    if (team) {
        resp.status(200).json(team);
    } else {
        resp.status(404)
            .type("text/plain")
            .send(`Guide-team with id ${req.params.id} not found`);
    }
};

export const getStudentsById = async (req, resp) => {
    let GuideTeamId = req.params.id;
    if (!GuideTeamId.match(/^[0-9a-fA-F]{24}$/)) {
        resp.status(400).type("text/plain").send("Invalid Id!");
        return;
    }
    logger.debug(`Guide-Teams - Guide-teams with id=${GuideTeamId}`);

    let team = await GuideTeam.findById(GuideTeamId);

    if (team) {
        let students = await Student.find();
        let members = students.filter((std) => {
            return (
                std.guideTeams.find((guideT) => guideT.teamId == team._id) !=
                undefined
            );
        });

        members = members.map((mber) => {
            let member = { ...mber }._doc;
            member.isLeader = false;
            if (
                mber.guideTeams.find(
                    (guideT) =>
                        guideT.teamId == team._id && guideT.isLeader == true
                )
            )
                member.isLeader = true;
            return member;
        });

        // logger.debug(
        //     "Team members: " + team._id + "\n" + JSON.stringify(members)
        // );

        resp.status(200).json(members);
    } else {
        resp.status(404)
            .type("text/plain")
            .send(`Guide-team with id ${req.params.id} not found`);
    }
};

export const deleteById = async (req, resp) => {
    let TeamId = req.params.id;
    if (!TeamId.match(/^[0-9a-fA-F]{24}$/)) {
        resp.status(400).type("text/plain").send("Invalid Id!");
        return;
    }
    logger.debug(`Guide-Teams - Delete guide-team with id=${TeamId}`);
    let opResult = await GuideTeam.findByIdAndDelete(TeamId);
    if (opResult) {
        await auditLogHandlers.addLog(
            `Guide-Team ${opResult.name} has been deleted`,
            req.authenticatedUser
        );
        resp.status(204).send();
    } else {
        resp.status(404)
            .type("text/plain")
            .send(`Guide-team with id ${req.params.id} not found`);
    }
};

export const updateById = async (req, resp) => {
    try {
        let TeamId = req.params.id;
        if (!TeamId.match(/^[0-9a-fA-F]{24}$/)) {
            resp.status(400).type("text/plain").send("Invalid Id!");
            return;
        }
        logger.debug(`Guide-Teams - Updating guide-team with id=${TeamId}`);
        const opts = { runValidators: true };
        let opResult = await GuideTeam.findOneAndUpdate(
            { _id: TeamId },
            req.body,
            opts
        );
        if (opResult) {
            await auditLogHandlers.addLog(
                `Guide-team ${opResult.name} has been renamed to ${req.body.name}`,
                req.authenticatedUser
            );
            resp.status(204).send();
        } else {
            resp.status(404)
                .type("text/plain")
                .send(`Guide-Team with id ${req.params.id} not found`);
        }
    } catch (err) {
        resp.status(400)
            .type("text/plain")
            .send("A guide-team with this name already exists");
    }
};

export default {
    getAll,
    create,
    getById,
    getStudentsById,
    deleteById,
    updateById,
};
