import request from "supertest";
import { dropDatabase } from "./util.js";
import server from "../server.js";
import assert from "assert";
import {
    addStation,
    validStation
} from "./students/common.js";

describe("Opendays - Tests", () => {
    beforeEach(async () => {
        await dropDatabase();
    });

    describe("Basic functionality", () => {
        it("GET /opendays - No opendays", async () => {
            await request(server).get("/api/opendays").expect(200).expect([]);
        });

        it("POST /opendays - Create openday", async () => {
            await request(server)
                .post("/api/opendays")
                .send({ date: "2022-12-24" })
                .expect(201);

            let resp = await request(server).get("/api/opendays").expect(200);

            assert.strictEqual(Array.isArray(resp.body), true);
            assert.strictEqual(resp.body[0].date, "2022-12-24");
        });

        it("GET /opendays/:id - Get openday", async () => {
            let od = await request(server)
                .post("/api/opendays")
                .send({ date: "2022-12-24" })
                .expect(201);

            let resp = await request(server)
                .get("/api/opendays/" + od.body._id)
                .expect(200);

            assert.strictEqual(Array.isArray(resp.body), false);
            assert.strictEqual(resp.body.date, "2022-12-24");
        });

        it("GET /opendays/:id - Get openday - Not found", async () => {
            await request(server)
                .get("/api/opendays/60b1e3b4d4f3f1f1f1f1f1f1")
                .expect(404);
        });

        it("GET /opendays/:id - Get openday - Invalid id", async () => {
            await request(server).get("/api/opendays/invalid_id").expect(400);
        });

        it("GET /opendays/lock/:id - Lock openday - Invalid id", async () => {
            await request(server)
                .patch("/api/opendays/lock/60b1e3b4d4f3f1f1f1f1f1f1")
                .expect(404);
        });

        it("PUT /opendays/:id - Update openday", async () => {
            let od = await request(server)
                .post("/api/opendays")
                .send({ date: "2022-12-24" })
                .expect(201);

            await request(server)
                .put(`/api/opendays/${od.body._id}`)
                .send({ date: "2022-12-25" })
                .expect(204);

            let resp = await request(server)
                .get("/api/opendays/" + od.body._id)
                .expect(200);

            assert.strictEqual(resp.body.date, "2022-12-25");
        });

        it("PUT /opendays/:id - Update openday - Not found", async () => {
            await request(server)
                .put("/api/opendays/60b1e3b4d4f3f1f1f1f1f1f1")
                .send({ date: "2022-12-25" })
                .expect(404);
        });

        it("PUT /opendays/:id - Update openday - Invalid id", async () => {
            await request(server)
                .put("/api/opendays/invalid_id")
                .send({ date: "2022-12-25" })
                .expect(400);
        });

        it("DELETE /opendays", async () => {
            // This will be set as active automatically, so cannot be deleted
            const od = (
                await request(server)
                    .post("/api/opendays")
                    .send({ date: "2022-12-24" })
                    .expect(201)
            ).body;

            await request(server).delete(`/api/opendays/${od._id}`).expect(400);

            const od1 = (
                await request(server)
                    .post("/api/opendays")
                    .send({ date: "2022-12-25" })
                    .expect(201)
            ).body;

            await request(server)
                .delete(`/api/opendays/${od1._id}`)
                .expect(204);
        });

        describe("Get Active openday", async () => {
            beforeEach(async () => {
                await request(server)
                    .post("/api/opendays")
                    .send({ date: "2022-12-24" })
                    .expect(201);
            });

            it("GET /opendays/active - Active openday", async () => {
                // Check if the active openday is set automatically, as expected
                let od1 = await request(server)
                    .get("/api/opendays/active")
                    .expect(200);

                assert.strictEqual(od1.body.date, "2022-12-24");
                assert.strictEqual(od1.body.active, true);

                // Insert a new openday
                let od2 = await request(server)
                    .post("/api/opendays")
                    .send({ date: "2022-12-25" })
                    .expect(201);

                // Set the new openday as active
                await request(server)
                    .patch(`/api/opendays/${od2.body._id}`)
                    .expect(200);

                // Check if the active openday is set correctly
                let od2resp = await request(server)
                    .get("/api/opendays/active")
                    .expect(200);

                assert.strictEqual(od2resp.body.date, "2022-12-25");

                // Check if there is really only one active openday
                await request(server)
                    .get("/api/opendays")
                    .expect(200)
                    .expect((res) => {
                        assert.strictEqual(res.body.length, 2);
                        assert.strictEqual(
                            res.body.filter((od) => od.active).length,
                            1
                        );
                    });
            });

            it("GET /opendays/lock - Lock openday", async () => {
                // Insert a new openday
                let od2 = await request(server)
                    .post("/api/opendays")
                    .send({ date: "2022-12-25" })
                    .expect(201);

                // Set the new openday as locked
                await request(server)
                    .patch(`/api/opendays/lock/${od2.body._id}`)
                    .expect(200);

                // Check if the locked openday is set correctly
                let od2resp = await request(server)
                    .get("/api/opendays/" + od2.body._id)
                    .expect(200);

                assert.strictEqual(od2resp.body.date, "2022-12-25");

                // Ensure locking doesnt work twice
                await request(server)
                    .patch(`/api/opendays/lock/${od2.body._id}`)
                    .expect(400);
            });

            it("Set non-existant openday to active", async () => {
                await request(server)
                    .patch("/api/opendays/6617fa094214bc5d23ce03bc")
                    .expect(404);
            });
        });

        describe("Set the order of the stations inside an openday", async() => {
            beforeEach(async () => {
                await request(server)
                    .post("/api/opendays")
                    .send({ date: "2022-12-24" })
                    .expect(201);
            });

            it("Happy flow", async () => {
                let baseStation1 = {...validStation};

                let baseStation2 = {...validStation};
                baseStation2.name = "Test 2";

                let baseStation3 = {...validStation};
                baseStation2.name = "Test 3";

                let addStation1 = await addStation(request(server), baseStation1);
                let addStation2 = await addStation(request(server), baseStation2);
                let addStation3 = await addStation(request(server), baseStation3);

                const response = await request(server)
                    .patch("/api/opendays/active/stationsOrder")
                    .send([
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
        
                    ])
                    .expect(200)
                    .expect("Content-Type", /json/);
                
                assert(response.body.stationOrdering.length, 3);
            });

            it("Try to add an invalid station", async () => {
                let baseStation1 = {...validStation};

                let baseStation2 = {...validStation};
                baseStation2.name = "Test 2";

                let baseStation3 = {...validStation};
                baseStation2.name = "Test 3";

                let addStation1 = await addStation(request(server), baseStation1);
                let addStation2 = await addStation(request(server), baseStation2);

                await request(server)
                    .patch("/api/opendays/active/stationsOrder")
                    .send([
                        {
                            id: addStation1,
                            order: 1
                        },
                        {
                            id: addStation2,
                            order: 2
                        },
                        {
                            id: "ThisIsAnInvalidStation",
                            order: 3
                        }
                    ])
                    .expect(400);
            });

            it("Try to add ordering with invalid structure", async () => {
                let baseStation1 = {...validStation};

                let baseStation2 = {...validStation};
                baseStation2.name = "Test 2";

                let baseStation3 = {...validStation};
                baseStation2.name = "Test 3";

                let addStation1 = await addStation(request(server), baseStation1);
                let addStation2 = await addStation(request(server), baseStation2);

                await request(server)
                    .patch("/api/opendays/active/stationsOrder")
                    .send([addStation1, addStation2])
                    .expect(400);
            });

            it("Try to add stations to a nonexistent openday", async () => {
                await dropDatabase();

                let baseStation1 = {...validStation};

                let baseStation2 = {...validStation};
                baseStation2.name = "Test 2";

                let baseStation3 = {...validStation};
                baseStation2.name = "Test 3";

                let addStation1 = await addStation(request(server), baseStation1);
                let addStation2 = await addStation(request(server), baseStation2);
                let addStation3 = await addStation(request(server), baseStation3);

                await request(server)
                    .patch("/api/opendays/active/stationsOrder")
                    .send([addStation1, addStation2, addStation3])
                    .expect(404);
            })
        });
    });
});
