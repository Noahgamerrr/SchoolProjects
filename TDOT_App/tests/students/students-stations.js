import request from "supertest";
import { dropDatabase } from "../util.js";
import server from "../../server.js";
import assert from "assert";
import {
    validStudent,
    getStudent,
    initializeStudentsAndStation,
} from "./common.js";

describe("Students - Station Management", () => {
    beforeEach(async () => {
        await dropDatabase();
    });

    describe("/PUT - add student to station", () => {
        it("it should add student to a station", async () => {
            const ids = await initializeStudentsAndStation(request(server));

            const studentResponse = await request(server)
                .get(`/api/students/${ids.studentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            const matchVal = studentResponse.body.__v;

            await request(server)
                .put(`/api/students/${ids.studentId}/station/${ids.stationId}`)
                .set("if-match", matchVal)
                .expect(200);

            const updatedResponse = await request(server)
                .get(`/api/students/${ids.studentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            const updated = updatedResponse.body;
            assert.equal(1, updated.stations.length);
        });

        it("it should set the first student of a team as the station-leader", async () => {
            const ids = await initializeStudentsAndStation(request(server));

            const studentResponse = await request(server)
                .get(`/api/students/${ids.studentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            const matchVal = studentResponse.body.__v;

            await request(server)
                .put(`/api/students/${ids.studentId}/station/${ids.stationId}`)
                .set("if-match", matchVal)
                .expect(200);

            const updatedResponse = await request(server)
                .get(`/api/students/${ids.studentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            const updated = updatedResponse.body;
            const station = updated.stations.find(
                (s) => s.stationId == ids.stationId
            );
            assert.equal(1, updated.stations.length);
            assert.equal(true, station.isLeader);
        });

        it("it should not add a non-existing student", async () => {
            const ids = await initializeStudentsAndStation(request(server));

            await request(server)
                .put(
                    `/api/students/60b1e3b4d4f3f1f1f1f1f1f1/station/${ids.stationId}`
                )
                .set("if-match", 1234)
                .expect(404);
        });

        it("it should not add a student that's already in the station", async () => {
            const ids = await initializeStudentsAndStation(request(server));

            let studentResponse = await request(server)
                .get(`/api/students/${ids.studentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            let matchVal = studentResponse.body.__v;

            await request(server)
                .put(`/api/students/${ids.studentId}/station/${ids.stationId}`)
                .set("if-match", matchVal)
                .expect(200);

            studentResponse = await request(server)
                .get(`/api/students/${ids.studentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            matchVal = studentResponse.body.__v;

            await request(server)
                .put(`/api/students/${ids.studentId}/station/${ids.stationId}`)
                .set("if-match", matchVal)
                .expect(400);
        });
    });

    describe("/PUT - station-leader", () => {
        it("it should set a new station-leader and demote the old station-leader", async () => {
            const ids = await initializeStudentsAndStation(request(server));

            let studentResponse = await request(server)
                .get(`/api/students/${ids.studentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            let matchVal = studentResponse.body.__v;

            await request(server)
                .put(`/api/students/${ids.studentId}/station/${ids.stationId}`)
                .set("if-match", matchVal)
                .expect(200);

            studentResponse = await request(server)
                .get(`/api/students/${ids.anotherStudentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            matchVal = studentResponse.body.__v;

            await request(server)
                .put(
                    `/api/students/${ids.anotherStudentId}/station/${ids.stationId}`
                )
                .set("if-match", matchVal)
                .expect(200);

            studentResponse = await request(server)
                .get(`/api/students/${ids.anotherStudentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            matchVal = studentResponse.body.__v;

            await request(server)
                .put(
                    `/api/students/${ids.anotherStudentId}/stationLeader/${ids.stationId}`
                )
                .set("if-match", matchVal)
                .expect(200);

            const newLeaderResponse = await request(server)
                .get(`/api/students/${ids.anotherStudentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            const newLeader = newLeaderResponse.body;
            const leaderStation = newLeader.stations.find(
                (s) => s.stationId == ids.stationId
            );
            assert.equal(true, leaderStation.isLeader);

            const oldLeaderResponse = await request(server)
                .get(`/api/students/${ids.studentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            const oldLeader = oldLeaderResponse.body;
            const memberStation = oldLeader.stations.find(
                (s) => s.stationId == ids.stationId
            );
            assert.equal(false, memberStation.isLeader);
        });

        it("it should not set the station-leader as the new station-leader", async () => {
            const ids = await initializeStudentsAndStation(request(server));

            let studentResponse = await request(server)
                .get(`/api/students/${ids.studentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            let matchVal = studentResponse.body.__v;

            await request(server)
                .put(`/api/students/${ids.studentId}/station/${ids.stationId}`)
                .set("if-match", matchVal)
                .expect(200);

            studentResponse = await request(server)
                .get(`/api/students/${ids.studentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            matchVal = studentResponse.body.__v;

            await request(server)
                .put(
                    `/api/students/${ids.studentId}/guideLeader/${ids.stationId}`
                )
                .set("if-match", matchVal)
                .expect(400);
        });

        it("it should not set a student that's not part of the station as station-leader", async () => {
            const ids = await initializeStudentsAndStation(request(server));

            const studentResponse = await request(server)
                .get(`/api/students/${ids.studentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            const matchVal = studentResponse.body.__v;

            await request(server)
                .put(
                    `/api/students/${ids.studentId}/stationLeader/${ids.stationId}`
                )
                .set("if-match", matchVal)
                .expect(400);
        });
    });

    describe("/PUT - remove students from station", () => {
        it("it should remove a team-member", async () => {
            const ids = await initializeStudentsAndStation(request(server));

            let studentResponse = await request(server)
                .get(`/api/students/${ids.studentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            let matchVal = studentResponse.body.__v;

            await request(server)
                .put(`/api/students/${ids.studentId}/station/${ids.stationId}`)
                .set("if-match", matchVal)
                .expect(200);

            studentResponse = await request(server)
                .get(`/api/students/${ids.studentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            matchVal = studentResponse.body.__v;
            assert.equal(1, studentResponse.body.stations.length);

            await request(server)
                .delete(
                    `/api/students/${ids.studentId}/station/${ids.stationId}`
                )
                .set("if-match", matchVal)
                .expect(200);

            const updatedResponse = await request(server)
                .get(`/api/students/${ids.studentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            const updated = updatedResponse.body;
            assert.equal(0, updated.stations.length);
        });

        it("it should not remove a station-leader if there is other people in the team", async () => {
            const ids = await initializeStudentsAndStation(request(server));

            let studentResponse = await request(server)
                .get(`/api/students/${ids.studentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            let matchVal = studentResponse.body.__v;

            await request(server)
                .put(`/api/students/${ids.studentId}/station/${ids.stationId}`)
                .set("if-match", matchVal)
                .expect(200);

            studentResponse = await request(server)
                .get(`/api/students/${ids.anotherStudentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            matchVal = studentResponse.body.__v;

            await request(server)
                .put(
                    `/api/students/${ids.anotherStudentId}/station/${ids.stationId}`
                )
                .set("if-match", matchVal)
                .expect(200);

            studentResponse = await request(server)
                .get(`/api/students/${ids.studentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            matchVal = studentResponse.body.__v;

            await request(server)
                .delete(
                    `/api/students/${ids.studentId}/station/${ids.stationId}`
                )
                .set("if-match", matchVal)
                .expect(400);
        });
    });
});
