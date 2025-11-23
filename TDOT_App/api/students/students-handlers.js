import {Student} from "./students-model.js";
import {Station} from "../stations/stations-model.js";
import {GuideTeam} from "../guide-teams/guide-teams-model.js";
import {Openday} from "../opendays/opendays-model.js";
import {logger} from "../../logging/log.js";
import {
    BadRequest,
    NotFound,
    PreConditionFailed,
    UnsupportedMediaType,
    InternalServerError,
} from "../../middlewares/error-handling.js";
import auditLogHandlers from "../audit-log/audit-log-handlers.js";
import {Tour} from "../tours/tours-model.js";
import {ObjectId} from "bson";
import * as crypto from 'node:crypto';

// GET /api/students
export const getAll = async (req, resp, next) => {
    try {
        logger.debug(`Students - Fetching all with filter`, req.query);
        // blindly accept filter from client - never do this in production
        let resultSet = await Student.find(req.query);
        resp.status(200);
        resp.json(resultSet);
    } catch (err) {
        next(new InternalServerError(err));
    }
};

// POST /api/students
export const create = async (req, resp, next) => {
    try {
        logger.debug(`Students - Adding new student`);
        let newStudent = await Student.create(req.body);
        await auditLogHandlers.addLog(
            `Student ${newStudent.shortform} has been created`,
            req.authenticatedUser,
            {
                after: newStudent,
                changeType: "add"
            }
        );
        resp.status(201);
        resp.location("/api/students/" + newStudent.id);
        resp.json(newStudent);
    } catch (err) {
        next(new BadRequest("Invalid student object", err));
    }
};

// GET /api/students/:id
export const getById = async (req, resp, next) => {
    let objId = req.params.id;

    logger.debug(`Students - Fetch student with id=${objId}`);

    try {
        let student = await Student.findById(objId);
        if (student) resp.status(200).header("etag", student.__v).json(student);
        else next(new NotFound(`Student with id ${objId} not found`));
    } catch (e) {
        return resp.sendStatus(400);
    }
};

// DELETE /api/students/:id
export const deleteById = async (req, resp, next) => {
    try {
        let objId = req.params.id;
        logger.debug(`Students - Delete student with id=${objId}`);
        let opResult = await Student.findByIdAndDelete(objId);
        if (opResult) {
            await auditLogHandlers.addLog(
                `Student ${opResult.shortform} has been deleted`,
                req.authenticatedUser,
                {
                    before: opResult,
                    changeType: "delete"
                }
            );
            resp.status(204).send();
        } else next(new NotFound(`Student with id ${objId} not found`));
    } catch (err) {
        next(new BadRequest(err));
    }
};

// PUT /api/students/:id
export const updateById = async (req, resp, next) => {
    const objId = req.params.id;
    const ifMatchHdr = req.headers["if-match"];

    if (!ifMatchHdr) {
        next(new BadRequest(`if-match header not provided`));
        return;
    }

    try {
        logger.debug(`Students - Update student with id=${objId}`);
        let student = await Student.findById(objId);

        if (student === null) {
            next(new NotFound(`Student with id ${objId} not found`));
            return;
        }

        // check if resource was modified in the meantime
        if (ifMatchHdr != student.__v) {
            next(
                new PreConditionFailed(
                    "Resource was modified in the meantime. Cannot update"
                )
            );
            return;
        }

        const before = Object.fromEntries(
            Object.entries(student).filter(([key]) => Object.keys(req.body).includes(key))
        );

        // copy over properties to existing object
        for (let k in req.body) {
            student[k] = req.body[k];
        }

        // save back object to database
        await student.save();
        await auditLogHandlers.addLog(
            `Student ${student.shortform} has been updated`,
            req.authenticatedUser,
            {
                before,
                after: req.body
            }

        );
        resp.status(200).json(student);
    } catch (err) {
        next(new BadRequest("Invalid student object", err));
    }
};

// PATCH /api/students/:id
export const patchById = async (req, resp, next) => {
    if (req.headers["content-type"] != "application/merge-patch+json") {
        next(
            new UnsupportedMediaType(
                "only application/merge-patch+json supported"
            )
        );
        return;
    }

    const objId = req.params.id;

    try {
        logger.debug(`Students - Patch student with id=${objId}`);
        let student = await Student.findById(objId);

        if (student === null) {
            next(new NotFound(`Student with id ${objId} not found`));
            return;
        }

        const before = Object.fromEntries(
            Object.entries(student).filter(([key]) => Object.keys(req.body).includes(key))
        );

        // merge provided properties into object
        for (let k in req.body) {
            if (req.body[k] === null) {
                delete student[k];
            } else {
                student[k] = req.body[k];
            }
        }

        // save back object to database
        await student.save();
        await auditLogHandlers.addLog(
            `Student ${student.shortform} has been updated`,
            req.authenticatedUser,
            {
                before,
                after: req.body,
            }
        );
        resp.status(200).json(student);
    } catch (err) {
        next(new BadRequest("Invalid student object", err));
    }
};

// GET /api/students/:shortform/teamMembers
export const getTeamMembers = async (req, resp, next) => {
    let shortform = req.params.shortform;
    logger.debug(
        `Students - Fetch teams from student with shortform=${shortform}`
    );

    let student = await Student.findOne({shortform});
    if (!student) {
        next(new NotFound(`Student with id ${shortform} not found`));
        return;
    }
    let teamMembers = {
        guideTeams: {},
        stations: {},
    };
    let userGuideTeams = student.guideTeams.filter((team) => team.isLeader);
    let userStations = student.stations.filter((station) => station.isLeader);
    const stationAwaiter = [];
    const guideTeamAwaiter = [];
    const stationMembersAwaiter = [];
    const guideTeamMembersAwaiter = [];
    const names = [];
    for (let guideTeam of userGuideTeams) {
        guideTeamAwaiter.push(GuideTeam.findById(guideTeam.teamId));
        guideTeamMembersAwaiter.push(
            Student.find({"guideTeams.teamId": guideTeam.teamId})
        );
    }
    for (let station of userStations) {
        stationAwaiter.push(Station.findById(station.stationId));
        stationMembersAwaiter.push(
            Student.find({"stations.stationId": station.stationId})
        );
    }

    const guideTeams = await Promise.all(guideTeamAwaiter);
    const guideTeamMembers = await Promise.all(guideTeamMembersAwaiter);
    const stations = await Promise.all(stationAwaiter);
    const stationMembers = await Promise.all(stationMembersAwaiter);

    for (let i = 0; i < userGuideTeams.length; i++) {
        teamMembers.guideTeams[userGuideTeams[i].teamId] = {
            name: guideTeams[i].name,
            members: guideTeamMembers[i],
            teamLeader: student,
        };
    }
    for (let i = 0; i < userStations.length; i++) {
        teamMembers.stations[userStations[i].stationId] = {
            name: stations[i].name,
            members: stationMembers[i],
            teamLeader: student,
        };
    }
    resp.status(200).json(teamMembers);
};

// GET /api/students/teams
export const getAllTeams = async (_req, resp, next) => {
    logger.debug(`Students - Fetch all teams`);

    const teamMembers = {
        guideTeams: {},
        stations: {},
    };
    const guideTeams = await GuideTeam.find();
    const stations = await Station.find();
    const guideTeamAwaiter = [];
    const stationAwaiter = [];
    for (let guideTeam of guideTeams)
        guideTeamAwaiter.push(
            Student.find({"guideTeams.teamId": guideTeam.id})
        );
    for (let station of stations)
        stationAwaiter.push(Student.find({"stations.stationId": station.id}));
    const guideTeamResults = await Promise.all(guideTeamAwaiter);
    const stationResults = await Promise.all(stationAwaiter);

    for (let i = 0; i < guideTeams.length; i++) {
        if (!guideTeamResults[i].length) continue;
        let guideTeam = guideTeams[i];
        const teamLeader = guideTeamResults[i].find(
            (s) => s.guideTeams.find((gt) => gt.teamId == guideTeam.id).isLeader
        );
        teamMembers.guideTeams[guideTeam.id] = {
            name: guideTeam.name,
            members: guideTeamResults[i],
            teamLeader,
        };
    }

    for (let i = 0; i < stations.length; i++) {
        if (!stationResults[i].length) continue;
        let station = stations[i];
        const teamLeader = stationResults[i].find(
            (s) => s.stations.find((st) => st.stationId == station.id).isLeader
        );
        teamMembers.stations[station.id] = {
            name: station.name,
            members: stationResults[i],
            teamLeader,
        };
    }

    resp.status(200).json(teamMembers);
};

// POST /api/students/fill
export const fill = async (req, res, next) => {
    if (req.headers["content-type"] != "application/json") {
        return res.sendStatus(415);
    }
    const students = req.body;
    const faulty = [];

    const activeOpendayId = (await Openday.findOne({active: true}))._id;

    for (const s of students.map(s => {
        const station = s.station + (s.station?.length > 0 && s.team?.length > 0 ? ` - ${s.team}` : "");
        return {
            firstname: s.firstname,
            lastname: s.lastname,
            shortform: s.shortform,
            hasStation: !!s.station,
            station: station,
            stations: [{
                stationId: new ObjectId(crypto.hash("sha256", station).substring(0, 24)),
                isLeader: !!s.isLeader
            }],
            guideTeams: [
                // hardcoded value; has to be guide, otherwise considered a station
                s.station?.toLowerCase() === "guide" ? {
                    teamId: new ObjectId(crypto.hash("sha256", s.team).substring(0, 24)),
                    isLeader: !!s.isLeader
                } : undefined
            ]
        }
    })) {
        if (!s) return res.sendStatus(400);
        if (!s.firstname || !s.lastname || !s.hasStation) {
            faulty.push(s);
            continue;
        }
        if (!s.shortform) s.shortform = s.lastname.slice(0, 7) + s.firstname;
        const stationExists = await Station.exists({_id: s.stations[0].stationId});
        // check whether someone already is leader
        if (s.stations[0].isLeader && await Student.exists({stations: {$elemMatch: {isLeader: true, stationId: s.stations[0].stationId}}}).exec()) {
            faulty.push(s);
            continue;
        }
        // check for whether student is a guide by trying to access the guideTeam which would be assigned if true
        if (!s.guideTeams[0] && !stationExists) {
            const station = {_id: s.stations[0].stationId, name: s.station}
            new Station(station).save()
                .then(() => logger.info("success creating " + station.name))
                .catch(err => logger.warn(`Error while creating ${station.name}:\n` + err));
        } else if (s.guideTeams[0]) {
            // check whether someone already is leader
            if (s.guideTeams[0].isLeader && await Student.exists({guideTeams: {$elemMatch: {isLeader: true, teamId: s.guideTeams[0].teamId}}}).exec()) {
                faulty.push(s);
                continue;
            }
            const guideTeamExists = await GuideTeam.exists({_id: s.guideTeams[0].teamId});
            if (!guideTeamExists) {
                const guideTeam = {_id: s.guideTeams[0].teamId, name: s.station}
                new GuideTeam(guideTeam).save()
                    .then(() => logger.info("success creating " + guideTeam.name))
                    .catch(err => logger.warn(`Error while creating ${guideTeam.name}:\n` + err));
            }
        }

        s.openDayId = activeOpendayId;
        // hate to be slow but this is necessary for validation
        await Student.updateOne({shortform: s.shortform}, s, {upsert: true}).exec();
    }
    const successfulInserts = students.length - faulty.length;
    await auditLogHandlers.addLog(
        `${successfulInserts} students have been inserted, ${faulty.length} contained errors`,
        req.authenticatedUser,
        {
            faulty,
            changeType: "import"
        }
    );
    logger.info(`${successfulInserts} students have been inserted, ${faulty.length} contained errors`);
    return res.status(200).json({errors: faulty});
};

// PUT /api/students/:id/guideLeader/:teamId
export const setGuideTeamLeader = async (req, resp, next) => {
    const studentId = req.params.id;
    const teamId = req.params.teamId;
    const ifMatchHdr = req.headers["if-match"];

    if (!studentId.match(/^[0-9a-fA-F]{24}$/)) return resp.status(400).send();

    if (!ifMatchHdr) {
        next(new BadRequest(`if-match header not provided`));
        return;
    }

    logger.debug(
        `Students - Set student with id=${studentId} as guideTeam-leader of ${teamId}`
    );
    let student = await Student.findById(studentId);

    if (student === null) {
        next(new NotFound(`Student with id ${studentId} not found`));
        return;
    }

    // check if resource was modified in the meantime
    if (ifMatchHdr != student.__v) {
        next(
            new PreConditionFailed(
                "Resource was modified in the meantime. Cannot update"
            )
        );
        return;
    }

    let studentGuideTeam = student.guideTeams.find(
        (gt) => gt.teamId === teamId
    );

    if (studentGuideTeam === undefined) {
        next(new BadRequest(`Student is not part of this team`));
        return;
    }
    if (studentGuideTeam.isLeader) {
        next(new BadRequest(`Student already is the leader of this team`));
        return;
    }

    let teamMembers = await Student.find({"guideTeams.teamId": teamId});
    let leader = teamMembers.find(
        (st) => st.guideTeams.find((gt) => gt.teamId === teamId).isLeader
    );

    if (leader) {
        let oldLeaderGuideTeam = leader.guideTeams.find(
            (gt) => gt.teamId === teamId
        );
        oldLeaderGuideTeam.isLeader = false;
        await leader.save();
    }

    studentGuideTeam.isLeader = true;
    await student.save();
    
    const guideTeam = await GuideTeam.findById(teamId);
    await auditLogHandlers.addLog(
        `Student ${student.shortform} has been made team-leader of guide-team ${guideTeam.name}`,
        req.authenticatedUser
    );
    resp.status(200).send();
};

// DELETE /api/students/:id/guideTeam/:teamId
export const removeFromGuideTeam = async (req, resp, next) => {
    const studentId = req.params.id;
    const teamId = req.params.teamId;
    const ifMatchHdr = req.headers["if-match"];

    if (!studentId.match(/^[0-9a-fA-F]{24}$/)) return resp.status(400).send();

    if (!ifMatchHdr) {
        next(new BadRequest(`if-match header not provided`));
        return;
    }

    logger.debug(
        `Students - Set student with id=${studentId} as guideTeam-leader of ${teamId}`
    );
    let student = await Student.findById(studentId);

    if (student === null) {
        next(new NotFound(`Student with id ${studentId} not found`));
        return;
    }

    // check if resource was modified in the meantime
    if (ifMatchHdr != student.__v) {
        next(
            new PreConditionFailed(
                "Resource was modified in the meantime. Cannot update"
            )
        );
        return;
    }

    let studentGuideTeam = student.guideTeams.find(
        (gt) => gt.teamId === teamId
    );

    if (studentGuideTeam === undefined) {
        next(new BadRequest(`Student is not part of this team`));
        return;
    }

    student.guideTeams = student.guideTeams.filter(
        (gt) => gt.teamId !== studentGuideTeam.teamId
    );

    const guideTeam = await GuideTeam.findById(teamId);

    await student.save();
    await auditLogHandlers.addLog(
        `Student ${student.shortform} has been removed from guide-team ${guideTeam.name}`,
        req.authenticatedUser
    );
    resp.status(200).send();
};

// PUT /api/students/:id/guideTeam/:teamId
export const addToGuideTeam = async (req, resp, next) => {
    const studentId = req.params.id;
    const teamId = req.params.teamId;
    const ifMatchHdr = req.headers["if-match"];

    if (!studentId.match(/^[0-9a-fA-F]{24}$/)) return resp.status(400).send();

    if (!ifMatchHdr) {
        next(new BadRequest(`if-match header not provided`));
        return;
    }

    logger.debug(
        `Students - Set student with id=${studentId} as guideTeam-leader of ${teamId}`
    );
    let student = await Student.findById(studentId);

    if (student === null) {
        next(new NotFound(`Student with id ${studentId} not found`));
        return;
    }

    // check if resource was modified in the meantime
    if (ifMatchHdr != student.__v) {
        next(
            new PreConditionFailed(
                "Resource was modified in the meantime. Cannot update"
            )
        );
        return;
    }

    let studentGuideTeam = student.guideTeams.find(
        (gt) => gt.teamId === teamId
    );

    if (studentGuideTeam !== undefined) {
        next(new BadRequest(`Student is already part of this team`));
        return;
    }

    student.guideTeams = [];

    let guideTeam = await GuideTeam.findById(teamId);
    if (guideTeam === null) {
        next(new BadRequest(`This guide-team doesn't exist`));
        return;
    }

    let isLeader =
        (await Student.find({"guideTeams.teamId": teamId})).length == 0;

    student.guideTeams.push({
        teamId,
        isLeader,
    });

    await student.save();
    await auditLogHandlers.addLog(
        `Student ${student.shortform} has been added to guide-team ${guideTeam.name}`,
        req.authenticatedUser
    );
    resp.status(200).json(student);
};

// PUT /api/students/:id/stationLeader/:stationId
export const setStationLeader = async (req, resp, next) => {
    const studentId = req.params.id;
    const stationId = req.params.stationId;
    const ifMatchHdr = req.headers["if-match"];

    if (!studentId.match(/^[0-9a-fA-F]{24}$/)) return resp.status(400).send();

    if (!ifMatchHdr) {
        next(new BadRequest(`if-match header not provided`));
        return;
    }

    logger.debug(
        `Students - Set student with id=${studentId} as station-leader of ${stationId}`
    );
    let student = await Student.findById(studentId);

    if (student === null) {
        next(new NotFound(`Student with id ${studentId} not found`));
        return;
    }

    // check if resource was modified in the meantime
    if (ifMatchHdr != student.__v) {
        next(
            new PreConditionFailed(
                "Student has been modified in the meantime! Refresh to be able to make changes."
            )
        );
        return;
    }

    let studentStation = student.stations.find(
        (gt) => gt.stationId === stationId
    );

    if (studentStation === undefined) {
        next(new BadRequest(`Student is not part of this station`));
        return;
    }
    if (studentStation.isLeader) {
        next(new BadRequest(`Student already is the leader of this station`));
        return;
    }

    let stationMembers = await Student.find({
        "stations.stationId": stationId,
    });
    let leader = stationMembers.find(
        (st) => st.stations.find((gt) => gt.stationId === stationId).isLeader
    );
    let oldLeaderStation = leader.stations.find(
        (gt) => gt.stationId === stationId
    );
    studentStation.isLeader = true;
    oldLeaderStation.isLeader = false;

    const station = await Station.findById(stationId);

    await student.save();
    await leader.save();
    await auditLogHandlers.addLog(
        `Student ${student.shortform} has been made team-leader of station ${station.name}`,
        req.authenticatedUser
    );
    resp.status(200).send();
};

// DELETE /api/students/:id/station/:stationId
export const removeFromStation = async (req, resp, next) => {
    const studentId = req.params.id;
    const stationId = req.params.stationId;
    const ifMatchHdr = req.headers["if-match"];

    if (!studentId.match(/^[0-9a-fA-F]{24}$/)) return resp.status(400).send();

    if (!ifMatchHdr) {
        next(new BadRequest(`if-match header not provided`));
        return;
    }

    logger.debug(
        `Students - Set student with id=${studentId} as station-leader of ${stationId}`
    );
    let student = await Student.findById(studentId);

    if (student === null) {
        next(new NotFound(`Student with id ${studentId} not found`));
        return;
    }

    // check if resource was modified in the meantime
    if (ifMatchHdr != student.__v) {
        next(
            new PreConditionFailed(
                "Student has been modified in the meantime! Refresh to be able to make changes."
            )
        );
        return;
    }

    let studentStation = student.stations.find(
        (s) => s.stationId === stationId
    );

    if (studentStation === undefined) {
        next(new BadRequest(`Student is not part of this station`));
        return;
    }
    if (studentStation.isLeader) {
        //checking if there is other people in the station apart from leader
        let students = await Student.find();
        if (
            students.filter((s) =>
                s.stations.find((s) => s.stationId === stationId)
            ).length > 1
        ) {
            next(
                new BadRequest(
                    `Cannot remove station-leader from station if there is still other members`
                )
            );
            return;
        }
    }

    student.stations = student.stations.filter(
        (gt) => gt.stationId !== studentStation.stationId
    );

    const station = await Station.findById(stationId);

    await student.save();
    await auditLogHandlers.addLog(
        `Student ${student.shortform} has been removed from station ${station.name}`,
        req.authenticatedUser
    );
    resp.status(200).send();
};

// PUT /api/students/:id/station/:stationId
export const addToStation = async (req, resp, next) => {
    const studentId = req.params.id;
    const stationId = req.params.stationId;
    const ifMatchHdr = req.headers["if-match"];

    if (!studentId.match(/^[0-9a-fA-F]{24}$/)) return resp.status(400).send();

    if (!ifMatchHdr) {
        next(new BadRequest(`if-match header not provided`));
        return;
    }

    logger.debug(
        `Students - Set student with id=${studentId} as station-leader of ${stationId}`
    );
    let student = await Student.findById(studentId);

    if (student === null) {
        next(new NotFound(`Student with id ${studentId} not found`));
        return;
    }

    // check if resource was modified in the meantime
    if (ifMatchHdr != student.__v) {
        next(
            new PreConditionFailed(
                "Student has been modified in the meantime! Refresh to be able to make changes."
            )
        );
        return;
    }

    let studentStation = student.stations.find(
        (gt) => gt.stationId === stationId
    );

    if (studentStation !== undefined) {
        next(new BadRequest(`Student is already part of this station`));
        return;
    }

    let station = await Station.findById(stationId);
    if (station === null) {
        next(new BadRequest(`This station doesn't exist`));
        return;
    }

    let isLeader =
        (await Student.find({"stations.stationId": stationId})).length == 0;

    student.stations.push({
        stationId,
        isLeader,
    });

    await student.save();
    await auditLogHandlers.addLog(
        `Student ${student.shortform} has been added to station ${station.name}`,
        req.authenticatedUser
    );
    resp.status(200).json(student);
};

// GET students/:studentId/feedback/average
export const studentAverageFeedback = async (req, res, next) => {
    const studentId = req.params.studentId;

    if (!studentId.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).send();

    let student = await Student.findById(studentId);

    if (student === null) {
        next(new NotFound(`Student with id ${studentId} not found`));
        return;
    }

    const tours = await Tour.find({guide: new ObjectId(`${studentId}`)});
    const feedbacks = tours.map(t => t.feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / t.feedbacks.length);
    const average = feedbacks.reduce((acc, curr) => {
        if (isNaN(curr)) return acc;
        return acc + curr;
    }, 0) / feedbacks.length;
    res.status(200).json({average});
}

// GET students/export
export const exportStudents = async (req, res, _next) => {
    const students = await Student.find().lean();
    const stations = await Station.find().lean();
    const guideTeams = await GuideTeam.find().lean();
    const headers = ["shortform", "firstname", "lastname", "stations", "guideTeams"];
    const studentsData = students.map(s => {
        let vals = [];
        for (let key in s) {
            if (["_id", "activity", "currentTour", "__v"].includes(key)) continue;
            if (key == "stations") {
                const studentStations = 
                    s.stations.map(st => stations.find(sta => sta._id.equals(st.stationId))?.name);
                vals.push(studentStations.join(", "))
            }
            else if (key == "guideTeams") {
                const studentTeams = 
                    s.guideTeams.map(gt => guideTeams.find(g => g._id.equals(gt.teamId))?.name)
                vals.push(studentTeams.join(", "));
            }
            else vals.push(s[key])
        }
        return vals.join("\t");
    }).join("\n");
    const csvData = headers.join("\t") +"\n" + studentsData;
    res.header('Content-Type', 'text/csv');
    res.attachment("students.csv");
    await auditLogHandlers.addLog(
        `Students' data has been exported`,
        req.authenticatedUser
    );
    return res.send(csvData);
}

export default {
    getAll,
    create,
    getById,
    updateById,
    deleteById,
    patchById,
    getTeamMembers,
    getAllTeams,
    fill,
    setGuideTeamLeader,
    removeFromGuideTeam,
    addToGuideTeam,
    setStationLeader,
    removeFromStation,
    addToStation,
    studentAverageFeedback,
    exportStudents
};
