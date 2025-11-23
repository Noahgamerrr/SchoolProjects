import request from "supertest";
import { dropDatabase } from "../util.js";
import server from "../../server.js";
import assert from "assert";
import { getAllStudents, addStudent } from "./common.js";

const validStudent = {
    firstname: "John",
    lastname: "Doe",
    station: "Some Station",
    isLeader: false,
    team: "",
    shortform: "doej",
};

const anotherValidStudent = {
    firstname: "Sam",
    lastname: "O'Nella",
    station: "Some Station",
    isLeader: true,
    team: "pain",
    shortform: "O'Nellas",
};

const anotherStationLeader = {
    firstname: "Derik",
    lastname: "Du",
    station: "Some Station",
    isLeader: true,
    team: "pain",
    shortform: "Dud",
};

describe("Students - IMPORT", () => {
    beforeEach(async () => {
        await dropDatabase();
    });

    describe("IMPORT Students - correct students", () => {
        it("it should import all students correctly", async () => {
            await request(server)
                .post("/api/opendays")
                .send({ date: "2022-12-24" })
                .expect(201);

            const postResponse = await request(server)
                .post("/api/students/fill")
                .send([validStudent, anotherValidStudent])
                .expect(200)
                .expect("Content-Type", /json/);

            // 0 invalid students
            assert.equal(postResponse.body.errors.length, 0);
            let allStudents = await getAllStudents(request(server));

            assert.equal(Array.isArray(allStudents), true);
            assert.equal(allStudents.length, 2);
        });
        it("it should return incorrect students", async () => {
            await request(server)
                .post("/api/opendays")
                .send({ date: "2022-12-24" })
                .expect(201);

            const postResponse = await request(server)
                .post("/api/students/fill")
                .send([validStudent, { ...validStudent, firstname: undefined }])
                // still expect 200 for invalid students, as this is expected and will be handled in the frontend
                .expect(200)
                .expect("Content-Type", /json/);

            // 1 invalid student
            assert.equal(postResponse.body.errors.length, 1);
            let allStudents = await getAllStudents(request(server));

            assert.equal(Array.isArray(allStudents), true);
            assert.equal(allStudents.length, 1);
        });

        it("it should return incorrect students due to multiple being the station leader", async () => {
            await request(server)
                .post("/api/opendays")
                .send({ date: "2022-12-24" })
                .expect(201);

            const postResponse = await request(server)
                .post("/api/students/fill")
                .send([anotherValidStudent, anotherStationLeader])
                // still expect 200 for invalid students, as this is expected and will be handled in the frontend
                .expect(200)
                .expect("Content-Type", /json/);

            // 1 invalid student
            assert.equal(postResponse.body.errors.length, 1);
            let allStudents = await getAllStudents(request(server));

            assert.equal(Array.isArray(allStudents), true);
            assert.equal(allStudents.length, 1);
        });
        it("it should update already existing students", async () => {
            await request(server)
                .post("/api/opendays")
                .send({ date: "2022-12-24" })
                .expect(201);

            await addStudent(request(server), validStudent);
            await addStudent(request(server), anotherValidStudent);

            const postResponse = await request(server)
                .post("/api/students/fill")
                .send([{ ...validStudent, firstname: "Johnathan" }])
                .expect(200)
                .expect("Content-Type", /json/);

            // 0 invalid students
            assert.equal(postResponse.body.errors.length, 0);
            let allStudents = await getAllStudents(request(server));

            assert.equal(Array.isArray(allStudents), true);
            assert.equal(allStudents.length, 2);
            assert.equal(allStudents[0].firstname, "Johnathan");
        });

        it("it should only allow application/json", async () => {
            await request(server)
                .post("/api/students/fill")
                .set("Content-Type", "text/plain")
                .send("[]")
                .expect(415);
        });
    });
});
