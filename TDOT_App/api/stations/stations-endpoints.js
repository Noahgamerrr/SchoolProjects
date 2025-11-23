import feedbackHandler from "../feedback/station-feedback-handlers.js";

import stationsHandler from "./stations-handlers.js";
import { restrictToRoles } from "../../middlewares/restrict-to-roles.js";
import { ROLE_ADMIN } from "../../auth/roles.js";

/**
 * @param {Express} app
 * @param {(req: Request, res: Response, next: Function) => void} authJWTMiddleware
 */
export const registerStationsEndpoints = (app, authJWTMiddleware) => {
    app.get(
        "/api/stations/:id" /* auth removed due to feedback needing this
                                    authJWTMiddleware,
                                    restrictToRoles(
                                        ROLE_ADMIN,
                                        ROLE_WORKER,
                                        ROLE_APPOWNER,
                                        ROLE_GUIDE,
                                        ROLE_PUPIL,
                                        ROLE_STATIONWORKER,
                                        ROLE_TEACHER,
                                        ROLE_TEAMLEAD
                                    ), */,
        stationsHandler.getById,
    );

    app.get("/api/stations", authJWTMiddleware, stationsHandler.getAll);
    app.get("/api/stations/:id/members", authJWTMiddleware, stationsHandler.getStudentsById);

    app.put(
        "/api/stations/:id",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN),
        stationsHandler.updateById,
    );
    app.post(
        "/api/stations",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN),
        stationsHandler.create,
    );
    app.delete(
        "/api/stations/:id",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN),
        stationsHandler.deleteById,
    );
    app.get(
        "/api/stations/:id/teamLeader",
        authJWTMiddleware,
        stationsHandler.getTeamLeader,
    );

    app.post("/api/stations/:id/feedback", feedbackHandler.create);

    app.get(
        "/api/stations/:id/feedback/average",
        authJWTMiddleware,
        feedbackHandler.getAverageForStation,
    );

    app.get(
        "/api/stations/:id/feedback",
        authJWTMiddleware,
        feedbackHandler.getAllForStation,
    );

    app.delete(
        "/api/stations/:station_id/feedback/:feedback_id",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN),
        feedbackHandler.remove,
    );
};