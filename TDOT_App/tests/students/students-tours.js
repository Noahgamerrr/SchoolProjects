import request from "supertest";
import { dropDatabase } from "../util.js";
import server from "../../server.js";
import assert from "assert";
import {
    validStudent,
    getStudent,
    initializeStudentsAndStation,
    addStation,
    addStudent,
    anotherValidStudent,
    getAllStudents,
    validStation,
    updateOpenday
} from "./common.js";
import { getValidTour, insertTestOpenday } from "../tours.js";
import { Openday } from "../../api/opendays/opendays-model.js";
import { Visitor } from "../../api/visitors/visitors-model.js";
import { Student } from "../../api/students/students-model.js";

describe("Student Tours - Tests", () => {
    beforeEach(async () => {
        await dropDatabase();
        let od = await insertTestOpenday();
        assert.notStrictEqual(od, null);
    });

    it("GET /students/:studentId/tours - No tours", async () => {
        // GET /api/students/:studentId/tours

        let student = await addStudent(request(server), validStudent);
        await request(server)
            .get(`/api/students/${student}/tours`)
            .expect(200)
            .expect([]);
    });

    it("Create and retrieve tour via student endpoint", async () => {
        // GET /api/students/:studentId/tours
        // GET /api/students/:studentId/tours/:id
        // POST /api/students/:studentId/tours

        await request(server)
            .post("/api/opendays")
            .send({ date: "2022-12-24" });

        let student = await addStudent(request(server), validStudent);

        let tour = { ...(await getValidTour()), guide: student };

        let resp = await request(server)
            .post(`/api/students/${student}/tours`)
            .send(tour)
            .expect(201);

        assert.strictEqual(resp.body.openday, tour.openday);
        assert.strictEqual(resp.body.guide, student);

        await request(server)
            .post(`/api/students/${student}/tours`)
            .send(tour)
            .expect(400);

        let studentAfter = await request(server)
            .get(`/api/students/${student}`)
            .expect(200);

        //check activity change
        assert.strictEqual(
            studentAfter._body.activity.find((a) => a.activity == "tour") !=
                null,
            true
        );

        let allTours = await request(server)
            .get(`/api/students/${student}/tours`)
            .expect(200);

        assert.strictEqual(allTours.body.length, 1);
        assert.strictEqual(allTours.body[0]._id, resp.body._id);
        //check current tour setting
        assert.strictEqual(studentAfter._body.currentTour, resp.body._id);
        let tourById = await request(server)
            .get(`/api/students/${student}/tours/${resp.body._id}`)
            .expect(200);

        assert.strictEqual(tourById.body._id, resp.body._id);

        await request(server)
            .put(`/api/students/${student}/tours/${resp.body._id}`)
            .send({
                ...tour,
                endTime: new Date(
                    new Date(tour.startTime).getTime() + 1000000
                ).toISOString(),
            })
            .expect(204);

        let endResp = await request(server)
            .post(`/api/students/${student}/tours/${resp.body._id}/end`)
            .expect(403);
    });

    it("Register visitors to tour", async () => {
        let student = await addStudent(request(server), validStudent);

        let tour = {
            ...(await getValidTour()),
            guide: student,
            endTime: undefined,
            visitors: [],
        };

        let visitor1 = await request(server).post("/api/visitors").send({
            name: "Gernot Oberlerchner",
            email: null,
            address: null,
            phone: "+43 692 3456947",
            grade: 4,
        });
        let visitor2 = await request(server).post("/api/visitors").send({
            name: "Hass Lacher",
            email: "heheheha@test.at",
            address: "Maximilianstraße 1, 9900 Lienz",
            phone: "+43 123 456789",
            grade: 2,
        });

        let visitors = [visitor1, visitor2];

        // Start tour
        let resp = await request(server)
            .post(`/api/students/${student}/tours`)
            .send(tour)
            .expect(201);

        //Register visitors --- tour will automatically be verified.
        let registerResp = await request(server)
            .put(`/api/tours/${resp.body._id}/registerVisitors`)
            .send(visitors)
            .expect(200);

        assert.strictEqual(registerResp.body.visitors.length, 2);
        assert.strictEqual(registerResp.body.verified, true);
    });

    it("Register visitors to tour by guide", async () => {
        let student = await addStudent(request(server), validStudent);

        let tour = {
            ...(await getValidTour()),
            guide: student,
            endTime: undefined,
            visitors: [],
        };

        let visitor1 = await request(server).post("/api/visitors").send({
            name: "Gernot Oberlerchner",
            email: null,
            address: null,
            phone: "+43 692 3456947",
            grade: 4,
        });
        let visitor2 = await request(server).post("/api/visitors").send({
            name: "Hass Lacher",
            email: "heheheha@test.at",
            address: "Maximilianstraße 1, 9900 Lienz",
            phone: "+43 123 456789",
            grade: 2,
        });

        let visitors = [visitor1, visitor2];

        // Start tour
        let resp = await request(server)
            .post(`/api/students/${student}/tours`)
            .send(tour)
            .expect(201);

        //Register visitors --- tour will automatically be verified.
        let registerResp = await request(server)
            .put(
                `/api/students/${student}/tours/${resp.body._id}/registerVisitors`
            )
            .send(visitors)
            .expect(200);

        assert.strictEqual(registerResp.body.visitors.length, 2);
        assert.strictEqual(registerResp.body.verified, false);
    });

    it("Simulated tour with stations", async () => {
        let od = await Openday.findOne({ active: true });
        assert.notStrictEqual(od, null);

        assert.strictEqual(await Visitor.countDocuments(), 0);
        assert.strictEqual(await Student.countDocuments(), 0);

        let student = await addStudent(request(server), validStudent);

        let tour = {
            ...(await getValidTour()),
            guide: student,
            endTime: undefined,
        };
        let stations = tour.stations;
        tour.stations = undefined;
        let visitors = tour.visitors;
        tour.visitors = [];

        // Start tour
        let resp = await request(server)
            .post(`/api/students/${student}/tours`)
            .send(tour)
            .expect(201);

        // Add visitor 1
        let visitor1 = await request(server)
            .post(`/api/students/${student}/tours/${resp.body._id}/visitors`)
            .send({ visitor: visitors[0] })
            .expect(204);

        // Add visitor 2
        let visitor2 = await request(server)
            .post(`/api/students/${student}/tours/${resp.body._id}/visitors`)
            .send({ visitor: visitors[1] })
            .expect(204);

        // Visit first station, but don't put a time
        let visit1 = {
            id: stations[0].id,
        };
        let visitResp = await request(server)
            .post(`/api/students/${student}/tours/${resp.body._id}/stations`)
            .send(visit1)
            .expect(204);

        // Visit second station from 11:00 to 12:00
        let visit2 = {
            id: stations[1].id,
            time: {
                start: new Date("2021-01-01T11:00:00Z"),
                end: new Date("2021-01-01T12:00:00Z"),
            },
        };
        visitResp = await request(server)
            .post(`/api/students/${student}/tours/${resp.body._id}/stations`)
            .send(visit2)
            .expect(204);

        // Delete first visit
        let deleteResp = await request(server)
            .delete(
                `/api/students/${student}/tours/${resp.body._id}/stations/${visit1.id}`
            )
            .send(visit1)
            .expect(204);

        // Get all visits
        let stationsResp = await request(server)
            .get(`/api/students/${student}/tours/${resp.body._id}`)
            .expect(200);

        assert.strictEqual(stationsResp.body.stations.length, 1);
        assert.strictEqual(stationsResp.body.stations[0].id, visit2.id);
        assert.strictEqual(
            stationsResp.body.stations[0].time.start,
            visit2.time.start.toISOString()
        );
        assert.strictEqual(
            stationsResp.body.stations[0].time.end,
            visit2.time.end.toISOString()
        );

        // End tour
        let endResp = await request(server)
            .post(`/api/students/${student}/tours/${resp.body._id}/end`)
            .expect(204);

        let notVerifiedResp = await request(server)
            .get(`/api/tours/notVerified`)
            .expect(200);

        // Two tours because the function validTour() already creates a tour that meets the conditions
        // to be considered not verified
        assert.strictEqual(notVerifiedResp.body.length, 1);

        // Validate tour
        let valResp = await request(server)
            .put(`/api/tours/${resp.body._id}/verify`)
            .expect(200);

        assert.strictEqual(valResp.body.verified, true);
    });

    it("Student should get current tour", async () => {
        let student = await addStudent(request(server), validStudent);

        let tour = {
            ...(await getValidTour()),
            guide: student,
            endTime: undefined,
        };

        // Start tour
        await request(server)
            .post(`/api/students/${student}/tours`)
            .send(tour)
            .expect(201);

        await request(server)
            .get(`/api/students/${student}/currentTour`)
            .send()
            .expect(200);
    });

    it("Tour feedback", async () => {
        let student = await addStudent(request(server), validStudent);

        let tour = {
            ...(await getValidTour()),
            guide: student,
            endTime: undefined,
        };

        // Start tour
        let resp = await request(server)
            .post(`/api/students/${student}/tours`)
            .send(tour)
            .expect(201);

        let feedback = {
            rating: 5,
            additionalFeedback: "This was a great tour!",
        };

        await request(server)
            .post(`/api/students/${student}/tours/${resp.body._id}/feedback`)
            .send({
                feedback,
            })
            .expect(204);

        await request(server)
            .post(`/api/students/a/tours/${resp.body._id}/feedback`)
            .send({
                feedback,
            })
            .expect(400);

        let tourWithFeedback = await request(server)
            .get(`/api/students/${student}/tours/${resp.body._id}/feedback`)
            .expect(200);

        assert.strictEqual(tourWithFeedback.body[0].rating, feedback.rating);
        assert.strictEqual(
            tourWithFeedback.body[0].additionalFeedback,
            feedback.additionalFeedback
        );

        let avgResp = await request(server)
            .get(
                `/api/students/${student}/tours/${resp.body._id}/feedback/average`
            )
            .expect(200);

        assert.strictEqual(avgResp.body.average, feedback.rating);

        await request(server)
            .delete(`/api/tours/a/feedback/${tourWithFeedback.body[0]._id}`)
            .expect(400);

        await request(server)
            .delete(
                `/api/tours/${resp.body._id}/feedback/${tourWithFeedback.body[0]._id}`
            )
            .expect(204);
    });

    it("Get tour visitors - studentId student not found", async () => {
        let student = await addStudent(request(server), validStudent);

        let tour = { startTime: new Date(), guide: student };
        //create tour
        let tourSV = await request(server)
            .post(`/api/students/${student}/tours`)
            .send(tour)
            .expect(201);

        // request with bogus id
        let resp = await request(server)
            .get(
                `/api/students/012345678901234567890123/tours/${tourSV._body._id}/visitors`
            )
            .expect(404);
    });

    it("Create tour - no guide", async () => {
        // POST /api/students/:studentId/tours/:id/stations
        // DELETE /api/students/:studentId/tours/:id/stations

        let student = await addStudent(request(server), validStudent);

        let tour = {
            ...(await getValidTour()),
            guide: undefined,
            endTime: undefined,
        };
        let stations = tour.stations;
        tour.stations = [];
        let visitors = tour.visitors;
        tour.visitors = [];

        // Start tour
        let resp = await request(server)
            .post(`/api/students/${student}/tours`)
            .send(tour)
            .expect(400);
    });

    it("Create tour - referenced guide does not exist", async () => {
        let student = await addStudent(request(server), validStudent);

        let tour = {
            ...(await getValidTour()),
            guide: "5f9f1f3b7f3b4b001f6e1b1d",
            endTime: undefined,
        };
        let stations = tour.stations;
        tour.stations = [];
        let visitors = tour.visitors;
        tour.visitors = [];

        // Start tour
        let resp = await request(server)
            .post(`/api/students/${student}/tours`)
            .send(tour)
            .expect(400);
    });

    it("Create tour - endTime but no startTime", async () => {
        let student = await addStudent(request(server), validStudent);

        let tour = {
            ...(await getValidTour()),
            guide: student,
            endTime: "2021-01-01T12:00:00Z",
            startTime: undefined,
        };
        let stations = tour.stations;
        tour.stations = [];
        let visitors = tour.visitors;
        tour.visitors = [];

        // Start tour
        let resp = await request(server)
            .post(`/api/students/${student}/tours`)
            .send(tour)
            .expect(400);
    });

    it("Create tour - studentId invalid", async () => {
        let student = await addStudent(request(server), validStudent);

        let tour = {
            ...(await getValidTour()),
            guide: student,
            endTime: undefined,
        };
        let stations = tour.stations;
        tour.stations = undefined;
        let visitors = tour.visitors;
        tour.visitors = undefined;

        // Start tour
        let resp = await request(server)
            .post(`/api/students/amogus/tours`)
            .send(tour)
            .expect(500);
    });

    it("Add visitor to tour - visit does not exist", async () => {
        let student = await addStudent(request(server), validStudent);

        let tour = {
            ...(await getValidTour()),
            guide: student,
            endTime: undefined,
        };
        let stations = tour.stations;
        tour.stations = undefined;
        let visitors = tour.visitors;
        tour.visitors = [];

        // Start tour
        let resp = await request(server)
            .post(`/api/students/${student}/tours`)
            .send(tour)
            .expect(201);

        // Add visitor 1
        let visitor1 = await request(server)
            .post(`/api/students/${student}/tours/${resp.body._id}/visitors`)
            .send({ visitor: "5f9f1f3b7f3b4b001f6e1b1d" })
            .expect(400);
    });

    it("Try to add invalid station visit", async () => {
        // POST /api/students/:studentId/tours/:id/stations
        // DELETE /api/students/:studentId/tours/:id/stations

        let student = await addStudent(request(server), validStudent);

        let tour = {
            ...(await getValidTour()),
            guide: student,
            endTime: undefined,
        };
        let stations = tour.stations;
        tour.stations = undefined;
        let visitors = tour.visitors;
        tour.visitors = [];

        // Start tour
        let resp = await request(server)
            .post(`/api/students/${student}/tours`)
            .send(tour)
            .expect(201);

        // Add visitor 1
        let visitor1 = await request(server)
            .post(`/api/students/${student}/tours/${resp.body._id}/visitors`)
            .send({ visitor: visitors[0] })
            .expect(204);

        // Add visitor 2
        let visitor2 = await request(server)
            .post(`/api/students/${student}/tours/${resp.body._id}/visitors`)
            .send({ visitor: visitors[1] })
            .expect(204);

        // Visit first station
        let visit1 = {
            id: stations[0].id,
            time: new Date("2021-01-01T10:00:00Z"),
        };
        let visitResp = await request(server)
            .post(`/api/students/${student}/tours/${resp.body._id}/stations`)
            .send(visit1)
            .expect(400);

        // Visit second station from 11:00 to 12:00
        let visit2 = {
            id: stations[1].id,
            time: {
                end: new Date("2021-01-01T12:00:00Z"),
            },
        };
        visitResp = await request(server)
            .post(`/api/students/${student}/tours/${resp.body._id}/stations`)
            .send(visit2)
            .expect(400);

        let visit3 = {
            time: {
                start: new Date("2021-01-01T10:00:00Z"),
                end: new Date("2021-01-01T12:00:00Z"),
            },
        };

        await request(server)
            .post(`/api/students/${student}/tours/${resp.body._id}/stations`)
            .send(visit3)
            .expect(400);

        let visits = (
            await request(server)
                .get(`/api/students/${student}/tours/${resp.body._id}`)
                .expect(200)
        ).body.stations;

        assert.strictEqual(visits.length, 0);
    });

    it("It should not get the current tour of a student with an invalid Id", async () => {
        await request(server)
            .get(`/api/students/studentIdamogus/currentTour`)
            .send()
            .expect(400);
    });

    it("It should not get the current tour of a student that does not exist", async () => {
        await request(server)
            .get(`/api/students/a1981732ab2f34121f2de234/currentTour`)
            .send()
            .expect(400);
    });

    it("It should not get the current tour of a student that does not have one", async () => {
        let student = await addStudent(request(server), validStudent);

        await request(server)
            .get(`/api/students/${student}/currentTour`)
            .send()
            .expect(404);
    });

    it("It should not get the current tour of a student whose tour has already ended", async () => {
        let student = await addStudent(request(server), validStudent);

        let tour = {
            ...(await getValidTour()),
            guide: student,
            endTime: undefined,
        };

        // Start tour
        const resp = await request(server)
            .post(`/api/students/${student}/tours`)
            .send(tour)
            .expect(201);

        // Get current tour
        await request(server)
            .get(`/api/students/${student}/currentTour`)
            .send()
            .expect(200);

        // End tour
        await request(server)
            .post(`/api/students/${student}/tours/${resp.body._id}/end`)
            .expect(204);

        // Get current tour a second time
        await request(server)
            .get(`/api/students/${student}/currentTour`)
            .send()
            .expect(404);
    });

    it("Try to add station that was already visited", async () => {
        let student = await addStudent(request(server), validStudent);

        let tour = {
            ...(await getValidTour()),
            guide: student,
            endTime: undefined,
        };
        let stations = tour.stations;
        tour.stations = undefined;

        // Visit first station
        let visit1 = {
            id: stations[0].id,
            time: {
                start: new Date("2021-01-01T10:00:00Z"),
                end: new Date("2021-01-01T11:00:00Z"),
            },
        };

        // Start tour
        let resp = await request(server)
            .post(`/api/students/${student}/tours`)
            .send(tour)
            .expect(201);

        // visit tour
        await request(server)
            .post(`/api/students/${student}/tours/${resp.body._id}/stations`)
            .send(visit1)
            .expect(204);

        // visit tour a second time
        await request(server)
            .post(`/api/students/${student}/tours/${resp.body._id}/stations`)
            .send(visit1)
            .expect(400);
    });

    it("Try to visit a station where too many visitors are already present", async() => {
        let student = await addStudent(request(server), validStudent);
        let tour = {
            ...(await getValidTour()),
            guide: student,
            endTime: undefined,
            numberOfVisitors: 300
        };
        let stations = tour.stations;
        tour.stations = undefined;

        // Visit first station
        let visit1 = {
            id: stations[0].id,
            time: {
                start: new Date("2021-01-01T10:00:00Z"),
                end: new Date("2021-01-01T11:00:00Z"),
            },
        };

        // Start tour
        let resp = await request(server)
            .post(`/api/students/${student}/tours`)
            .send(tour)
            .expect(201);

        // visit tour
        await request(server)
            .post(`/api/students/${student}/tours/${resp.body._id}/stations`)
            .send(visit1)
            .expect(400);
    })

    it("Try to prioritize a station in the tour. Additionally try to prioritize wrong entries", async () => {
        let student = await addStudent(request(server), validStudent);

        let baseStation1 = {...validStation};

        let baseStation2 = {...validStation};
        baseStation2.name = "Test 2";

        let baseStation3 = {...validStation};
        baseStation2.name = "Test 3";

        let baseStation4 = {...validStation};
        baseStation2.name = "Test 4";

        let addStation1 = await addStation(request(server), baseStation1);
        let addStation2 = await addStation(request(server), baseStation2);
        let addStation3 = await addStation(request(server), baseStation3);

        await updateOpenday(request(server), [
            {
                id: addStation1,
                order: 1
            },
            {
                id: addStation2,
                order: 2
            },
            {
                id: addStation3,
                order: 2
            }
        ]);

        let tour = {
            ...(await getValidTour()),
            guide: student,
            endTime: undefined,
        };
        let stations = tour.stations;
        tour.stations = undefined;


        // Start tour
        let resp = await request(server)
            .post(`/api/students/${student}/tours`)
            .send(tour)
            .expect(201);

        // Prioritize station
        await request(server)
            .post(`/api/students/${student}/tours/${resp.body._id}/priority/${addStation3}`)
            .expect(204);

        // Invalid objid
        await request(server)
            .post(`/api/students/${student}/tours/${resp.body._id}/priority/JARED`)
            .expect(400);

        // Invalid studentid
        await request(server)
            .post(`/api/students/bbbbbb/tours/${resp.body._id}/priority/${addStation3}`)
            .expect(400);


        let finalResp = await request(server)
            .get(`/api/students/${student}/tours/${resp.body._id}`)
            .expect(200);
        
        assert.strictEqual(JSON.stringify(finalResp.body.stationQueue[0]), JSON.stringify({
            station: addStation3,
            order: 1
        }));
        assert.strictEqual(JSON.stringify(finalResp.body.stationQueue[1]), JSON.stringify({
            station: addStation2,
            order: 1
        }));
        assert.strictEqual(JSON.stringify(finalResp.body.stationQueue[2]), JSON.stringify({
            station: addStation1,
            order: 2
        }));

        // Prioritize DIFFERENT station
        await request(server)
            .post(`/api/students/${student}/tours/${resp.body._id}/priority/${addStation1}`)
            .expect(204);

        finalResp = await request(server)
            .get(`/api/students/${student}/tours/${resp.body._id}`)
            .expect(200);

        assert.strictEqual(JSON.stringify(finalResp.body.stationQueue[0]), JSON.stringify({
            station: addStation1,
            order: 1
        }));
    });

    it("Try to verify a tour with invalid id", async () => {
        await request(server)
            .put("/api/tours/IAmATourWithAnInvalidId/verify")
            .send()
            .expect(400);
    });

    it("Try to verify a tour that does not exist", async () => {
        await request(server)
            .put("/api/tours/aaaaaaaaaaaaaaaaaaaaaaaa/verify")
            .send()
            .expect(404);
    });

    it("Try to register visitors to a tour that does not exist", async () => {
        let visitor1 = await request(server).post("/api/visitors").send({
            name: "Gernot Oberlerchner",
            email: null,
            address: null,
            phone: "+43 692 3456947",
            grade: 4,
        });
        let visitor2 = await request(server).post("/api/visitors").send({
            name: "Hass Lacher",
            email: "heheheha@test.at",
            address: "Maximilianstraße 1, 9900 Lienz",
            phone: "+43 123 456789",
            grade: 2,
        });

        let visitors = [visitor1, visitor2];

        //Register visitors --- tour will automatically be verified.
        await request(server)
            .put(`/api/tours/aaaaaaaaaaaaaaaaaaaaaaaa/registerVisitors`)
            .send(visitors)
            .expect(404);
    });

    it("Try to register visitors to a tour with an invalid id", async () => {
        let visitor1 = await request(server).post("/api/visitors").send({
            name: "Gernot Oberlerchner",
            email: null,
            address: null,
            phone: "+43 692 3456947",
            grade: 4,
        });
        let visitor2 = await request(server).post("/api/visitors").send({
            name: "Hass Lacher",
            email: "heheheha@test.at",
            address: "Maximilianstraße 1, 9900 Lienz",
            phone: "+43 123 456789",
            grade: 2,
        });

        let visitors = [visitor1, visitor2];

        //Register visitors --- tour will automatically be verified.
        await request(server)
            .put(`/api/tours/IAmATourWithAnInvalidId/registerVisitors`)
            .send(visitors)
            .expect(400);
    });

    it("Register visitors to tour by invalid guide", async () => {
        let student = await addStudent(request(server), validStudent);

        let tour = {
            ...(await getValidTour()),
            guide: student,
            endTime: undefined,
            visitors: [],
        };

        let visitor1 = await request(server).post("/api/visitors").send({
            name: "Gernot Oberlerchner",
            email: null,
            address: null,
            phone: "+43 692 3456947",
            grade: 4,
        });
        let visitor2 = await request(server).post("/api/visitors").send({
            name: "Hass Lacher",
            email: "heheheha@test.at",
            address: "Maximilianstraße 1, 9900 Lienz",
            phone: "+43 123 456789",
            grade: 2,
        });

        let visitors = [visitor1, visitor2];

        // Start tour
        let resp = await request(server)
            .post(`/api/students/${student}/tours`)
            .send(tour)
            .expect(201);

        //Register visitors --- tour will automatically be verified.
        await request(server)
            .put(
                `/api/students/IAmAnInvalidStudent/tours/${resp.body._id}/registerVisitors`
            )
            .send(visitors)
            .expect(400);
    });

    it("Register visitors to tour with no visitors", async () => {
        let student = await addStudent(request(server), validStudent);

        let tour = {
            ...(await getValidTour()),
            guide: student,
            endTime: undefined,
            visitors: [],
        };

        // Start tour
        let resp = await request(server)
            .post(`/api/students/${student}/tours`)
            .send(tour)
            .expect(201);

        //Register visitors --- tour will automatically be verified.
        await request(server)
            .put(
                `/api/students/${student}/tours/${resp.body._id}/registerVisitors`
            )
            .send()
            .expect(400);
    });

    it("Register visitors to tour by student that does not exist", async () => {
        let guide = await addStudent(request(server), validStudent);

        let tour = {
            ...(await getValidTour()),
            guide: guide,
            endTime: undefined,
            visitors: [],
        };

        let visitor1 = await request(server).post("/api/visitors").send({
            name: "Gernot Oberlerchner",
            email: null,
            address: null,
            phone: "+43 692 3456947",
            grade: 4,
        });
        let visitor2 = await request(server).post("/api/visitors").send({
            name: "Hass Lacher",
            email: "heheheha@test.at",
            address: "Maximilianstraße 1, 9900 Lienz",
            phone: "+43 123 456789",
            grade: 2,
        });

        let visitors = [visitor1, visitor2];

        // Start tour
        let resp = await request(server)
            .post(`/api/students/${guide}/tours`)
            .send(tour)
            .expect(201);

        //Register visitors --- tour will automatically be verified.
        await request(server)
            .put(
                `/api/students/aaaaaaaaaaaaaaaaaaaaaaaa/tours/${resp.body._id}/registerVisitors`
            )
            .send(visitors)
            .expect(404);
    });

    it("Register visitors to tour by student that is not the guide", async () => {
        let guide = await addStudent(request(server), validStudent);
        let otherStudent = await addStudent(
            request(server),
            anotherValidStudent
        );

        let tour = {
            ...(await getValidTour()),
            guide: guide,
            endTime: undefined,
            visitors: [],
        };

        let visitor1 = await request(server).post("/api/visitors").send({
            name: "Gernot Oberlerchner",
            email: null,
            address: null,
            phone: "+43 692 3456947",
            grade: 4,
        });
        let visitor2 = await request(server).post("/api/visitors").send({
            name: "Hass Lacher",
            email: "heheheha@test.at",
            address: "Maximilianstraße 1, 9900 Lienz",
            phone: "+43 123 456789",
            grade: 2,
        });

        let visitors = [visitor1, visitor2];

        // Start tour
        let resp = await request(server)
            .post(`/api/students/${guide}/tours`)
            .send(tour)
            .expect(201);

        //Register visitors --- tour will automatically be verified.
        await request(server)
            .put(
                `/api/students/${otherStudent}/tours/${resp.body._id}/registerVisitors`
            )
            .send(visitors)
            .expect(403);
    });

    it("Register visitors to tour by invalid guide", async () => {
        let student = await addStudent(request(server), validStudent);

        let tour = {
            ...(await getValidTour()),
            guide: student,
            endTime: undefined,
            visitors: [],
        };

        let visitor1 = await request(server).post("/api/visitors").send({
            name: "Gernot Oberlerchner",
            email: null,
            address: null,
            phone: "+43 692 3456947",
            grade: 4,
        });
        let visitor2 = await request(server).post("/api/visitors").send({
            name: "Hass Lacher",
            email: "heheheha@test.at",
            address: "Maximilianstraße 1, 9900 Lienz",
            phone: "+43 123 456789",
            grade: 2,
        });

        let visitors = [visitor1, visitor2];

        // Start tour
        let resp = await request(server)
            .post(`/api/students/${student}/tours`)
            .send(tour)
            .expect(201);

        //Register visitors --- tour will automatically be verified.
        await request(server)
            .put(
                `/api/students/IAmAnInvalidStudent/tours/${resp.body._id}/registerVisitors`
            )
            .send(visitors)
            .expect(400);
    });

    it("Try ending tour after tour already ended", async () => {
        let student = await addStudent(request(server), validStudent);

        let tour = {
            ...(await getValidTour()),
            guide: student,
        };
        let stations = tour.stations;
        tour.stations = undefined;
        let visitors = tour.visitors;
        tour.visitors = [];

        // Start tour
        let resp = await request(server)
            .post(`/api/students/${student}/tours`)
            .send(tour)
            .expect(201);

        // Add visitor 1
        let visitor1 = await request(server)
            .post(`/api/students/${student}/tours/${resp.body._id}/visitors`)
            .send({ visitor: visitors[0] })
            .expect(204);

        // Add visitor 2
        let visitor2 = await request(server)
            .post(`/api/students/${student}/tours/${resp.body._id}/visitors`)
            .send({ visitor: visitors[1] })
            .expect(204);

        // Visit first station, but don't put a time
        let visit1 = {
            id: stations[0].id,
        };
        let visitResp = await request(server)
            .post(`/api/students/${student}/tours/${resp.body._id}/stations`)
            .send(visit1)
            .expect(204);

        let station2 = (
            await request(server)
                .post("/api/stations")
                .send({
                    name: "Jausenstation",
                    description: "Hier wird Essen verschenkt :)",
                    capacity: 80,
                    minWorkers: 4,
                    interactType: "other",
                    tags: ["Essen"],
                    roomNr: "Halle 3",
                })
        ).body._id;

        await request(server)
            .post(`/api/students/${student}/tours/${resp.body._id}/stations`)
            .send({
                id: station2,
                time: {
                    start: new Date("2021-01-01T10:00:00Z"),
                },
            })
            .expect(204);

        // Visit second station from 11:00 to 12:00
        let visit2 = {
            id: stations[1].id,
            time: {
                start: new Date("2021-01-01T11:00:00Z"),
                end: new Date("2021-01-01T12:00:00Z"),
            },
        };
        visitResp = await request(server)
            .post(`/api/students/${student}/tours/${resp.body._id}/stations`)
            .send(visit2)
            .expect(204);

        // Delete first visit
        let deleteResp = await request(server)
            .delete(
                `/api/students/${student}/tours/${resp.body._id}/stations/${visit1.id}`
            )
            .send(visit1)
            .expect(204);

        await request(server)
            .delete(
                `/api/students/${student}/tours/${resp.body._id}/stations/a`
            )
            .expect(400);

        // Get all visits
        let stationsResp = await request(server)
            .get(`/api/students/${student}/tours/${resp.body._id}`)
            .expect(200);

        assert.strictEqual(stationsResp.body.stations.length, 2);

        await request(server)
            .get(`/api/students/a/tours/${resp.body._id}`)
            .expect(400);

        await request(server)
            .get(
                `/api/students/60b1e3b4d4f3f1f1f1f1f1f1/tours/${resp.body._id}`
            )
            .expect(404);

        await request(server)
            .put(`/api/students/a/tours/${resp.body._id}`)
            .send(tour)
            .expect(400);

        await request(server)
            .put(
                `/api/students/60b1e3b4d4f3f1f1f1f1f1f1/tours/${resp.body._id}`
            )
            .send(tour)
            .expect(400);

        await request(server)
            .put(`/api/students/${student}/tours/60b1e3b4d4f3f1f1f1f1f1f1`)
            .send(tour)
            .expect(403);

        await request(server)
            .post(`/api/students/${student}/tours/a/end`)
            .expect(400);

        let visitorsResp = await request(server)
            .get(`/api/students/${student}/tours/${resp.body._id}/visitors`)
            .expect(200);

        assert.strictEqual(visitorsResp.body.length, 2);

        await request(server)
            .get(`/api/tours/${resp.body._id}/visitors/${visitors[0]}`)
            .expect(200);

        await request(server)
            .get(
                `/api/students/${student}/tours/${resp.body._id}/visitors/${visitors[0]}`
            )
            .expect(200);

        await request(server)
            .delete(`/api/tours/${resp.body._id}/visitors/${visitors[0]}`)
            .expect(204);

        await request(server)
            .delete(`/api/tours/${resp.body._id}/visitors/a`)
            .expect(400);

        await request(server)
            .delete(
                `/api/students/${student}/tours/${resp.body._id}/visitors/60b1e3b4d4f3f1f1f1f1f1f1`
            )
            .expect(404);

        await request(server)
            .delete(`/api/students/${student}/tours/a/visitors/${visitors[0]}`)
            .expect(404);

        // End tour
        let endResp = await request(server)
            .post(`/api/students/${student}/tours/${resp.body._id}/end`)
            .expect(204);
        // Try ending tour again
        endResp = await request(server)
            .post(`/api/students/${student}/tours/${resp.body._id}/end`)
            .expect(403);

        await request(server)
            .put(`/api/students/${student}/tours/${resp.body._id}`)
            .send(tour)
            .expect(403);
    });
});
