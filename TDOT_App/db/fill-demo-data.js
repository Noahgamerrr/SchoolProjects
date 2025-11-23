import fsp from "fs/promises";

import mongoose from "mongoose";

import DEFAULTS from "../config/defaults.json" with { type: "json" };
import { logger } from "../logging/log.js";
import database from "./database.js";
import { EJSON } from "bson";
import { Openday } from "../api/opendays/opendays-model.js";
import { Station } from "../api/stations/stations-model.js";
import { Student } from "../api/students/students-model.js";
import { GuideTeam } from "../api/guide-teams/guide-teams-model.js";
import { StationFeedback } from "../api/feedback/station-feedback-model.js";
import { Visitor } from "../api/visitors/visitors-model.js";
import { Tour } from "../api/tours/tours-model.js";
import { NotificationPreferences } from "../api/notifications/notifications-model.js";
import {
    populateModels,
    setActiveOpenday,
} from "../api/opendays/opendays-switcher.js";

const MONGODB_CONNECTION_STRING =
    process.env.MONGODB_CONNECTION_STRING || DEFAULTS.MONGODB_CONNECTION_STRING;

fillDatabase().then(() => logger.info("Finished filling database!"));

async function fillDatabase() {
    await database.createConnection(MONGODB_CONNECTION_STRING, true);
    logger.info("Starting filling database with demo data...");

    await database.dropCurrentDB(MONGODB_CONNECTION_STRING);
    await fillData("./data/opendays.json", Openday);
    await setActiveOpenday(await Openday.findOne({ active: true }));
    await populateModels();
    await fillData("./data/stations.json", Station);
    await fillData("./data/guide-teams.json", GuideTeam);
    await fillData("./data/students.json", Student);
    await fillData("./data/feedback.json", StationFeedback);
    await fillData("./data/visitors.json", Visitor);
    await fillData("./data/tours.json", Tour);
    await fillData(
        "./data/notificationPreferences.json",
        NotificationPreferences
    );
    // and so on ...

    await mongoose.disconnect();
}

/**
 * Fills the database with data from the given file
 * @param {string} path
 * @param {mongoose.Model} model
 * @returns {Promise<void>}
 */
async function fillData(path, model) {
    let allData = EJSON.parse((await fsp.readFile(path)).toString());
    const allCreationJobs = [];

    for (let od of allData) {
        allCreationJobs.push(model.create(od));
    }

    const results = await Promise.allSettled(allCreationJobs);
    const successCnt = results.filter(
        (job) => job.status === "fulfilled"
    ).length;
    const errorCnt = results.filter((job) => job.status === "rejected").length;
    logger.info(
        `${model.modelName} data - ${successCnt} successfully imported, ${errorCnt} contain errors`
    );
}
