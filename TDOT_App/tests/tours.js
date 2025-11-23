import request from "supertest";
import { dropDatabase } from "./util.js";
import server from "../server.js";
import assert from "assert";
import { ObjectId } from "bson";

/**
 * Insert a test openday
 * @returns {Promise<mongoose.ObjectId>}
 */
export async function insertTestOpenday() {
    // Check if active openday exists
    let activeOd = (await request(server).get("/api/opendays/active").send())
        .body;

    if (activeOd?._id) return activeOd._id;

    return (
        await request(server)
            .post("/api/opendays")
            .send({ date: "2022-12-24" })
            .expect(201)
    ).body._id;
}

let counter = 0;

export async function getValidTour() {
    let od = await insertTestOpenday();

    assert.notEqual(od, null);

    let guide = (
        await request(server)
            .post("/api/students")
            .send({
                shortform: "mercadoa" + counter++,
                firstname: "Aurora",
                lastname: "Mercado",
                stations: [],
                guideTeams: [],
                activity: [],
            })
            .expect(201)
    ).body._id;
    let station1 = (
        await request(server)
            .post("/api/stations")
            .send({
                name: "Infostand2",
                description: "Informationen++ über den TDOT",
                capacity: 4,
                minWorkers: 1,
                maxWorkers: 4,
                interactType: "audio-visual",
                tags: ["Information"],
                roomNr: "Halle 1",
            })
    ).body._id;
    let visitor1 = (
        await request(server).post("/api/visitors").send({
            name: "Gernot Oberlerchner",
            email: null,
            address: null,
            phone: "+43 692 3456947",
            grade: 4,
        })
    ).body._id;
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
    let visitor2 = (
        await request(server).post("/api/visitors").send({
            name: "Hass Lacher",
            email: "heheheha@test.at",
            address: "Maximilianstraße 1, 9900 Lienz",
            phone: "+43 123 456789",
            grade: 2,
        })
    ).body._id;

    return {
        startTime: new Date("2022-12-24T06:29:59-0800").toISOString(),
        endTime: new Date("2022-12-24T15:30:00+0100").toISOString(),
        guide,
        stations: [
            {
                id: station1,
                time: {
                    start: new Date("2022-12-24T07:00:00+0200").toISOString(),
                    end: new Date("2022-12-24T08:00:00+0200").toISOString(),
                },
            },
            {
                id: station2,
                time: {
                    start: new Date("2022-12-24T08:00:00+0200").toISOString(),
                    end: new Date("2022-12-24T09:00:00+0200").toISOString(),
                },
            },
        ],
        visitors: [visitor1, visitor2],
        feedbacks: [
            {
                rating: 1,
                favouriteStation: station1,
                leastFavouriteStation: station2,
                additionalFeedback: "' AND 1=1 --",
            },
            {
                rating: 2,
                additionalFeedback: "DROP TABLE users;",
            },
        ],
    };
}

export async function getAnotherValidTour() {
    let od = await insertTestOpenday();
    let guide = (
        await request(server)
            .post("/api/students")
            .send({
                openDayId: od,
                shortform: "schinkent" + counter++,
                firstname: "Toast",
                lastname: "Schinken",
                stations: [],
                guideTeams: [],
                activity: [],
            })
            .expect(201)
    ).body._id;
    let station1 = (
        await request(server)
            .post("/api/stations")
            .send({
                name: "Infostand",
                description: "Informationen über den TDOT",
                capacity: 4,
                minWorkers: 1,
                maxWorkers: 4,
                interactType: "audio-visual",
                tags: ["Information"],
                roomNr: "Halle 1",
            })
    ).body._id;
    let visitor1 = (
        await request(server).post("/api/visitors").send({
            name: "David Brandstätter",
            email: null,
            address: null,
            phone: "+43 692 3456946",
            grade: 2,
        })
    ).body._id;
    let station2 = (
        await request(server)
            .post("/api/stations")
            .send({
                name: "Essensstand",
                description: "Hier wird essen verkauft.",
                capacity: 8,
                minWorkers: 2,
                interactType: "other",
                tags: ["Essen"],
                roomNr: "Halle 2",
            })
    ).body._id;
    let visitor2 = (
        await request(server).post("/api/visitors").send({
            name: "Rachel XXL Big Mac",
            email: "rachel.xxl-big-mac@example.com",
            address: null,
            phone: null,
            grade: 1,
        })
    ).body._id;

    assert.notEqual(guide, null);
    assert.notEqual(station1, null);
    assert.notEqual(visitor1, null);
    assert.notEqual(station2, null);

    return {
        startTime: new Date("2022-12-24T10:00:00+0200").toISOString(),
        endTime: new Date("2022-12-24T12:00:00+0200").toISOString(),
        guide: guide,
        stations: [
            {
                id: station1,
                time: {
                    start: new Date("2022-12-24T10:00:00+0200").toISOString(),
                    end: new Date("2022-12-24T10:00:00+0200").toISOString(),
                },
            },
            {
                id: station2,
                time: {
                    start: new Date("2022-12-24T10:00:00+0200").toISOString(),
                    end: new Date("2022-12-24T10:30:00+0200").toISOString(),
                },
            },
        ],
        visitors: [visitor1, visitor2],
        feedbacks: [
            {
                rating: 5,
                favouriteStation: station2,
                leastFavouriteStation: station1,
                additionalFeedback: "Great tour!",
            },
            {
                rating: 3,
                favouriteStation: station1,
                leastFavouriteStation: station2,
                additionalFeedback: "Could be better",
            },
        ],
    };
}

export async function postTour(tour) {
    return (await request(server).post("/api/tours").send(tour).expect(201))
        .body;
}

describe("Tours - Tests", () => {
    describe("Happy flow", () => {
        beforeEach(async () => {
            await dropDatabase();
        });

        it("GET /tours - No tours", async () => {
            await request(server).get("/api/tours").expect(200).expect([]);
        });

        it("POST /tours - Create and retrieve tour", async () => {
            let tour = await getValidTour();
            let returnedTour = await postTour(tour);

            let resp = await request(server).get("/api/tours").expect(200);

            assert.strictEqual(Array.isArray(resp.body), true);
            assert.deepEqual(resp.body[0], {
                ...tour,

                // Insert values that are set by server
                _id: returnedTour._id,
                __v: returnedTour.__v,
                identifier: returnedTour.identifier,
                verified: false,
                stationQueue: [],
                numberOfVisitors: 1,
                feedbacks: tour.feedbacks.map((f, idx) => ({
                    ...f,
                    _id: returnedTour.feedbacks[idx]._id,
                })),
            });
        });

        it("POST /tours - Retrieve tour stations", async () => {
            let tour = await getValidTour();
            let returnedTour = await postTour(tour);

            let resp = await request(server).get(`/api/tours/${returnedTour._id}/stations`).expect(200);

            assert.strictEqual(Array.isArray(resp.body), true);
            assert.strictEqual(resp.body.length, 2);
            assert.strictEqual(resp.body[0].name, "Infostand2")
        });

        it("POST /tours - Retrieve tour stations - no stations", async () => {
            let tour = await getValidTour();
            let returnedTour = await postTour({...tour, stations: []});

            let resp = await request(server).get(`/api/tours/${returnedTour._id}/stations`).expect(200);

            assert.strictEqual(Array.isArray(resp.body), true);
            assert.strictEqual(resp.body.length, 0);
        });

        it("GET /datahandover/:identifier - Get handover", async () => {
            let tour = await getValidTour();
            let returnedTour = await postTour(tour);

            let resp = await request(server)
                .get("/api/datahandover/" + returnedTour.identifier)
                .expect(200);

                assert.strictEqual(resp.body.stations, undefined);
                assert.strictEqual(resp.body.tourLengthMs, 1000);
                assert.strictEqual(resp.body.stationsVisited, 2);
                assert.strictEqual(resp.body.averageFeedback, 1.5);
            })

        it("PUT /tours/:id - Update tour", async () => {
            let tour = await getValidTour();
            let returnedTour = await postTour(tour);

            let newTour = await getAnotherValidTour();

            await request(server)
                .put(`/api/tours/${returnedTour._id}`)
                .send(newTour)
                .expect(204);

            let resp = await request(server)
                .get("/api/tours/" + returnedTour._id)
                .expect(200);

            assert.deepEqual(
                {
                    ...resp.body,
                    feedbacks: resp.body.feedbacks.map((f) => ({
                        ...f,
                        _id: undefined,
                    })),
                },
                {
                    ...newTour,
                    _id: returnedTour._id,
                    __v: returnedTour.__v,
                    identifier: returnedTour.identifier,
                    verified: false,
                    stationQueue: [],
                    numberOfVisitors: 1,
                    feedbacks: newTour.feedbacks.map((f, idx) => ({
                        ...f,
                        _id: undefined,
                    })),
                }
            );
        });


        it("DELETE /tours/:id - Delete tour", async () => {
            let tour = await getValidTour();
            let returnedTour = await postTour(tour);

            await request(server)
                .delete(`/api/tours/${returnedTour._id}`)
                .expect(204);

            await request(server)
                .get("/api/tours/" + returnedTour._id)
                .expect(404);
        });
    });
    describe("Unhappy flow", () => {
        beforeEach(async () => {
            await dropDatabase();
        });

        it("GET /tours/:id - Get tour - Not found", async () => {
            await request(server)
                .get("/api/tours/60b1e3b4d4f3f1f1f1f1f1f1")
                .expect(404);
        });

        it("GET /tours/:id - Get tour - Invalid id", async () => {
            await request(server).get("/api/tours/invalid_id").expect(400);
        });

        it("GET /tours - It shoud not get the stations of an invalid tour", async () => {
            await request(server).get(`/api/tours/invalid/stations`).expect(400);
        });

        it("GET /tours - It shoud not get the stations that does not exist", async () => {
            await request(server).get(`/api/tours/aaaaaaaaaaaaaaaaaaaaaaaa/stations`).expect(404);
        });


        it("PUT /tours/:id - Update tour with invalid data 2 (startTime after endTime)", async () => {
            let tour = await getValidTour();
            let returnedTour = await postTour(tour);

            await request(server)
                .put(`/api/tours/${returnedTour._id}`)
                .send({
                    ...tour,
                    startTime: new Date(
                        "2022-12-24T09:00:00+0200"
                    ).toISOString(),
                    endTime: new Date("2022-12-24T08:00:00+0200").toISOString(),
                })
                .expect(400);
        });

        it("POST /tours - Create tour with invalid data 2 (startTime after endTime)", async () => {
            let tour = await getValidTour();
            let startTime = new Date("2022-12-24T09:00:00+0200").toISOString();
            let endTime = new Date("2022-12-24T08:00:00+0200").toISOString();

            await request(server)
                .post("/api/tours")
                .send({ ...tour, startTime, endTime })
                .expect(400);
        });

        it("POST /tours - Create tour with invalid data 4 (invalid guide id)", async () => {
            let tour = await getValidTour();
            await request(server)
                .post("/api/tours")
                .send({ ...tour, guide: "invalid_id" })
                .expect(400);
        });

        it("GET /datahandover/:identifier - Get handover for invalid identifier", async () => {
            await request(server)
                .get("/api/datahandover/inval_ID")
                .expect(400);

        })

        it("GET /datahandover/:identifier - Get handover for non-existant identifier", async () => {
            await request(server)
                .get("/api/datahandover/ident")
                .expect(404);

        })

        it("PUT /tours/:id - Update tour - Not found", async () => {
            await request(server)
                .put("/api/tours/60b1e3b4d4f3f1f1f1f1f1f1")
                .send(await getAnotherValidTour())
                .expect(404);
        });

        it("PUT /tours/:id - Update tour - Invalid id", async () => {
            await request(server)
                .put("/api/tours/invalid_id")
                .send({ date: "2022-12-25" })
                .expect(400);
        });

        it("PUT /tours/:id - Update tour - Update endTime without startTime", async () => {
            let tour = await getValidTour();
            let returnedTour = await postTour(tour);

            await request(server)
                .put(`/api/tours/${returnedTour._id}`)
                .send({ endTime: "2021-12-23T06:29:59+0200" })
                .expect(400);
        });

        it("PUT /tours/:id - Update tour - Update startTime after endTime", async () => {
            let tour = await getValidTour();
            let returnedTour = await postTour(tour);

            await request(server)
                .put(`/api/tours/${returnedTour._id}`)
                .send({
                    endTime: "2021-12-23T06:29:59+0200",
                    startTime: "2022-12-23T09:00:00+0200",
                })
                .expect(400);
        });

        it("DELETE /tours/:id - Delete tour - invalid id", async () => {
            await request(server).delete("/api/tours/invalid_id").expect(500);
        });

        it("DELETE /tours/:id - Delete tour - Not found", async () => {
            await request(server)
                .delete("/api/tours/60b1e3b4d4f3f1f1f1f1f1f1")
                .expect(404);
        });
    });
});
