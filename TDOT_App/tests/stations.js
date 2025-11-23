import request from "supertest";
import { dropDatabase } from "./util.js";
import server from "../server.js";
import assert from "assert";
import { otherValidStudent, validStudent } from "./students/common.js";

const validStation = {
    name: "NSCS-Stand",
    description: "Hier wird das Innenleben eines Computers erklärt",
    capacity: 1,
    minWorkers: 1,
    maxWorkers: 4,
    interactType: "audio-visual",
    tags: ["NSCS", "Info"],
    roomNr: "420",
};

describe("Stations - Tests", () => {
    describe("Basic functionality", () => {
        beforeEach(async () => {
            await dropDatabase();
        });

        it("GET /stations - No stations", async () => {
            await request(server).get("/api/stations").expect(200).expect([]);
        });

        it("Create Station then get its students - Happy flow", async () => {
            await request(server)
                .post("/api/stations")
                .send(validStation)
                .expect(201);

            let resp = await request(server).get("/api/stations/").expect(200);

            assert.strictEqual(Array.isArray(resp.body), true);
            assert.strictEqual(resp.body[0].name, "NSCS-Stand");
        });

        it("Create Station - Unhappy flow - minWorkers > maxWorkers", async () => {
            await request(server)
                .post("/api/stations")
                .send({ ...validStation, minWorkers: 50, maxWorkers: 1 })
                .expect(400);
        });

        it("Create Station - Unhappy flow - string capacity", async () => {
            await request(server)
                .post("/api/stations")
                .send({ ...validStation, capacity: "hello" })
                .expect(400);
        });

        it("Update and Get Station", async () => {
            await request(server)
                .post("/api/stations")
                .send(validStation)
                .expect(201);

            let resp = await request(server).get("/api/stations").expect(200);
            await request(server)
                .put("/api/stations/" + resp.body[0]._id)
                .send(validStation)
                .expect(204);

            let resp2 = await request(server)
                .get("/api/stations/" + resp.body[0]._id)
                .expect(200);
            assert.strictEqual(Array.isArray(resp2.body), false);
            assert.strictEqual(resp2.body.name, "NSCS-Stand");
        });

        it("Create then delete Station", async () => {
            await request(server)
                .post("/api/stations")
                .send(validStation)
                .expect(201);

            let resp = await request(server).get("/api/stations").expect(200);

            await request(server)
                .delete("/api/stations/" + resp.body[0]._id)
                .send()
                .expect(204);

            let resp2 = await request(server)
                .get("/api/stations/" + resp.body[0]._id)
                .expect(404);
        });

        it("Create Station and feedbacks, rating aggregation", async () => {
            let station = (
                await request(server)
                    .post("/api/stations")
                    .send(validStation)
                    .expect(201)
            ).body;

            await request(server)
                .post(`/api/stations/${station._id}/feedback`)
                .send({ rating: 5 })
                .expect(201);

            await request(server)
                .post(`/api/stations/${station._id}/feedback`)
                .send({ rating: 4 })
                .expect(201);

            let resp = await request(server)
                .get("/api/stations/" + station._id)
                .expect(200);

            assert.strictEqual(resp.body.rating, 4.5);

            let resp2 = await request(server).get("/api/stations").expect(200);

            assert.strictEqual(resp2.body[0].rating, 4.5);
        });

        it("GET /api/stations/:id/teamLeader - OK", async () => {
            const station = await request(server)
                .post("/api/stations")
                .send(validStation)
                .expect(201);

            const student = await request(server)
                .post("/api/students")
                .send({
                    ...validStudent,
                    stations: [{ stationId: station.body._id, isLeader: true }],
                })
                .expect(201);

            await request(server)
                .get(`/api/stations/${station.body._id}/teamLeader`)
                .expect(200);
        });
    });

    describe("Unhappy Flow functionality", () => {
        beforeEach(async () => {
            await dropDatabase();
        });

        it("GET /stations - Invalid query", async () => {
            await request(server).get("/api/stations?_id=a").expect(400);
        });

        it("GET /stations/:id - Invalid id", async () => {
            await request(server).get("/api/stations/invalid_id").expect(400);
        });

        it("DELETE /stations/:id - Station not found", async () => {
            await request(server)
                .delete("/api/stations/6617fa094214bc5d23ce03bc")
                .expect(404);
        });

        it("PUT /stations/:id - Invalid id", async () => {
            await request(server)
                .put("/api/stations/invalid_id")
                .send(validStation)
                .expect(400);
        });

        it("PUT /stations/:id - Station not found", async () => {
            await request(server)
                .put("/api/stations/6617fa094214bc5d23ce03bc")
                .send(validStation)
                .expect(404);
        });

        it("GET /api/stations/:id/teamLeader - Invalid id", async () => {
            await request(server)
                .get("/api/stations/invalid_id/teamLeader")
                .expect(400);
        });

        it("GET /api/stations/:id/teamLeader - Station not found", async () => {
            await request(server)
                .get("/api/stations/6617fa094214bc5d23ce03bc/teamLeader")
                .expect(404);
        });

        it("GET /api/stations/:id/members - Invalid id", async () => {
            await request(server)
                .get("/api/stations/invalid_id/members")
                .expect(400);
        });

        it("Create Faulty Station (No name)", async () => {
            let noNameStation = { ...validStation };
            noNameStation.name = undefined;

            await request(server)
                .post("/api/stations")
                .send(noNameStation)
                .expect(400);

            let resp = await request(server).get("/api/stations").expect(200);

            assert.strictEqual(Array.isArray(resp.body), true);
            assert.strictEqual(resp.body.length, 0);
        });

        it("Create Faulty Station (negative cap)", async () => {
            let invalidStation = { ...validStation };
            invalidStation.capacity = -3;

            await request(server)
                .post("/api/stations")
                .send(invalidStation)
                .expect(400);

            let resp = await request(server).get("/api/stations").expect(200);

            assert.strictEqual(Array.isArray(resp.body), true);
            assert.strictEqual(resp.body.length, 0);
        });

        it("Create Faulty Station (missing cap)", async () => {
            let invalidStation = { ...validStation };
            invalidStation.capacity = undefined;

            await request(server)
                .post("/api/stations")
                .send(invalidStation)
                .expect(400);

            let resp = await request(server).get("/api/stations").expect(200);

            assert.strictEqual(Array.isArray(resp.body), true);
            assert.strictEqual(resp.body.length, 0);
        });

        it("Create Faulty Station (missing emp min > emp max)", async () => {
            let invalidStation = { ...validStation };
            invalidStation.minWorkers = 4;
            invalidStation.maxWorkers = 2;

            await request(server)
                .post("/api/stations")
                .send(invalidStation)
                .expect(400);

            let resp = await request(server).get("/api/stations").expect(200);

            assert.strictEqual(Array.isArray(resp.body), true);
            assert.strictEqual(resp.body.length, 0);
        });

        it("Create Faulty Station (invalid type)", async () => {
            let invalidStation = { ...validStation };
            invalidStation.interactType = "nan";

            await request(server)
                .post("/api/stations")
                .send(invalidStation)
                .expect(400);

            let resp = await request(server).get("/api/stations").expect(200);

            assert.strictEqual(Array.isArray(resp.body), true);
            assert.strictEqual(resp.body.length, 0);
        });

        it("Get stations members that doesnt exist", async () => {
            let resp2 = await request(server)
                .get("/api/stations/65326f5fec6cd87154f9db87/members")
                .expect(404);
        });
    });

    describe("Member Functionality", () => {
        beforeEach(async () => {
            await dropDatabase();
        });

        it("Create Station - Happy flow", async () => {
            await request(server)
                .post("/api/stations")
                .send(validStation)
                .expect(201);

            let resp = await request(server).get("/api/stations").expect(200);

            let copyStudent = { ...otherValidStudent };
            copyStudent.stations[0] = {
                stationId: resp.body[0]._id,
                isLeader: true,
            };
            const postResponse = await request(server)
                .post("/api/students")
                .send(copyStudent)
                .expect(201)
                .expect("Content-Type", /json/);

            let resp2 = await request(server)
                .get("/api/stations/" + resp.body[0]._id + "/members")
                .expect(200);
        });
    });
});
