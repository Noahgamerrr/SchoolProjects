import { ROLE_ADMIN, ROLE_GUIDE, ROLE_TEACHER } from "../../auth/roles.js";
import { restrictToRoles } from "../../middlewares/restrict-to-roles.js";
import {
    acceptRequest,
    getGuideRequests,
    rejectRequest,
} from "./guide-request.js";
import {
    sendNotification,
    subscribeToProvider,
    unsubscribeFromProvider,
    getProviderSettings,
    testNotificationProvider,
    requestGuides,
    getPendingResponses,
    sendResponse,
} from "./notifications-handlers.js";

/**
 * @param {Express} app
 * @param {(req: Request, res: Response, next: Function) => void} authJWTMiddleware
 */
export const registerNotificationsEndpoints = (app, authJWTMiddleware) => {
    app.post(
        "/api/notifications",
        authJWTMiddleware,
        restrictToRoles(ROLE_TEACHER, ROLE_ADMIN),
        sendNotification
    );

    app.post(
        "/api/notifications/guiderequest",
        authJWTMiddleware,
        restrictToRoles(ROLE_TEACHER, ROLE_ADMIN),
        requestGuides
    );

    app.post(
        "/api/notifications/responses",
        authJWTMiddleware,
        sendResponse
    )

    app.post(
        "/api/notifications/providers/:provider/test",
        authJWTMiddleware,
        testNotificationProvider
    );

    app.put(
        "/api/notifications/providers/:provider",
        authJWTMiddleware,
        subscribeToProvider
    );

    app.delete(
        "/api/notifications/providers/:provider",
        authJWTMiddleware,
        unsubscribeFromProvider
    );

    app.get(
        "/api/notifications/responses/pending",
        authJWTMiddleware,
        getPendingResponses
    )

    app.get(
        "/api/notifications/providers",
        authJWTMiddleware,
        getProviderSettings
    );

    app.post(
        "/api/notifications/accept",
        authJWTMiddleware,
        restrictToRoles(ROLE_GUIDE),
        async (req, res) => {
            try {
                if (await acceptRequest(req.body.g, req.body.r)) {
                    res.sendStatus(200);
                } else {
                    res.sendStatus(400);
                }
            } catch (e) {
                res.sendStatus(400);
            }
        }
    );

    app.post(
        "/api/notifications/reject",
        authJWTMiddleware,
        restrictToRoles(ROLE_GUIDE),
        async (req, res) => {
            try {
                if (
                    await rejectRequest(
                        req.get("origin"),
                        req.body.g,
                        req.body.r
                    )
                ) {
                    res.sendStatus(200);
                } else {
                    res.sendStatus(400);
                }
            } catch {
                res.sendStatus(400);
            }
        }
    );

    app.get(
        "/api/notifications/guiderequest",
        authJWTMiddleware,
        restrictToRoles(ROLE_TEACHER, ROLE_ADMIN),
        async (req, res) => {
            res.status(200).json(await getGuideRequests());
        }
    );
};
