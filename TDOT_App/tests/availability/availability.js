import request from "supertest";
import { dropDatabase } from "../util.js";
import server from "../../server.js";
import { initializeAvailability, ANOTHER_VALID_STUDENT } from "./common.js";
import assert from "assert";

describe("Availability - Teacher view", () => {
    beforeEach(async () => {
        await dropDatabase();
        await initializeAvailability(request(server));
    });

    describe("/GET - Teacher view", () => {
        it("it should get all teams with their members", async () => {
            const response = await request(server)
                .get("/api/students/teams")
                .expect(200)
                .expect("Content-Type", /json/);

            const { guideTeams, stations } = response.body;

            const guideTeamIds = Object.keys(guideTeams);
            assert.equal(guideTeamIds.length, 2);
            assert.equal(guideTeams[guideTeamIds[0]].members.length, 1);
            assert.equal(guideTeams[guideTeamIds[0]].name, "Super cool team 1");
            assert.equal(
                guideTeams[guideTeamIds[0]].teamLeader.shortform,
                "Ciara"
            );
            assert.equal(guideTeams[guideTeamIds[1]].members.length, 2);

            const stationsIds = Object.keys(stations);
            assert.equal(stationsIds.length, 2);
            assert.equal(stations[stationsIds[0]].members.length, 2);
            assert.equal(stations[stationsIds[0]].name, "NSCS-Stand");
            assert.equal(
                stations[stationsIds[0]].teamLeader.shortform,
                "Aaron"
            );
            assert.equal(stations[stationsIds[1]].members.length, 1);
        });
    });

    describe("/GET - Teamlead view", () => {
        it("it should get all teams with their members", async () => {
            const response = await request(server)
                .get(
                    `/api/students/${ANOTHER_VALID_STUDENT.shortform}/teamMembers`
                )
                .expect(200)
                .expect("Content-Type", /json/);

            const { guideTeams, stations } = response.body;

            const guideTeamIds = Object.keys(guideTeams);
            assert.equal(guideTeamIds.length, 1);
            assert.equal(guideTeams[guideTeamIds[0]].members.length, 2);
            assert.equal(guideTeams[guideTeamIds[0]].name, "Super cool team 2");

            const stationIds = Object.keys(stations);
            assert.equal(stationIds.length, 1);
            assert.equal(stations[stationIds[0]].members.length, 2);
            assert.equal(stations[stationIds[0]].name, "NSCS-Stand");
        });
    });
});
