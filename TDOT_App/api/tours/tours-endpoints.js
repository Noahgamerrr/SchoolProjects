import { ROLE_ADMIN, ROLE_TEACHER, ROLE_TRUSTED } from "../../auth/roles.js";
import toursHandler from "./tours-handlers.js";
import { restrictToRoles } from "../../middlewares/restrict-to-roles.js";

/**
 * @param {Express} app
 * @param {(req: Request, res: Response, next: Function) => void} authJWTMiddleware
 */
export const registerToursEndpoints = (app, authJWTMiddleware) => {
    /*
    //Guide endpoints

    app.get(
        "/api/guides/me/tours",
        authJWTMiddleware,
        restrictToRoles(ROLE_GUIDE),
        toursHandler.getAllByGuide
    );
     
    app.post(
        "/api/guides/me/tours",
        authJWTMiddleware,
        restrictToRoles(ROLE_GUIDE),
        toursHandler.createByGuide
    );

    app.patch(
        "/api/guides/:guideId/tours/:tourId",
        authJWTMiddleware,
        restrictToRoles(ROLE_GUIDE),
        toursHandler.editByGuide
    );
    
    app.delete(
        "/api/guides/:guideId/tours/:tourId",
        authJWTMiddleware,
        restrictToRoles(ROLE_GUIDE),
        toursHandler.deleteByGuide
    );
    //Admin endpoints

    
    */

    app.get(
        "/api/tours",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN, ROLE_TEACHER),
        toursHandler.getAll
    );

    app.get(
        "/api/tours/notVerified",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN, ROLE_TEACHER, ROLE_TRUSTED),
        toursHandler.getNotVerified
    );

    app.post(
        "/api/tours",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN, ROLE_TEACHER),
        toursHandler.create
    );

    app.get(
        "/api/tours/:id",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN, ROLE_TEACHER, ROLE_TRUSTED),
        toursHandler.getOne
    );

    app.get(
        "/api/datahandover/:identifier",
        toursHandler.getHandover
    )

    app.put(
        "/api/tours/:id",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN, ROLE_TEACHER),
        toursHandler.update
    );


    app.delete(
        "/api/tours/:id",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN, ROLE_TEACHER, ROLE_TRUSTED),
        toursHandler.remove
    );

    app.post(
        "/api/tours/:id/end",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN, ROLE_TEACHER),
        toursHandler.endTour
    );

    app.get(
        "/api/tours/:id/stations",
        // No authentication because this endpoint is needed for feedback
        toursHandler.getTourStations
    );


    app.post(
        "/api/tours/:id/stations",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN, ROLE_TEACHER),
        toursHandler.addTourStation
    );

    app.delete(
        "/api/tours/:id/stations/:stationId",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN, ROLE_TEACHER),
        toursHandler.removeTourStation
    );

    app.get(
        "/api/tours/:id/visitors",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN, ROLE_TEACHER),
        toursHandler.getTourVisitors
    );

    app.post(
        "/api/tours/:id/visitors",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN, ROLE_TEACHER, ROLE_TRUSTED),
        toursHandler.addTourVisitor
    );

    app.delete(
        "/api/tours/:id/visitors/:visitorId",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN, ROLE_TEACHER, ROLE_TRUSTED),
        toursHandler.removeTourVisitor
    );

    app.get(
        "/api/tours/:id/visitors/:visitorId",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN, ROLE_TEACHER),
        toursHandler.getTourVisitorById
    );

    app.get(
        "/api/tours/:id/feedback",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN, ROLE_TEACHER),
        toursHandler.getTourFeedback
    );

    app.post("/api/tours/:id/feedback", toursHandler.addTourFeedback);

    app.get(
        "/api/tours/:id/feedback/average",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN, ROLE_TEACHER),
        toursHandler.getTourFeedbackAverage
    );

    app.delete(
        "/api/tours/:id/feedback/:feedbackId",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN, ROLE_TEACHER),
        toursHandler.removeTourFeedbackById
    );

    app.put(
        "/api/tours/:tourId/registerVisitors",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN, ROLE_TEACHER, ROLE_TRUSTED),
        toursHandler.registerVisitors
    );

    app.put(
        "/api/tours/:tourId/verify",
        authJWTMiddleware,
        restrictToRoles(ROLE_ADMIN, ROLE_TEACHER, ROLE_TRUSTED),
        toursHandler.verify
    );


};