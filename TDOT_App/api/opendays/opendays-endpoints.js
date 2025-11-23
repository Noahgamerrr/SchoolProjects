import { ROLE_ADMIN, ROLE_PUPIL, ROLE_TEACHER, ROLE_TEAMLEAD } from "../../auth/roles.js";
import opendaysHandler from "./opendays-handlers.js";
import { restrictToRoles } from "../../middlewares/restrict-to-roles.js";

/**
 * @param {Express} app
 * @param {(req: Request, res: Response, next: Function) => void} authJWTMiddleware
 */
export const registerOpendaysEndpoints = (app, authJWTMiddleware) => {
    app.get(
        "/api/opendays",
        authJWTMiddleware,
        restrictToRoles(ROLE_PUPIL, ROLE_TEACHER, ROLE_ADMIN, ROLE_TEAMLEAD),
        opendaysHandler.getAll
    );

    app.post(
        "/api/opendays",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN),
        opendaysHandler.create
    );

    app.get(
        "/api/opendays/active",
        authJWTMiddleware,
        restrictToRoles(ROLE_PUPIL, ROLE_TEACHER, ROLE_ADMIN, ROLE_TEAMLEAD),
        opendaysHandler.getActive
    );
    
    app.patch(
        "/api/opendays/active/stationsOrder",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN),
        opendaysHandler.reorderStations
    )

    app.get(
        "/api/opendays/:id",
        authJWTMiddleware,
        restrictToRoles(ROLE_PUPIL, ROLE_TEACHER, ROLE_ADMIN, ROLE_TEAMLEAD),
        opendaysHandler.getOne
    );

    app.delete(
        "/api/opendays/:id",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN),
        opendaysHandler.remove
    );

    app.put(
        "/api/opendays/:id",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN),
        opendaysHandler.update
    );

    app.patch(
        "/api/opendays/:id",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN),
        opendaysHandler.setActive
    );

    app.patch(
        "/api/opendays/lock/:id",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN),
        opendaysHandler.lock
    );
};
