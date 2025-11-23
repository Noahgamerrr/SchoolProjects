import {
    ROLE_ADMIN,
    ROLE_TEAMLEAD,
    ROLE_TEACHER,
    ROLE_PUPIL,
} from "../../auth/roles.js";
import studentsHandler from "./students-handlers.js";
import { restrictToRoles } from "../../middlewares/restrict-to-roles.js";
import toursHandlers from "../tours/tours-handlers.js";
import { studentOwnEndpoint } from "../../middlewares/student-own-endpoint.js";

/**
 * @param {Express} app
 * @param {(req: Request, res: Response, next: Function) => void} authJWTMiddleware
 */
export const registerStudentsEndpoints = (app, authJWTMiddleware) => {
    app.get(
        "/api/students/:studentId/feedback/average",
        studentsHandler.studentAverageFeedback
    );

    app.use("/api/students", authJWTMiddleware);

    app.get(
        "/api/students/export",
        restrictToRoles(ROLE_ADMIN),
        studentsHandler.exportStudents
    );

    app.get(
        "/api/students/:shortform/teamMembers",
        restrictToRoles(ROLE_TEAMLEAD, ROLE_ADMIN),
        studentsHandler.getTeamMembers
    );

    app.get("/api/students", studentsHandler.getAll);
    app.get(
        "/api/students/teams",
        restrictToRoles(ROLE_TEACHER, ROLE_ADMIN),
        studentsHandler.getAllTeams
    );
    app.get("/api/students/:id", studentsHandler.getById);
    app.post("/api/students", studentOwnEndpoint(), studentsHandler.create);
    app.put(
        "/api/students/:id",
        restrictToRoles(ROLE_PUPIL, ROLE_TEACHER, ROLE_ADMIN, ROLE_TEAMLEAD),
        studentsHandler.updateById
    );
    app.put(
        "/api/students/:id/guideLeader/:teamId",
        restrictToRoles(ROLE_ADMIN),
        studentsHandler.setGuideTeamLeader
    );
    app.put(
        "/api/students/:id/guideTeam/:teamId",
        restrictToRoles(ROLE_ADMIN),
        studentsHandler.addToGuideTeam
    );
    app.delete(
        "/api/students/:id/guideTeam/:teamId",
        restrictToRoles(ROLE_ADMIN),
        studentsHandler.removeFromGuideTeam
    );
    app.put(
        "/api/students/:id/stationLeader/:stationId",
        restrictToRoles(ROLE_ADMIN),
        studentsHandler.setStationLeader
    );
    app.put(
        "/api/students/:id/station/:stationId",
        restrictToRoles(ROLE_ADMIN),
        studentsHandler.addToStation
    );
    app.delete(
        "/api/students/:id/station/:stationId",
        restrictToRoles(ROLE_ADMIN),
        studentsHandler.removeFromStation
    );
    app.patch(
        "/api/students/:id",
        restrictToRoles(ROLE_ADMIN),
        studentsHandler.patchById
    );
    app.delete(
        "/api/students/:id",
        restrictToRoles(ROLE_ADMIN),
        studentsHandler.deleteById
    );
    app.post(
        "/api/students/fill",
        restrictToRoles(ROLE_ADMIN),
        studentsHandler.fill
    );
    app.get(
        "/api/students/:studentId/tours",
        studentOwnEndpoint("studentId"),
        toursHandlers.getAll
    );
    app.get(
        "/api/students/:studentId/currentTour",
        studentOwnEndpoint("studentId"),
        toursHandlers.getCurrent
    );
    app.post(
        "/api/students/:studentId/tours",
        studentOwnEndpoint("studentId"),
        toursHandlers.create
    );
    app.get(
        "/api/students/:studentId/tours/:id",
        studentOwnEndpoint("studentId"),
        toursHandlers.getOne
    );
    app.put(
        "/api/students/:studentId/tours/:id",
        studentOwnEndpoint("studentId"),
        toursHandlers.update
    );

    app.post(
        "/api/students/:studentId/tours/:id/priority/:priorityId",
        studentOwnEndpoint("studentId"),
        toursHandlers.prioritizeIDCurrentTour
    );

    app.post(
        "/api/students/:studentId/tours/:id/end",
        studentOwnEndpoint("studentId"),
        toursHandlers.endTour
    );
    app.post(
        "/api/students/:studentId/tours/:id/stations",
        studentOwnEndpoint("studentId"),
        toursHandlers.addTourStation
    );
    app.delete(
        "/api/students/:studentId/tours/:id/stations/:stationId",
        studentOwnEndpoint("studentId"),
        toursHandlers.removeTourStation
    );
    app.get(
        "/api/students/:studentId/tours/:id/visitors",
        studentOwnEndpoint("studentId"),
        toursHandlers.getTourVisitors
    );
    app.post(
        "/api/students/:studentId/tours/:id/visitors",
        studentOwnEndpoint("studentId"),
        toursHandlers.addTourVisitor
    );
    app.delete(
        "/api/students/:studentId/tours/:id/visitors",
        studentOwnEndpoint("studentId"),
        toursHandlers.removeTourVisitor
    );
    app.get(
        "/api/students/:studentId/tours/:id/visitors/:visitorId",
        studentOwnEndpoint("studentId"),
        toursHandlers.getTourVisitorById
    );
    app.get(
        "/api/students/:studentId/tours/:id/feedback",
        studentOwnEndpoint("studentId"),
        toursHandlers.getTourFeedback
    );
    app.post(
        "/api/students/:studentId/tours/:id/feedback",
        studentOwnEndpoint("studentId"),
        toursHandlers.addTourFeedback
    );
    app.get(
        "/api/students/:studentId/tours/:id/feedback/average",
        studentOwnEndpoint("studentId"),
        toursHandlers.getTourFeedbackAverage
    );
    app.put(
        "/api/students/:studentId/tours/:tourId/registerVisitors",
        studentOwnEndpoint("studentId"),
        toursHandlers.registerVisitors
    );
};
