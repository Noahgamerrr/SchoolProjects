import request from "supertest";
import { dropDatabase } from "../util.js";
import server from "../../server.js";
import assert from "assert";
import {
    validStudent,
    getStudent
} from "./common.js";

describe("Students - POST", () => {
    beforeEach(async () => {
        await dropDatabase();
    });

    describe("/POST students - happy flow", () => {
        it("it should add a single student", async () => {
            const postResponse = await request(server)
                .post("/api/students")
                .send(validStudent)
                .expect(201)
                .expect("Content-Type", /json/);

            const studentId = postResponse.body._id;

            assert.equal(typeof postResponse.body, "object");
            assert.notEqual(studentId, undefined);
            assert.equal(
                postResponse.headers.location,
                `/api/students/${studentId}`
            );

            const student = await getStudent(request(server), studentId);

            assert.equal(student._id, studentId);
        });
    });

    describe("/POST students - same shortform", () => {
        it("it should a student and refuse the next one with the same shortform", async () => {
            const postResponse = await request(server)
                .post("/api/students")
                .send(validStudent)
                .expect(201)
                .expect("Content-Type", /json/);

            request(server)
                .post("/api/students")
                .send(validStudent)
                .expect(400)
                .expect("Content-Type", /json/);

            const studentId = postResponse.body._id;

            assert.equal(typeof postResponse.body, "object");
            assert.notEqual(studentId, undefined);
            assert.equal(
                postResponse.headers.location,
                `/api/students/${studentId}`
            );

            const student = await getStudent(request(server), studentId);

            assert.equal(student._id, studentId);
        });

        it("it should add a student and accept the next one with the same shortform but with a different openDayId", async () => {
            const postResponse = await request(server)
                .post("/api/students")
                .send(validStudent)
                .expect(201)
                .expect("Content-Type", /json/);

            request(server)
                .post("/api/students")
                .send({...validStudent, openDayId: "12345678901234"})
                .expect(201)
                .expect("Content-Type", /json/);

            const studentId = postResponse.body._id;

            assert.equal(typeof postResponse.body, "object");
            assert.notEqual(studentId, undefined);
            assert.equal(
                postResponse.headers.location,
                `/api/students/${studentId}`
            );

            const student = await getStudent(request(server), studentId);

            assert.equal(student._id, studentId);
        });
    });
});
