import request from "supertest";
import { dropDatabase } from "./util.js";
import server from "../server.js";
import assert from "assert";
import { insertTestOpenday } from "./tours.js";

const stations = [
    {
        _id: "6617fa094214bc6d27de03bc",
        name: "Rennspiel Stand",
        description: "Ein einfaches Rennspiel. In Java Programmiert",
        capacity: 4,
        minWorkers: 1,
        maxWorkers: 4,
        interactType: "interactive",
        tags: ["Gaming", "Coding"],
        roomNr: "Halle 1",
    },
    {
        _id: "6617fa094214bc5d23ce03bc",
        name: "Infostand",
        description: "Informationen über den TDOT",
        capacity: 4,
        minWorkers: 1,
        maxWorkers: 4,
        interactType: "audio-visual",
        tags: ["Information"],
        roomNr: "Halle 1",
    },
];

async function createTestStations() {
    for (let station of stations) {
        await request(server).post("/api/stations").send(station).expect(201);
    }
}

describe("Stations Feedback - Tests", () => {
    describe("Happy flow", () => {
        beforeEach((done) => {
            dropDatabase()
                .then(insertTestOpenday)
                .then(createTestStations)
                .then(() => done());
        });

        it("POST /stations/:id/feedback - Create station feedback", async () => {
            let feedback = (
                await request(server)
                    .post("/api/stations/6617fa094214bc5d23ce03bc/feedback")
                    .send({
                        rating: 5,
                        feedback: "Fühle mich jetzt super informiert!",
                    })
                    .expect(201)
            ).body;

            let resp = await request(server)
                .get("/api/stations/6617fa094214bc5d23ce03bc/feedback")
                .expect(200);

            assert.strictEqual(Array.isArray(resp.body), true);
            assert.strictEqual(resp.body.length, 1);
            assert.strictEqual(resp.body[0].rating, 5);
            assert.strictEqual(
                resp.body[0].feedback,
                "Fühle mich jetzt super informiert!"
            );

            let r1 = await request(server)
                .get(`/api/stations/6617fa094214bc5d23ce03bc/feedback`)
                .send()
                .expect(200);

            assert.strictEqual(Array.isArray(r1.body), true);
            assert.strictEqual(r1.body.length, 1);
            assert.strictEqual(r1.body[0].rating, 5);
            assert.strictEqual(
                r1.body[0].feedback,
                "Fühle mich jetzt super informiert!"
            );
        });

        it("GET /stations/:id/feedback/:id/average", async () => {
            await request(server)
                .post("/api/stations/6617fa094214bc5d23ce03bc/feedback")
                .send({
                    rating: 5,
                    feedback: "Fühle mich jetzt super informiert!",
                })
                .expect(201);

            await request(server)
                .post("/api/stations/6617fa094214bc5d23ce03bc/feedback")
                .send({
                    rating: 4,
                    feedback: "Fühle mich jetzt super informiert!",
                })
                .expect(201);

            let resp = await request(server)
                .get("/api/stations/6617fa094214bc5d23ce03bc/feedback/average")
                .expect(200);

            assert.strictEqual(resp.body.average, 4.5);
        });

        it("DELETE /stations/:id/feedback/:id", async () => {
            let feedback = (
                await request(server)
                    .post("/api/stations/6617fa094214bc6d27de03bc/feedback")
                    .send({
                        rating: 3,
                        feedback: "Bin jetzt spielsüchtig.",
                    })
                    .expect(201)
            ).body;

            let feedbacksBefore = (
                await request(server)
                    .get("/api/stations/6617fa094214bc6d27de03bc/feedback")
                    .send()
                    .expect(200)
            ).body;

            assert.strictEqual(Array.isArray(feedbacksBefore), true);
            assert.strictEqual(feedbacksBefore.length, 1);
            assert.strictEqual(feedbacksBefore[0]._id, feedback._id);

            let del = await request(server)
                .delete(
                    `/api/stations/6617fa094214bc6d27de03bc/feedback/${feedback._id}`
                )
                .send()
                .expect(200);

            let feedbacksAfter = (
                await request(server)
                    .get("/api/stations/6617fa094214bc6d27de03bc/feedback")
                    .send()
                    .expect(200)
            ).body;

            assert.strictEqual(Array.isArray(feedbacksAfter), true);
            assert.strictEqual(feedbacksAfter.length, 0);
        });
    });

    describe("Unhappy flow", () => {
        beforeEach((done) => {
            dropDatabase()
                .then(createTestStations)
                .then(() => done());
        });

        it("GET /stations/:id/feedback - 500", async () => {
            await request(server)
                .get("/api/stations/a/feedback")
                .send()
                .expect(500);
        });

        it("GET /stations/:id/feedback/average - 500", async () => {
            await request(server)
                .get("/api/stations/a/feedback/average")
                .send()
                .expect(500);
        });

        it("POST /stations/:id/feedback - Rating too low", async () => {
            await request(server)
                .post("/api/stations/6617fa094214bc5d23ce03bc/feedback")
                .send({
                    rating: -1,
                    feedback: "Fühle mich jetzt super informiert!",
                })
                .expect(500);
        });

        it("POST /stations/:id/feedback - Rating too high", async () => {
            await request(server)
                .post("/api/stations/6617fa094214bc5d23ce03bc/feedback")
                .send({
                    rating: 6,
                    feedback: "Fühle mich jetzt super informiert!",
                })
                .expect(500);
        });

        it('POST /stations/:id/feedback - "rating"', async () => {
            await request(server)
                .post("/api/stations/6617fa094214bc5d23ce03bc/feedback")
                .send({
                    rating: "super",
                    feedback: "Fühle mich jetzt super informiert!",
                })
                .expect(500);
        });

        it("POST /stations/:id/feedback - Station does not exist", async () => {
            await request(server)
                .post("/api/stations/6617fa094214bc5d23ce03be/feedback")
                .send({
                    rating: 5,
                    feedback: "Fühle mich jetzt super informiert!",
                })
                .expect(400);
        });

        it("POST /stations/:id/feedback - missing rating", async () => {
            await request(server)
                .post("/api/stations/6617fa094214bc5d23ce03bc/feedback")
                .send({
                    feedback: "Fühle mich jetzt super informiert!",
                })
                .expect(500);
        });

        it("POST /stations/:id/feedback - invalid station id", async () => {
            await request(server)
                .post("/api/stations/e/feedback")
                .send({
                    rating: 5,
                    feedback: "Fühle mich jetzt super informiert!",
                })
                .expect(400);
        });

        it("DELETE /stations/:station_id/feedback/:feedback_id - not existing feedback", async () => {
            await request(server)
                .delete(
                    `/api/stations/6617fa094214bc6d27de03bc/feedback/6617fa094214bc5d23ce03bc`
                )
                .send()
                .expect(404);
        });

        it("DELETE /stations/:station_id/feedback/:feedback_id - invalid station id", async () => {
            let feedback = (
                await request(server)
                    .post("/api/stations/6617fa094214bc6d27de03bc/feedback")
                    .send({
                        rating: 3,
                        feedback: "Bin jetzt spielsüchtig.",
                    })
                    .expect(201)
            ).body;

            await request(server)
                .delete(`/api/stations/toastbrot/feedback/${feedback._id}`)
                .send()
                .expect(500);
        });

        it("DELETE /stations/:station_id/feedback/:feedback_id - missing feedback id", async () => {
            let feedback = (
                await request(server)
                    .post("/api/stations/6617fa094214bc6d27de03bc/feedback")
                    .send({
                        rating: 3,
                        feedback: "Bin jetzt spielsüchtig.",
                    })
                    .expect(201)
            ).body;

            await request(server)
                .delete(`/api/stations/6617fa094214bc6d27de03bc/feedback`)
                .send()
                .expect(404);
        });

        it("DELETE /stations/:station_id/feedback/:feedback_id - wrong station id, correct feedback id", async () => {
            let feedback = (
                await request(server)
                    .post("/api/stations/6617fa094214bc6d27de03bc/feedback")
                    .send({
                        rating: 3,
                        feedback: "Bin jetzt spielsüchtig.",
                    })
                    .expect(201)
            ).body;

            await request(server)
                .delete(
                    `/api/stations/6617fa094214bc5d23ce03bc/feedback/${feedback._id}`
                )
                .send()
                .expect(404);
        });

        it("GET /api/stations/:station_id/feedback", async () => {
            await request(server)
                .get("/api/stations/6617fa094214bc5d23ce03bc/feedback")
                .send()
                .expect(200);
        });
    });
});
