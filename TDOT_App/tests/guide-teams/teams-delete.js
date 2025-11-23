import request from "supertest";
import { dropDatabase } from "../util.js";
import server from "../../server.js";
import assert from "assert";
import { getTeam, VALID_TEAM, ANOTHER_VALID_TEAM } from "./common.js";

describe("Guide-Teams - DELETE", () => {
    beforeEach(async () => {
        await dropDatabase();
    });

    describe("/DELETE guide-teams - happy flow", () => {
        it("it should delete a single guide-team", async () => {
            const postResponse = await request(server)
                .post("/api/guide-teams")
                .send(VALID_TEAM)
                .expect(201)
                .expect("Content-Type", /json/);

            const response = await request(server)
                .get("/api/guide-teams")
                .expect(200)
                .expect("Content-Type", /json/);
            assert.equal(response.body.length, 1);

            const teamId = postResponse.body._id;

            const team = await getTeam(request(server), teamId);
            assert.equal(team._id, teamId);

            await request(server)
                .delete("/api/guide-teams/" +teamId)
                .expect(204);

            const secondResponse = await request(server)
                .get("/api/guide-teams")
                .expect(200)
                .expect("Content-Type", /json/);
            assert.equal(secondResponse.body.length, 0);
        });
    });

    describe("/DELETE guide-teams - sad flow :(", () => {
        it("it should not delete a team with an invalid id", async () => {
            await request(server)
                .delete("/api/guide-teams/neverGonnaLetYouDown")
                .send({name: VALID_TEAM.name})
                .expect(400)
                .expect("Content-Type", /plain/);
        });

        it("it should not delete a non-existing team", async () => {
            await request(server)
                .delete("/api/guide-teams/60b1e3b4d4f3f1f1f1f1f1f1")
                .send({name: VALID_TEAM.name})
                .expect(404);
        });
    });
});