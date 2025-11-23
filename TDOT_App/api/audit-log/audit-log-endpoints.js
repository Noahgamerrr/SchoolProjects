import { ROLE_ADMIN, ROLE_TEACHER } from "../../auth/roles.js";
import { getAll } from "./audit-log-handlers.js";
import { restrictToRoles } from "../../middlewares/restrict-to-roles.js";

/**
 * @param {Express} app
 * @param {(req: Request, res: Response, next: Function) => void} authJWTMiddleware
 */
export const registerAuditLogEndpoints = (app, authJWTMiddleware) => {
    app.get("/api/audit-log", 
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN, ROLE_TEACHER),
        getAll);
};