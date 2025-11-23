import request from "supertest";
import { dropDatabase } from "./util.js";
import server from "../server.js";
import assert from "assert";

const insertTestStudent = async function (isTeamLeaderA = true) {
    const student = {
        shortform: "test",
        firstname: "John",
        lastname: "Doe",
        stations: [],
        guideTeams: [
            {
                teamId: "A",
                isLeader: isTeamLeaderA,
            },
            {
                teamId: "B",
                isLeader: false,
            },
        ],
        activity: [
            {
                time: "2024-04-01T09:00:00.000Z",
                activity: "break",
            },
            {
                time: "2024-04-01T13:00:00.000Z",
                activity: "available",
            },
        ],
    };

    let id = (await request(server).post("/api/students").send(student)).body
        ._id;
    return id;
};

const subscribeStudentToDiscord = async function (studentId) {
    await request(server)
        .put("/api/notifications/providers/discord")
        .set("X-Test-User", "test")
        .send({
            data: "https://discord.com/api/webhooks/1234567891234567890/test",
        })
        .expect(200);
};

describe("Notifications - Tests", () => {
    beforeEach(async () => {
        await dropDatabase();
    });

    it("GET /notifications/providers - No user (401)", async () => {
        await request(server).get("/api/notifications/providers").expect(401);
    });

    it("GET /notifications/providers - Unknown user (412)", async () => {
        await request(server)
            .get("/api/notifications/providers")
            .set("X-Test-User", "invalid")
            .expect(412);
    });

    it("GET /notifications/providers - No providers (200)", async () => {
        const studentId = await insertTestStudent();
        await request(server)
            .get("/api/notifications/providers")
            .set("X-Test-User", "test")
            .expect(200)
            .expect("Content-Type", /json/)
            .then((response) => {
                assert.deepEqual(response.body, {});
            });
    });

    it("GET /notifications/providers - Email provider set (200)", async () => {
        const studentId = await insertTestStudent();
        await request(server)
            .put("/api/notifications/providers/email")
            .set("X-Test-User", "test")
            .send({
                data: "test@example.com",
            })
            .expect(200);

        await request(server)
            .get("/api/notifications/providers")
            .set("X-Test-User", "test")
            .expect(200)
            .expect("Content-Type", /json/)
            .then((response) => {
                assert.deepEqual(response.body, {
                    email: "test@example.com",
                });
            });
    });

    it("GET /notifications/providers - Discord provider set (200)", async () => {
        const studentId = await insertTestStudent();
        await request(server)
            .put("/api/notifications/providers/discord")
            .set("X-Test-User", "test")
            .send({
                data: "https://discord.com/api/webhooks/1234567891234567890/ooPh2oufaij7Cheighaiquie6Ohphai0ooMeiChe_eeYoth7iLieWaegingurah5ohco",
            })
            .expect(200);

        await request(server)
            .get("/api/notifications/providers")
            .set("X-Test-User", "test")
            .expect(200)
            .expect("Content-Type", /json/)
            .then((response) => {
                assert.deepEqual(response.body, {
                    discord:
                        "https://discord.com/api/webhooks/1234567891234567890/ooPh2oufaij7Cheighaiquie6Ohphai0ooMeiChe_eeYoth7iLieWaegingurah5ohco",
                });
            });
    });

    it("GET /notifications/providers - NTFY provider set (200)", async () => {
        const studentId = await insertTestStudent();
        await request(server)
            .put("/api/notifications/providers/ntfy")
            .set("X-Test-User", "test")
            .send({
                data: "htl-vil-tdot-f57c68dc-7fe2-40ba-9e46-6f26ac547506",
            })
            .expect(200);

        await request(server)
            .get("/api/notifications/providers")
            .set("X-Test-User", "test")
            .expect(200)
            .expect("Content-Type", /json/)
            .then((response) => {
                assert.deepEqual(response.body, {
                    ntfy: "htl-vil-tdot-f57c68dc-7fe2-40ba-9e46-6f26ac547506",
                });
            });
    });

    it("POST /notifications - No title (400)", async () => {
        const studentId = await insertTestStudent();
        await request(server)
            .post("/api/notifications")
            .set("X-Test-User", "test")
            .send({
                body: "Test",
                recipients: [],
            })
            .expect(400);
    });

    it("POST /notifications - No recipients (400)", async () => {
        const studentId = await insertTestStudent();
        await request(server)
            .post("/api/notifications")
            .set("X-Test-User", "test")
            .send({
                title: "Test",
                body: "Test",
                recipients: [],
            })
            .expect(400);
    });

    it("POST /notifications - Notification to single student (200)", async () => {
        const studentId = await insertTestStudent();
        await subscribeStudentToDiscord(studentId);
        await request(server)
            .post("/api/notifications")
            .set("X-Test-User", "test")
            .send({
                title: "Test",
                body: "Test",
                recipients: [studentId],
            })
            .expect(200);
    });

    it("POST /notifications - Notification to all students (200)", async () => {
        const studentId = await insertTestStudent();
        await subscribeStudentToDiscord(studentId);
        await request(server)
            .post("/api/notifications")
            .set("X-Test-User", "test")
            .send({
                title: "Test",
                body: "Test",
                recipientsGroups: {
                    all: true,
                },
            })
            .expect(200);
    });

    it("POST /notifications - Notification to workers and guides (200)", async () => {
        const studentId = await insertTestStudent();
        await subscribeStudentToDiscord(studentId);
        const resp = await request(server)
            .post("/api/notifications")
            .set("X-Test-User", "test")
            .send({
                title: "Test",
                body: "Test",
                recipientsGroups: {
                    workers: true,
                    guides: true,
                },
            })
            .expect(200);

        assert.deepEqual(resp.body, ["test"]);
    });

    it("POST /notifications - Notification to guideTeamLeads", async () => {
        const studentId = await insertTestStudent();
        await subscribeStudentToDiscord(studentId);
        const resp = await request(server)
            .post("/api/notifications")
            .set("X-Test-User", "test")
            .send({
                title: "Test",
                body: "Test",
                recipientsGroups: {
                    guideTeamLeads: true,
                },
            })
            .expect(200);

        assert.deepEqual(resp.body, ["test"]);
    });

    it("POST /notifications - Notification to guideTeamLeads . no teamleads", async () => {
        const studentId = await insertTestStudent(false);
        await subscribeStudentToDiscord(studentId);
        const resp = await request(server)
            .post("/api/notifications")
            .set("X-Test-User", "test")
            .send({
                title: "Test",
                body: "Test",
                recipientsGroups: {
                    guideTeamLeads: true,
                },
            })
            .expect(200);

        assert.deepEqual(resp.body, []);
    });

    it("POST /notifications/providers/email/test - No user (401)", async () => {
        await request(server)
            .post("/api/notifications/providers/email/test")
            .expect(401);
    });

    it("POST /notifications/providers/email/test - Unknown student (412)", async () => {
        await request(server)
            .post("/api/notifications/providers/email/test")
            .set("X-Test-User", "invalid")
            .expect(412);
    });

    it("POST /notifications/providers/email/test - No preferences set (412)", async () => {
        await insertTestStudent();
        await request(server)
            .post("/api/notifications/providers/email/test")
            .set("X-Test-User", "test")
            .expect(412);
    });

    it("POST /notifications/providers/:provider/test - Invalid provider (400)", async () => {
        await insertTestStudent();
        await request(server)
            .post("/api/notifications/providers/invalid/test")
            .set("X-Test-User", "test")
            .expect(412);
    });

    it("POST /notifications/providers/:provider/test - Not subscribed to provider (412)", async () => {
        await insertTestStudent();
        await subscribeStudentToDiscord();
        await request(server)
            .post("/api/notifications/providers/email/test")
            .set("X-Test-User", "test")
            .expect(412);
    });

    it("POST /notifications/providers/ntfy/test - Valid (200)", async () => {
        await insertTestStudent();
        await request(server)
            .put("/api/notifications/providers/ntfy")
            .set("X-Test-User", "test")
            .send({
                data: "htl-vil-tdot-f57c68dc-7fe2-40ba-9e46-6f26ac547506",
            })
            .expect(200);

        await request(server)
            .post("/api/notifications/providers/ntfy/test")
            .set("X-Test-User", "test")
            .expect(200);
    });

    it("PUT /notifications/providers/email - No data (400)", async () => {
        await request(server)
            .put("/api/notifications/providers/email")
            .set("X-Test-User", "test")
            .send({})
            .expect(400);
    });

    it("PUT /notifications/providers/email - Invalid email (400)", async () => {
        await request(server)
            .put("/api/notifications/providers/email")
            .set("X-Test-User", "test")
            .send({
                data: "invalid",
            })
            .expect(400);
    });

    it("PUT /notifications/providers/email - Unknown student (412)", async () => {
        await request(server)
            .put("/api/notifications/providers/email")
            .set("X-Test-User", "invalid")
            .send({
                data: "test@example.com",
            })
            .expect(412);
    });

    it("PUT /notifications/providers/email - Valid (200)", async () => {
        await insertTestStudent();
        await request(server)
            .put("/api/notifications/providers/email")
            .set("X-Test-User", "test")
            .send({
                data: "test@example.com",
            })
            .expect(200);
    });

    it("PUT /notifications/providers/discord - Valid (200)", async () => {
        await insertTestStudent();
        await request(server)
            .put("/api/notifications/providers/discord")
            .set("X-Test-User", "test")
            .send({
                data: "https://discord.com/api/webhooks/1234567891234567890/test",
            })
            .expect(200);
    });

    it("PUT /notifications/providers/ntfy - Valid (200)", async () => {
        await insertTestStudent();
        await request(server)
            .put("/api/notifications/providers/ntfy")
            .set("X-Test-User", "test")
            .send({
                data: "htl-vil-tdot-f57c68dc-7fe2-40ba-9e46-6f26ac547506",
            })
            .expect(200);
    });

    it("DELETE /notifications/providers/email - Unknown student (412)", async () => {
        await request(server)
            .delete("/api/notifications/providers/email")
            .set("X-Test-User", "invalid")
            .expect(412);
    });

    it("DELETE /notifications/providers/email - Valid (200)", async () => {
        await insertTestStudent();
        await request(server)
            .delete("/api/notifications/providers/email")
            .set("X-Test-User", "test")
            .expect(200);
    });

    it("POST /notifications/guiderequest - No body (400)", async () => {
        const resp = await request(server)
            .post("/api/notifications/guiderequest")
            .expect(400);
    });

    it("POST /notifications/guiderequest - No amount (400)", async () => {
        const resp = await request(server)
            .post("/api/notifications/guiderequest")
            .send({
                location: "Test",
            })
            .expect(400);
    });

    it("POST /notifications/guiderequest - No location (400)", async () => {
        const resp = await request(server)
            .post("/api/notifications/guiderequest")
            .send({
                amount: 1,
            })
            .expect(400);
    });

    it("POST /notifications/guiderequest - String amount (400)", async () => {
        const resp = await request(server)
            .post("/api/notifications/guiderequest")
            .send({
                amount: "test",
            })
            .expect(400);
    });

    it("POST /notifications/guiderequest - amount < 1 (400)", async () => {
        const resp = await request(server)
            .post("/api/notifications/guiderequest")
            .send({
                amount: 0,
            })
            .expect(400);
    });

    it("POST /notifications/guiderequest - amount < 0 (400)", async () => {
        const resp = await request(server)
            .post("/api/notifications/guiderequest")
            .send({
                amount: -12589123,
            })
            .expect(400);
    });

    it("POST /notifications/guiderequest - Request too many guides (412)", async () => {
        const id = await insertTestStudent();

        const resp = await request(server)
            .post("/api/notifications/guiderequest")
            .send({
                amount: 2,
                location: "Infodesk",
            })
            .expect(412)
            .expect("Content-Type", /json/)
            .then((response) => {
                assert.equal(response.body.availableGuides, 1);
            });
    });

    it("POST /notifications/guiderequest - Accepted flow (200)", async () => {
        const id = await insertTestStudent();

        const resp = await request(server)
            .post("/api/notifications/guiderequest")
            .send({
                amount: 1,
                location: "Infodesk",
            })
            .expect(200)
            .expect("Content-Type", /text\/plain/)
            .then((response) => {
                assert.equal(response.text, "OK");
            });

        const requestId = await request(server)
            .get("/api/notifications/guiderequest")
            .expect(200)
            .expect("Content-Type", /json/)
            .then((response) => {
                assert.equal(response.body.length, 1);
                assert.equal(response.body[0].amount, 1);
                assert.equal(response.body[0].location, "Infodesk");
                assert.deepEqual(response.body[0].pending, [id]);
                assert.ok(response.body[0].expireAt);
                assert.ok(response.body[0]._id);

                return response.body[0]._id;
            });

        await request(server)
            .post("/api/notifications/accept")
            .send({
                r: requestId,
                g: id,
            })
            .expect(200)
            .expect("Content-Type", /text\/plain/)
            .then((response) => {
                assert.equal(response.text, "OK");
            });
    });

    it("POST /notifications/guiderequest - Rejected flow (200)", async () => {
        const id = await insertTestStudent();

        const resp = await request(server)
            .post("/api/notifications/guiderequest")
            .send({
                amount: 1,
                location: "Infodesk",
            })
            .expect(200);

        const requestId = await request(server)
            .get("/api/notifications/guiderequest")
            .expect(200)
            .expect("Content-Type", /json/)
            .then((response) => {
                assert.equal(response.body.length, 1);
                assert.equal(response.body[0].amount, 1);
                assert.equal(response.body[0].location, "Infodesk");
                assert.deepEqual(response.body[0].pending, [id]);
                assert.ok(response.body[0].expireAt);
                assert.ok(response.body[0]._id);

                return response.body[0]._id;
            });

        const id2 = await insertTestStudent();

        await request(server)
            .post("/api/notifications/reject")
            .send({
                r: requestId,
                g: id,
            })
            .expect(200);

        await request(server)
            .get("/api/notifications/guiderequest")
            .expect(200)
            .expect("Content-Type", /json/)
            .then((response) => {
                assert.equal(response.body.length, 1);
                assert.equal(response.body[0].amount, 1);
                assert.equal(response.body[0].location, "Infodesk");
                assert.deepEqual(response.body[0].pending, [id2]);
                assert.ok(response.body[0].expireAt);
                assert.ok(response.body[0]._id);
            });
    });

    it("POST /notifications/guiderequest - Rejected flow without replacement (200)", async () => {
        const id = await insertTestStudent();

        const resp = await request(server)
            .post("/api/notifications/guiderequest")
            .send({
                amount: 1,
                location: "Infodesk",
            })
            .expect(200);

        const requestId = await request(server)
            .get("/api/notifications/guiderequest")
            .expect(200)
            .expect("Content-Type", /json/)
            .then((response) => {
                assert.equal(response.body.length, 1);
                assert.equal(response.body[0].amount, 1);
                assert.equal(response.body[0].location, "Infodesk");
                assert.deepEqual(response.body[0].pending, [id]);
                assert.ok(response.body[0].expireAt);
                assert.ok(response.body[0]._id);

                return response.body[0]._id;
            });

        await request(server)
            .post("/api/notifications/reject")
            .send({
                r: requestId,
                g: id,
            })
            .expect(200);
    });

    it("POST /notifications/reject - No body (400)", () => {
        return request(server).post("/api/notifications/reject").expect(400);
    });

    it("POST /notifications/accept - No body (400)", () => {
        return request(server).post("/api/notifications/accept").expect(400);
    });

    it("POST /notifications/reject - Invalid request id (400)", () => {
        return request(server)
            .post("/api/notifications/reject")
            .send({
                r: "1234567890",
                g: "1234567890",
            })
            .expect(400);
    });

    it("POST /notifications/accept - Invalid request id (400)", () => {
        return request(server)
            .post("/api/notifications/accept")
            .send({
                r: "1234567890",
                g: "1234567890",
            })
            .expect(400);
    });

    it("POST /notifications/reject - Request does not exist (400)", () => {
        return request(server)
            .post("/api/notifications/reject")
            .send({
                r: "6617fa094214bc6d27de03bc",
                g: "1234567890",
            })
            .expect(400);
    });

    it("POST /notifications/accept - Request does not exist (400)", () => {
        return request(server)
            .post("/api/notifications/accept")
            .send({
                r: "6617fa094214bc6d27de03bc",
                g: "1234567890",
            })
            .expect(400);
    });

    it("POST /notifications/reject - Request exists, but student is not requested (400)", async () => {
        const id = await insertTestStudent();

        const resp = await request(server)
            .post("/api/notifications/guiderequest")
            .send({
                amount: 1,
                location: "Infodesk",
            })
            .expect(200);

        await request(server)
            .get("/api/notifications/guiderequest")
            .expect(200)
            .expect("Content-Type", /json/);

        const requestId = await request(server)
            .get("/api/notifications/guiderequest")
            .expect(200)
            .expect("Content-Type", /json/)
            .then((response) => {
                assert.equal(response.body.length, 1);
                assert.equal(response.body[0].amount, 1);
                assert.equal(response.body[0].location, "Infodesk");
                assert.deepEqual(response.body[0].pending, [id]);
                assert.ok(response.body[0].expireAt);
                assert.ok(response.body[0]._id);

                return response.body[0]._id;
            });

        return request(server)
            .post("/api/notifications/reject")
            .send({
                r: requestId,
                g: "1234567890",
            })
            .expect(400);
    });

    it("POST /notifications/accept - Request exists, but student is not requested (400)", async () => {
        const id = await insertTestStudent();

        const resp = await request(server)
            .post("/api/notifications/guiderequest")
            .send({
                amount: 1,
                location: "Infodesk",
            })
            .expect(200);

        await request(server)
            .get("/api/notifications/guiderequest")
            .expect(200)
            .expect("Content-Type", /json/);

        const requestId = await request(server)
            .get("/api/notifications/guiderequest")
            .expect(200)
            .expect("Content-Type", /json/)
            .then((response) => {
                assert.equal(response.body.length, 1);
                assert.equal(response.body[0].amount, 1);
                assert.equal(response.body[0].location, "Infodesk");
                assert.deepEqual(response.body[0].pending, [id]);
                assert.ok(response.body[0].expireAt);
                assert.ok(response.body[0]._id);

                return response.body[0]._id;
            });

        return request(server)
            .post("/api/notifications/accept")
            .send({
                r: requestId,
                g: "1234567890",
            })
            .expect(400);
    });

    it("GET /notifications/guiderequest - OK (200)", async () => {
        const resp = await request(server)
            .get("/api/notifications/guiderequest")
            .expect(200);

        assert.deepEqual(resp.body, []);
    });

    it("GET /notifications/responses/pending - No station worker requests", async () => {
        await insertTestStudent();

        const resp = await request(server)
            .get("/api/notifications/responses/pending")
            .set("x-test-user", "test")
            .expect(200)
            .expect("Content-Type", /json/);

        assert.deepEqual(resp.body, []);
    });
});
