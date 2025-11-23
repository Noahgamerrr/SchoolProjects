import request from "supertest";
import { dropDatabase } from "../util.js";
import server from "../../server.js";
import assert from "assert";
import {
    addStudent,
    validStudent,
    anotherValidStudent
} from "./common.js";
import { getAnotherValidTour, getValidTour, postTour } from "../tours.js";

describe("Students - GET", () => {
    beforeEach(async () => {
        await dropDatabase();
    });

    describe("/GET students", () => {
        it("it should initially return an empty list", async () => {
            const response = await request(server)
                .get("/api/students")
                .expect(200)
                .expect("Content-Type", /json/);
            assert.equal(response.body.length, 0);
        });

        it("it should return a list with a single student", async () => {
            const studentId = await addStudent(request(server), validStudent);

            const getResponse = await request(server)
                .get("/api/students")
                .expect(200)
                .expect("Content-Type", /json/);

            assert.equal(getResponse.body.length, 1);
            assert.equal(getResponse.body[0]._id, studentId);
        });

        it("it should list two students", async () => {
            await addStudent(request(server), validStudent);
            await addStudent(request(server), anotherValidStudent);

            const getResponse = await request(server)
                .get("/api/students")
                .expect(200)
                .expect("Content-Type", /json/);

            assert.equal(getResponse.body.length, 2);
        });
    });

    describe("/GET student by id", () => {
        it("it should return 404 for an unknown student", async () => {
            await request(server)
                .get("/api/students/65326f5fec6cd87154f9db87")
                .expect(404);
        });

        it("it should return a previously inserted student", async () => {
            const studentId = await addStudent(request(server), validStudent);

            const getResponse = await request(server)
                .get("/api/students/" + studentId)
                .expect(200)
                .expect("Content-Type", /json/);

            assert.equal(getResponse.body._id, studentId);
        });
    });

    describe("/GET student average feedback", async () => {
        it("it should get the average rating of a student with tours", async () => {
            const tour = await getValidTour();
            const secondTour = await getAnotherValidTour();
            const studentId = await addStudent(request(server), validStudent);
            await postTour({...tour, guide: studentId});
            await postTour({...secondTour, guide: studentId});


            const getResponse = await request(server)
                .get("/api/students/" + studentId +"/feedback/average")
                .expect(200)
                .expect("Content-Type", /json/);

            assert.equal(getResponse.body.average, 2.75);
        });

        it("it should get the average rating of a student with no tours", async () => {
            const studentId = await addStudent(request(server), validStudent);
            const getResponse = await request(server)
                .get("/api/students/" + studentId +"/feedback/average")
                .expect(200)
                .expect("Content-Type", /json/);

            assert.equal(getResponse.body.average, null);
        });

        it("it should not get the feedback of a with an invalid id", async () => {
            
            await request(server)
                .get("/api/students/aaaaaaaaaaaaaaaaaaaaaaaa/feedback/average")
                .expect(404);
        });

        it("it should not get the feedback of a student that does not exist", async () => {
            await request(server)
                .get("/api/students/aaaaa/feedback/average")
                .expect(400);
        });
    })
});
