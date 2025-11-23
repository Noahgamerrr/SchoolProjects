import request from "supertest";
import { dropDatabase } from "../util.js";
import server from "../../server.js";
import assert from "assert";
import {
    getTeam,
    VALID_TEAM,
} from "./common.js";

describe("Guide-Teams - POST", () => {
    beforeEach(async () => {
        await dropDatabase();
    });

    describe("/POST guide-teams - happy flow", () => {
        it("it should add a single guide-team", async () => {
            const postResponse = await request(server)
                .post("/api/guide-teams")
                .send(VALID_TEAM)
                .expect(201)
                .expect("Content-Type", /json/);

            const teamId = postResponse.body._id;

            assert.equal(typeof postResponse.body, "object");
            assert.notEqual(teamId, undefined);
            assert.equal(
                postResponse.headers.location,
                `/api/guide-teams/${teamId}`
            );

            const team = await getTeam(request(server), teamId);

            assert.equal(team._id, teamId);
        });
    });

    describe("/POST guide-teams - same name", () => {
        it("it should add a guide-team and refuse the next one with the same name", async () => {
            const postResponse = await request(server)
                .post("/api/guide-teams")
                .send(VALID_TEAM)
                .expect(201)
                .expect("Content-Type", /json/);

            await request(server)
                .post("/api/guide-teams")
                .send({...VALID_TEAM})
                .expect(400)
                .expect("Content-Type", /plain/);

            const teamId = postResponse.body._id;

            assert.equal(typeof postResponse.body, "object");
            assert.notEqual(teamId, undefined);
            assert.equal(
                postResponse.headers.location,
                `/api/guide-teams/${teamId}`
            );

            const team = await getTeam(request(server), teamId);

            assert.equal(team._id, teamId);
        });
    });
});