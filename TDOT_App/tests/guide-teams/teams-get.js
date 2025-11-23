import request from "supertest";
import { dropDatabase } from "../util.js";
import server from "../../server.js";
import assert from "assert";
import { addTeam, VALID_TEAM, ANOTHER_VALID_TEAM } from "./common.js";
import { otherValidStudent, validStudent } from "../students/common.js";

describe("Guide-Teams - GET", () => {
    beforeEach(async () => {
        await dropDatabase();
    });

    describe("/GET guide-teams", () => {
        it("it should initially return an empty list", async () => {
            const response = await request(server)
                .get("/api/guide-teams")
                .expect(200)
                .expect("Content-Type", /json/);
            assert.equal(response.body.length, 0);
        });

        it("it should return a list with a single team", async () => {
            const teamId = await addTeam(request(server), VALID_TEAM);

            const getResponse = await request(server)
                .get("/api/guide-teams")
                .expect(200)
                .expect("Content-Type", /json/);

            assert.equal(getResponse.body.length, 1);
            assert.equal(getResponse.body[0]._id, teamId);
        });

        it("it should list two guide-teams", async () => {
            await addTeam(request(server), VALID_TEAM);
            await addTeam(request(server), ANOTHER_VALID_TEAM);

            const getResponse = await request(server)
                .get("/api/guide-teams")
                .expect(200)
                .expect("Content-Type", /json/);

            assert.equal(getResponse.body.length, 2);
        });
    });

    describe("/GET guide-teams by id", () => {
        it("it should return 404 for an unknown guide-team", async () => {
            await request(server)
                .get("/api/guide-teams/65326f5fec6cd87154f9db87")
                .expect(404);
        });

        it("it should return a previously inserted guide-team", async () => {
            const teamId = await addTeam(request(server), VALID_TEAM);

            const getResponse = await request(server)
                .get("/api/guide-teams/" + teamId)
                .expect(200)
                .expect("Content-Type", /json/);

            assert.equal(getResponse.body._id, teamId);
        });

        it("it should return an error for an invalid id", async () => {
            await request(server)
                .get("/api/guide-teams/neverGonnaRunAround")
                .expect(400)
                .expect("Content-Type", /plain/);
        });

        it("it should return 404 for an unknown guide-team", async () => {
            await request(server)
                .get("/api/guide-teams/65326f5fec6cd87154f9db87/members")
                .expect(404);
        });
    });

    describe("GET members by guide team", () => {
        it("it should return a previously inserted guide-teams members", async () => {
            const teamId = await addTeam(request(server), VALID_TEAM);
            let copyStudent = { ...otherValidStudent };
            copyStudent.guideTeams[0] = {
                teamId: teamId,
                isLeader: true,
            };
            const postResponse = await request(server)
                .post("/api/students")
                .send(copyStudent)
                .expect(201)
                .expect("Content-Type", /json/);

            const getResponse = await request(server)
                .get("/api/guide-teams/" + teamId + "/members")
                .expect(200)
                .expect("Content-Type", /json/);
        });
    });

    it("GET /guide-teams - invalid query", async () => {
        await request(server).get("/api/guide-teams?_id=a").expect(500);
    });

    it("GET /guide-teams/:id/members - invalid id", async () => {
        await request(server).get("/api/guide-teams/123/members").expect(400);
    });
});
