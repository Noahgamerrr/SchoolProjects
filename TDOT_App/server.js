"use strict";

/* ***************** IMPORT packages *********************** */
import express from "express";
import http from "http";
import path from "path";
import dotenv from "dotenv";

/* ***************** IMPORT LIBS *************************** */
import { logger } from "./logging/log.js";
import database from "./db/database.js";
import {
    ROLE_ADMIN,
    ROLE_WORKER,
    ROLE_APPOWNER,
    ROLE_GUIDE,
    ROLE_PUPIL,
    ROLE_STATIONWORKER,
    ROLE_TEACHER,
    ROLE_TEAMLEAD,
} from "./auth/roles.js";
import { fileURLToPath } from "url";
import DEFAULTS from "./config/defaults.json" with { type: "json" };

/* ***************** IMPORT MIDDLEWARES ******************** */
import { createAuthJWTMiddleware } from "./middlewares/auth-jwt-entraid.js";
import { errorHandler } from "./middlewares/error-handling.js";

/* ***************** IMPORT REQUEST-HANDLER **************** */
import { registerToursEndpoints } from "./api/tours/tours-endpoints.js";
import { registerStationsEndpoints } from "./api/stations/stations-endpoints.js";
import { registerGuideTeamsEndpoints } from "./api/guide-teams/guide-teams-endpoints.js";
import { registerStudentsEndpoints } from "./api/students/students-endpoints.js";
import { registerOpendaysEndpoints } from "./api/opendays/opendays-endpoints.js";
import { registerStatisticsEndpoints } from "./api/statistics/statistics-endpoints.js";
import { registerVisitorsEndpoints } from "./api/visitors/visitors-endpoints.js";
import { registerAuditLogEndpoints } from "./api/audit-log/audit-log-endpoints.js";
import { registerNotificationsEndpoints } from "./api/notifications/notifications-endpoints.js";
import { registerClientSideRouting } from "./middlewares/client-side-routing.js";
import { populateModels } from "./api/opendays/opendays-switcher.js";
import { createTerminus } from "@godaddy/terminus";
import mongoose from "mongoose";

/* ***************** CONFIG and CONSTS ********************* */
/* Take configuration from environment variables or use hardcoded default value */
const HOSTNAME = "0.0.0.0";
const PORT = process.env.PORT || DEFAULTS.PORT;

dotenv.config();

const MONGODB_CONNECTION_STRING =
    process.env.MONGODB_CONNECTION_STRING || DEFAULTS.MONGODB_CONNECTION_STRING;
const MONGODB_RECREATE = process.env.MONGODB_RECREATE === "true";

const DANGEROUS_DEV_BYPASS_AUTH =
    process.env.DANGEROUS_DEV_BYPASS_AUTH === "true";

const TENANT_ID =
    process.env.TENANT_ID || "2b197efa-8e1b-4680-b263-8e237889b5b3";
const APP_ID = process.env.APP_ID || "a1658179-9772-4ce1-9f31-1a181f5ecc70";

// if not explicitly set to false do verification
const AUTHJWT_VERIFY = process.env.AUTHJWT_VERIFY !== "false";

/* ***************** START UP ******************************* */
logger.info("Backend - Starting configuration...");

const app = express();
app.use(
    express.json({ type: ["application/json", "application/merge-patch+json"] })
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// use build folder of vite as static directory
app.use(express.static(path.join(__dirname, "client", "dist")));

// authorization is activated once tenant and application id is configured
if (TENANT_ID && APP_ID) {
    logger.info(
        `Backend - using authorization based on JWT using TENANT_ID=${TENANT_ID} and APP_ID=${APP_ID}`
    );
    const authJWTMiddleware =
        DANGEROUS_DEV_BYPASS_AUTH ?
            (req, res, next) => {
                req.roles = [
                    ROLE_ADMIN,
                    ROLE_WORKER,
                    ROLE_APPOWNER,
                    ROLE_GUIDE,
                    ROLE_PUPIL,
                    ROLE_STATIONWORKER,
                    ROLE_TEACHER,
                    ROLE_TEAMLEAD,
                ];
                req.authenticatedUser = req.header("x-test-user");
                res.locals.authJwtMiddlewareHandled = true;
                next();
            }
        :   createAuthJWTMiddleware(AUTHJWT_VERIFY, TENANT_ID, APP_ID);

    registerOpendaysEndpoints(app, authJWTMiddleware);

    registerNotificationsEndpoints(app, authJWTMiddleware);

    registerStationsEndpoints(app, authJWTMiddleware);

    registerStudentsEndpoints(app, authJWTMiddleware);

    registerGuideTeamsEndpoints(app, authJWTMiddleware);

    registerToursEndpoints(app, authJWTMiddleware);

    registerVisitorsEndpoints(app, authJWTMiddleware);

    registerStatisticsEndpoints(app, authJWTMiddleware);

    registerAuditLogEndpoints(app, authJWTMiddleware);
}

registerClientSideRouting(app);

app.use(errorHandler);

// create HTTP server
logger.info("Backend - Starting up ...");
const httpServer = http.createServer(app);

// establish DB connection (app crashes if connect to db fails)
database.createConnection(MONGODB_CONNECTION_STRING, MONGODB_RECREATE);

populateModels();

function healthCheck() {
    const { readyState } = mongoose.connection;
    if (readyState === 0 || readyState === 3) {
        return Promise.reject(new Error("Mongoose has disconnected"));
    }
    if (readyState === 2) {
        return Promise.reject(new Error("Mongoose is connecting"));
    }
    return Promise.resolve();
}

function liveCheck() {
    return Promise.resolve();
}

const options = {
    healthChecks: {
        "/health": healthCheck,
        "/live": liveCheck,
    },
    signal: "SIGINT",
    logger: logger.error,
};

createTerminus(httpServer, options);

// start listening to HTTP requests
httpServer.listen(PORT, HOSTNAME, () => {
    logger.info(`Backend - Running on port ${PORT}...`);
});

export default httpServer;
