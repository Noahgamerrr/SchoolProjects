import { ROLE_ADMIN, ROLE_TEACHER, ROLE_TRUSTED } from "../../auth/roles.js";
import visitorsHandler from "./visitors-handlers.js";
import { restrictToRoles } from "../../middlewares/restrict-to-roles.js";

/**
 * @param {Express} app
 * @param {(req: Request, res: Response, next: Function) => void} authJWTMiddleware
 */
export const registerVisitorsEndpoints = (app, authJWTMiddleware) => {
    app.get("/api/visitors",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN),
        visitorsHandler.getAll,
    );
    app.get("/api/visitors/:id", visitorsHandler.getOne);
    app.post(
        "/api/visitors",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN, ROLE_TEACHER, ROLE_TRUSTED),
        visitorsHandler.create,
    );
    app.put(
        "/api/visitors/:id",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN, ROLE_TEACHER, ROLE_TRUSTED),
        visitorsHandler.update,
    );
    app.delete(
        "/api/visitors/:id",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN, ROLE_TEACHER, ROLE_TRUSTED),
        visitorsHandler.remove,
    );
};