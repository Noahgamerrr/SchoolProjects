import mongoose from "mongoose";
import * as auditLog from "../audit-log/audit-log-model.js";
import * as guideTeams from "../guide-teams/guide-teams-model.js";
import * as stationFeedback from "../feedback/station-feedback-model.js";
import * as notificationPreferences from "../notifications/notifications-model.js";
import * as stations from "../stations/stations-model.js";
import * as students from "../students/students-model.js";
import * as tours from "../tours/tours-model.js";
import * as visitors from "../visitors/visitors-model.js";
import { Openday } from "./opendays-model.js";
import { logger } from "../../logging/log.js";

let _activeOpendayId = null;

export const getActiveOpendayId = async () => {
    if (!_activeOpendayId) {
        _activeOpendayId = (
            await Openday.findOne(
                {
                    active: true,
                },
                { _id: 1 }
            )
        )?._id?.toString();
    }
    return _activeOpendayId;
};

export const setActiveOpenday = async (openday) => {
    await Openday.findOneAndUpdate({ active: true }, { active: false });
    const od = await Openday.findByIdAndUpdate(openday._id, {
        active: true,
    });

    _activeOpendayId = od._id.toString();

    await populateModels();

    return od;
};

export const getCollectionName = async (baseName) => {
    return `${await getActiveOpendayId()}/${baseName}`;
};

export const populateModels = async () => {
    logger.debug("Populating models with active openday " + _activeOpendayId);
    auditLog.replaceModel(
        mongoose.model(
            "auditLog",
            auditLog.auditLogSchema,
            await getCollectionName("auditLog")
        )
    );
    guideTeams.replaceModel(
        mongoose.model(
            "guideTeams",
            guideTeams.guideTeamsSchema,
            await getCollectionName("guideTeams")
        )
    );
    stationFeedback.replaceModel(
        mongoose.model(
            "stationFeedback",
            stationFeedback.stationFeedbackSchema,
            await getCollectionName("stationFeedback")
        )
    );
    notificationPreferences.replaceModel(
        mongoose.model(
            "notificationPrefs",
            notificationPreferences.notificationPrefsSchema,
            await getCollectionName("notificationPrefs")
        )
    );
    stations.replaceModel(
        mongoose.model(
            "stations",
            stations.stationsSchema,
            await getCollectionName("stations")
        )
    );
    students.replaceModel(
        mongoose.model(
            "students",
            students.studentSchema,
            await getCollectionName("students")
        )
    );
    tours.replaceModel(
        mongoose.model(
            "tours",
            tours.tourSchema,
            await getCollectionName("tours")
        )
    );
    visitors.replaceModel(
        mongoose.model(
            "visitors",
            visitors.visitorSchema,
            await getCollectionName("visitors")
        )
    );
};
