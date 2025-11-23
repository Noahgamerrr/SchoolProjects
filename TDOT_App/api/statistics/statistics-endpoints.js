import statisticsHandler from "./statistics-handler.js";

import { restrictToRoles } from "../../middlewares/restrict-to-roles.js";
import { ROLE_ADMIN, ROLE_TEACHER } from "../../auth/roles.js";

/**
 * @param {Express} app
 * @param {(req: Request, res: Response, next: Function) => void} authJWTMiddleware
 */
export const registerStatisticsEndpoints = (app, authJWTMiddleware) => {
    app.get(
        "/api/statistics/teacher",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN, ROLE_TEACHER),
        statisticsHandler.getTeacherStatistics
    )
};