import mongoose from "mongoose";
import { logger } from "../logging/log.js";

const dbConnectTimeout = 5000;

export async function createConnection(connectionString, recreateDatabase) {
    try {
        logger.info(`DB - Setting up connection using ${connectionString}`);

        if (recreateDatabase) {
            logger.info(`DB - Start dropping current database`);
            await dropCurrentDB(connectionString);
            logger.info("DB - Current database dropped !!");
        }

        await mongoose.connect(connectionString, {
            serverSelectionTimeoutMS: dbConnectTimeout,
        });

        logger.info(`DB - Connection to ${connectionString} established.`);
    } catch (err) {
        logger.error("DB - Unable to setup connection... ", err);
        process.exit(1);
    }
}

export async function dropCurrentDB(connectionString) {
    let connection = await mongoose
        .createConnection(connectionString, {
            serverSelectionTimeoutMS: dbConnectTimeout,
        })
        .asPromise();
    await connection.dropDatabase();
}

export default {
    createConnection,
    dropCurrentDB,
};
