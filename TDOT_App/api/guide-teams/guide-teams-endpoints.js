import { ROLE_ADMIN } from "../../auth/roles.js";
import guideTeamHandler from "./guide-teams-handlers.js";
import { restrictToRoles } from "../../middlewares/restrict-to-roles.js";

/**
 * @param {Express} app
 * @param {(req: Request, res: Response, next: Function) => void} authJWTMiddleware
 */
export const registerGuideTeamsEndpoints = (app, authJWTMiddleware) => {
    app.get("/api/guide-teams", guideTeamHandler.getAll);
    app.get("/api/guide-teams/:id", guideTeamHandler.getById);
    app.get("/api/guide-teams/:id/members", guideTeamHandler.getStudentsById);
    app.post(
        "/api/guide-teams",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN),
        guideTeamHandler.create,
    );
    app.put(
        "/api/guide-teams/:id",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN),
        guideTeamHandler.updateById,
    );
    app.delete(
        "/api/guide-teams/:id",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN),
        guideTeamHandler.deleteById,
    );
};