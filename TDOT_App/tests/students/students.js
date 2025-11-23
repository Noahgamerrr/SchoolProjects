import request from "supertest";
import { dropDatabase } from "../util.js";
import server from "../../server.js";
import assert from "assert";
import { anotherValidStudent, validStation, validStudent } from "./common.js";

describe("Students - Other Tests", () => {
    beforeEach(async () => {
        await dropDatabase();
    });

    it("PUT /students/:id/station/:stationId - No If-Match", async () => {
        await request(server)
            .put(
                `/api/students/60b1e3b4d4f3f1f1f1f1f1f1/station/60b1e3b4d4f3f1f1f1f1f1f1`
            )
            .expect(400);
    });

    it("PUT /students/:id/station/:stationId - Student not found", async () => {
        await request(server)
            .put(
                `/api/students/60b1e3b4d4f3f1f1f1f1f1f1/station/60b1e3b4d4f3f1f1f1f1f1f1`
            )
            .set("If-Match", 0)
            .expect(404);
    });

    it("PUT /students/:id/station/:stationId - Out-of-date if-match", async () => {
        const stu = await request(server)
            .post("/api/students")
            .send(validStudent)
            .expect(201)
            .expect("Content-Type", /json/);

        const station = await request(server)
            .post("/api/stations")
            .send(validStation)
            .expect(201)
            .expect("Content-Type", /json/);

        await request(server)
            .put(`/api/students/${stu.body._id}/station/${station.body._id}`)
            .set("If-Match", stu.body.__v - 1)
            .expect(412);
    });

    it("PUT /students/:id/station/:stationId - Not found station", async () => {
        const stu = await request(server)
            .post("/api/students")
            .send(validStudent)
            .expect(201)
            .expect("Content-Type", /json/);

        await request(server)
            .put(
                `/api/students/${stu.body._id}/station/60b1e3b4d4f3f1f1f1f1f1f1`
            )
            .set("If-Match", stu.body.__v)
            .expect(400);
    });

    it("DELETE /students/:id/station/:stationId - OK", async () => {
        const stu = await request(server)
            .post("/api/students")
            .send(validStudent)
            .expect(201)
            .expect("Content-Type", /json/);

        const station = await request(server)
            .post("/api/stations")
            .send(validStation)
            .expect(201)
            .expect("Content-Type", /json/);

        await request(server)
            .put(`/api/students/${stu.body._id}/station/${station.body._id}`)
            .set("If-Match", stu.body.__v)
            .expect(200);

        await request(server)
            .delete(`/api/students/${stu.body._id}/station/${station.body._id}`)
            .set("If-Match", stu.body.__v + 1)
            .expect(200);
    });

    it("DELETE /students/:id/station/:stationId - No if-match", async () => {
        const stu = await request(server)
            .post("/api/students")
            .send(validStudent)
            .expect(201)
            .expect("Content-Type", /json/);

        const station = await request(server)
            .post("/api/stations")
            .send(validStation)
            .expect(201)
            .expect("Content-Type", /json/);

        await request(server)
            .put(`/api/students/${stu.body._id}/station/${station.body._id}`)
            .set("If-Match", stu.body.__v)
            .expect(200);

        await request(server)
            .delete(`/api/students/${stu.body._id}/station/${station.body._id}`)
            .expect(400);
    });

    it("DELETE /students/:id/station/:stationId - Old if-match", async () => {
        const stu = await request(server)
            .post("/api/students")
            .send(validStudent)
            .expect(201)
            .expect("Content-Type", /json/);

        const station = await request(server)
            .post("/api/stations")
            .send(validStation)
            .expect(201)
            .expect("Content-Type", /json/);

        await request(server)
            .put(`/api/students/${stu.body._id}/station/${station.body._id}`)
            .set("If-Match", stu.body.__v)
            .expect(200);

        await request(server)
            .delete(`/api/students/${stu.body._id}/station/${station.body._id}`)
            .set("If-Match", stu.body.__v)
            .expect(412);
    });

    it("DELETE /students/:id/station/:stationId - Student not found", async () => {
        const station = await request(server)
            .post("/api/stations")
            .send(validStation)
            .expect(201)
            .expect("Content-Type", /json/);

        await request(server)
            .delete(
                `/api/students/60b1e3b4d4f3f1f1f1f1f1f1/station/${station.body._id}`
            )
            .set("If-Match", 1)
            .expect(404);
    });

    it("DELETE /students/:id/station/:stationId - Invalid student", async () => {
        const station = await request(server)
            .post("/api/stations")
            .send(validStation)
            .expect(201)
            .expect("Content-Type", /json/);

        await request(server)
            .delete(`/api/students/a/station/${station.body._id}`)
            .set("If-Match", 1)
            .expect(400);
    });

    it("DELETE /students/:id/station/:stationId - OK", async () => {
        const stu = await request(server)
            .post("/api/students")
            .send(validStudent)
            .expect(201)
            .expect("Content-Type", /json/);

        const station = await request(server)
            .post("/api/stations")
            .send(validStation)
            .expect(201)
            .expect("Content-Type", /json/);

        await request(server)
            .delete(`/api/students/${stu.body._id}/station/${station.body._id}`)
            .set("If-Match", stu.body.__v)
            .expect(400);
    });

    it("PUT /students/:id/stationLeader/:stationId - OK", async () => {
        const stu = await request(server)
            .post("/api/students")
            .send(validStudent)
            .expect(201)
            .expect("Content-Type", /json/);

        const stu1 = await request(server)
            .post("/api/students")
            .send(anotherValidStudent)
            .expect(201)
            .expect("Content-Type", /json/);

        const station = await request(server)
            .post("/api/stations")
            .send(validStation)
            .expect(201)
            .expect("Content-Type", /json/);

        await request(server)
            .put(`/api/students/${stu.body._id}/station/${station.body._id}`)
            .set("If-Match", stu.body.__v)
            .expect(200);

        await request(server)
            .put(`/api/students/${stu1.body._id}/station/${station.body._id}`)
            .set("If-Match", stu1.body.__v)
            .expect(200);

        await request(server)
            .put(
                `/api/students/${stu1.body._id}/stationLeader/${station.body._id}`
            )
            .set("If-Match", stu1.body.__v + 1)
            .expect(200);
    });

    it("PUT /students/:id/stationLeader/:stationId - No If-Match Header", async () => {
        const stu = await request(server)
            .post("/api/students")
            .send(validStudent)
            .expect(201)
            .expect("Content-Type", /json/);

        const stu1 = await request(server)
            .post("/api/students")
            .send(anotherValidStudent)
            .expect(201)
            .expect("Content-Type", /json/);

        const station = await request(server)
            .post("/api/stations")
            .send(validStation)
            .expect(201)
            .expect("Content-Type", /json/);

        await request(server)
            .put(`/api/students/${stu.body._id}/station/${station.body._id}`)
            .set("If-Match", stu.body.__v)
            .expect(200);

        await request(server)
            .put(`/api/students/${stu1.body._id}/station/${station.body._id}`)
            .set("If-Match", stu1.body.__v)
            .expect(200);

        await request(server)
            .put(
                `/api/students/${stu1.body._id}/stationLeader/${station.body._id}`
            )
            .expect(400);
    });

    it("PUT /students/:id/stationLeader/:stationId - Student not found", async () => {
        const stu = await request(server)
            .post("/api/students")
            .send(validStudent)
            .expect(201)
            .expect("Content-Type", /json/);

        const stu1 = await request(server)
            .post("/api/students")
            .send(anotherValidStudent)
            .expect(201)
            .expect("Content-Type", /json/);

        const station = await request(server)
            .post("/api/stations")
            .send(validStation)
            .expect(201)
            .expect("Content-Type", /json/);

        await request(server)
            .put(`/api/students/${stu.body._id}/station/${station.body._id}`)
            .set("If-Match", stu.body.__v)
            .expect(200);

        await request(server)
            .put(`/api/students/${stu1.body._id}/station/${station.body._id}`)
            .set("If-Match", stu1.body.__v)
            .expect(200);

        await request(server)
            .put(
                `/api/students/60b1e3b4d4f3f1f1f1f1f1f1/stationLeader/${station.body._id}`
            )
            .set("If-Match", 0)
            .expect(404);
    });

    it("PUT /students/:id/stationLeader/:stationId - Invalid student", async () => {
        const stu = await request(server)
            .post("/api/students")
            .send(validStudent)
            .expect(201)
            .expect("Content-Type", /json/);

        const stu1 = await request(server)
            .post("/api/students")
            .send(anotherValidStudent)
            .expect(201)
            .expect("Content-Type", /json/);

        const station = await request(server)
            .post("/api/stations")
            .send(validStation)
            .expect(201)
            .expect("Content-Type", /json/);

        await request(server)
            .put(`/api/students/${stu.body._id}/station/${station.body._id}`)
            .set("If-Match", stu.body.__v)
            .expect(200);

        await request(server)
            .put(`/api/students/${stu1.body._id}/station/${station.body._id}`)
            .set("If-Match", stu1.body.__v)
            .expect(200);

        await request(server)
            .put(`/api/students/a/stationLeader/${station.body._id}`)
            .set("If-Match", 0)
            .expect(400);
    });

    it("PUT /students/:id/stationLeader/:stationId - Old If-Match", async () => {
        const stu = await request(server)
            .post("/api/students")
            .send(validStudent)
            .expect(201)
            .expect("Content-Type", /json/);

        const stu1 = await request(server)
            .post("/api/students")
            .send(anotherValidStudent)
            .expect(201)
            .expect("Content-Type", /json/);

        const station = await request(server)
            .post("/api/stations")
            .send(validStation)
            .expect(201)
            .expect("Content-Type", /json/);

        await request(server)
            .put(`/api/students/${stu.body._id}/station/${station.body._id}`)
            .set("If-Match", stu.body.__v)
            .expect(200);

        await request(server)
            .put(`/api/students/${stu1.body._id}/station/${station.body._id}`)
            .set("If-Match", stu1.body.__v)
            .expect(200);

        await request(server)
            .put(
                `/api/students/${stu1.body._id}/stationLeader/${station.body._id}`
            )
            .set("If-Match", stu1.body.__v)
            .expect(412);
    });

    it("PUT /students/:id/stationLeader/:stationId - Already leader", async () => {
        const stu = await request(server)
            .post("/api/students")
            .send(validStudent)
            .expect(201)
            .expect("Content-Type", /json/);

        const stu1 = await request(server)
            .post("/api/students")
            .send(anotherValidStudent)
            .expect(201)
            .expect("Content-Type", /json/);

        const station = await request(server)
            .post("/api/stations")
            .send(validStation)
            .expect(201)
            .expect("Content-Type", /json/);

        await request(server)
            .put(`/api/students/${stu.body._id}/station/${station.body._id}`)
            .set("If-Match", stu.body.__v)
            .expect(200);

        await request(server)
            .put(`/api/students/${stu1.body._id}/station/${station.body._id}`)
            .set("If-Match", stu1.body.__v)
            .expect(200);

        await request(server)
            .put(
                `/api/students/${stu.body._id}/stationLeader/${station.body._id}`
            )
            .set("If-Match", stu.body.__v + 1)
            .expect(400);
    });

    it("GET /students - Invalid query", async () => {
        await request(server).get("/api/students?_id=a").expect(500);
    });

    it("POST /students - Invalid student", async () => {
        await request(server)
            .post("/api/students")
            .send({ bruh: "no" })
            .expect(400);
    });

    it("GET /students/:id - Not found", async () => {
        await request(server)
            .get("/api/students/60b1e3b4d4f3f1f1f1f1f1f1")
            .expect(404);
    });

    it("GET /students/:id - Invalid id", async () => {
        await request(server).get("/api/students/a").expect(400);
    });

    it("DELETE /students/:id - Invalid id", async () => {
        await request(server).delete("/api/students/a").expect(400);
    });

    it("PUT /students/:id - OK", async () => {
        const stu = await request(server)
            .post("/api/students")
            .send(validStudent)
            .expect(201)
            .expect("Content-Type", /json/);

        const upd = await request(server)
            .put(`/api/students/${stu.body._id}`)
            .set("If-Match", stu.body.__v)
            .send({
                ...validStudent,
                lastname: "Bernd",
            })
            .expect(200)
            .expect("Content-Type", /json/);

        assert.strictEqual(upd.body.lastname, "Bernd");
    });

    it("PUT /students/:id - No If-Match", async () => {
        const stu = await request(server)
            .post("/api/students")
            .send(validStudent)
            .expect(201)
            .expect("Content-Type", /json/);

        await request(server)
            .put(`/api/students/${stu.body._id}`)
            .send({
                ...validStudent,
                lastname: "Bernd",
            })
            .expect(400);
    });

    it("PUT /students/:id - Old If-Match", async () => {
        const stu = await request(server)
            .post("/api/students")
            .send(validStudent)
            .expect(201)
            .expect("Content-Type", /json/);

        await request(server)
            .put(`/api/students/${stu.body._id}`)
            .set("If-Match", stu.body.__v - 1)
            .send({
                ...validStudent,
                lastname: "Bernd",
            })
            .expect(412);
    });

    it("PUT /students/:id - Student not found", async () => {
        const stu = await request(server)
            .post("/api/students")
            .send(validStudent)
            .expect(201)
            .expect("Content-Type", /json/);

        await request(server)
            .put(`/api/students/60b1e3b4d4f3f1f1f1f1f1f1`)
            .set("If-Match", stu.body.__v)
            .send({
                ...validStudent,
                lastname: "Bernd",
            })
            .expect(404);
    });

    it("PUT /students/:id - Invalid id", async () => {
        const stu = await request(server)
            .post("/api/students")
            .send(validStudent)
            .expect(201)
            .expect("Content-Type", /json/);

        const upd = await request(server)
            .put(`/api/students/a`)
            .set("If-Match", stu.body.__v)
            .send({
                ...validStudent,
                lastname: "Bernd",
            })
            .expect(400);
    });

    it("PATCH /students/:id - OK", async () => {
        const stu = await request(server)
            .post("/api/students")
            .send(validStudent)
            .expect(201)
            .expect("Content-Type", /json/);

        const upd = await request(server)
            .patch(`/api/students/${stu.body._id}`)
            .set("If-Match", stu.body.__v)
            .set("Content-Type", "application/merge-patch+json")
            .send({
                lastname: "Bernd",
            })
            .expect(200)
            .expect("Content-Type", /json/);
    });

    it("PATCH /students/:id - Wrong content-type", async () => {
        const stu = await request(server)
            .post("/api/students")
            .send(validStudent)
            .expect(201)
            .expect("Content-Type", /json/);

        const upd = await request(server)
            .patch(`/api/students/${stu.body._id}`)
            .set("If-Match", stu.body.__v)
            .set("Content-Type", "application/json")
            .send({
                lastname: "Bernd",
            })
            .expect(415);
    });

    it("PATCH /students/:id - Not found", async () => {
        const upd = await request(server)
            .patch(`/api/students/60b1e3b4d4f3f1f1f1f1f1f1`)
            .set("If-Match", 1)
            .set("Content-Type", "application/merge-patch+json")
            .send({
                lastname: "Bernd",
            })
            .expect(404);
    });

    it("PATCH /students/:id - Invalid id", async () => {
        const upd = await request(server)
            .patch(`/api/students/a`)
            .set("If-Match", 1)
            .set("Content-Type", "application/merge-patch+json")
            .send({
                lastname: "Bernd",
            })
            .expect(400);
    });

    it("PATCH /students/:id - With null", async () => {
        const stu = await request(server)
            .post("/api/students")
            .send(validStudent)
            .expect(201)
            .expect("Content-Type", /json/);

        const upd = await request(server)
            .patch(`/api/students/${stu.body._id}`)
            .set("If-Match", stu.body.__v)
            .set("Content-Type", "application/merge-patch+json")
            .send({
                lastname: null,
            })
            .expect(200)
            .expect("Content-Type", /json/);
    });

    it("GET /students/:shortform/teamMembers - OK", async () => {
        const gt1 = await request(server)
            .post("/api/guide-teams")
            .send({ name: "GT1" })
            .expect(201);

        const gt2 = await request(server)
            .post("/api/guide-teams")
            .send({ name: "GT2" })
            .expect(201);

        const stu = await request(server)
            .post("/api/students")
            .send({
                ...validStudent,
                guideTeams: [
                    {
                        teamId: gt1.body._id,
                        isLeader: true,
                    },
                    {
                        teamId: gt2.body._id,
                        isLeader: false,
                    },
                ],
            })
            .expect(201)
            .expect("Content-Type", /json/);

        const res = await request(server)
            .get(`/api/students/${stu.body.shortform}/teamMembers`)
            .expect(200);

        assert.strictEqual(Object.keys(res.body.guideTeams).length, 1);
        assert.deepEqual(res.body.stations, {});
    });

    it("GET /students/:shortform/teamMembers - Not found", async () => {
        const gt1 = await request(server)
            .post("/api/guide-teams")
            .send({ name: "GT1" })
            .expect(201);

        const gt2 = await request(server)
            .post("/api/guide-teams")
            .send({ name: "GT2" })
            .expect(201);

        const stu = await request(server)
            .post("/api/students")
            .send({
                ...validStudent,
                guideTeams: [
                    {
                        teamId: gt1.body._id,
                        isLeader: true,
                    },
                    {
                        teamId: gt2.body._id,
                        isLeader: false,
                    },
                ],
            })
            .expect(201)
            .expect("Content-Type", /json/);

        const res = await request(server)
            .get(`/api/students/gernot/teamMembers`)
            .expect(404);
    });
});
