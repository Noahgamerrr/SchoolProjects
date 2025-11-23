import request from "supertest";
import { dropDatabase } from "../util.js";
import server from "../../server.js";
import assert from "assert";
import {
    getTeam,
    initializeGuideTeams,
    addTeam,
    VALID_TEAM,
    ANOTHER_VALID_TEAM,
    addStudent,
    VALID_STUDENT,
} from "./common.js";

describe("Guide-Teams - PUT", () => {
    beforeEach(async () => {
        await dropDatabase();
    });

    describe("/PUT guide-teams - happy flow", () => {
        it("it should update a single guide-team", async () => {
            const postResponse = await request(server)
                .post("/api/guide-teams")
                .send(VALID_TEAM)
                .expect(201)
                .expect("Content-Type", /json/);

            const teamId = postResponse.body._id;

            const team = await getTeam(request(server), teamId);
            assert.equal(team._id, teamId);

            await request(server)
                .put("/api/guide-teams/" + teamId)
                .send({ name: "Updated name" })
                .expect(204);

            const updatedTeam = await getTeam(request(server), teamId);
            assert.equal(updatedTeam.name, "Updated name");
        });
    });

    describe("/PUT guide-teams - same name", () => {
        it("it should add two guide-teams and refuse to rename one guide-team to the other team's name", async () => {
            await request(server)
                .post("/api/guide-teams")
                .send(VALID_TEAM)
                .expect(201)
                .expect("Content-Type", /json/);

            const postResponse = await request(server)
                .post("/api/guide-teams")
                .send(ANOTHER_VALID_TEAM)
                .expect(201)
                .expect("Content-Type", /json/);

            const teamId = postResponse.body._id;

            const team = await getTeam(request(server), teamId);
            assert.equal(team.name, ANOTHER_VALID_TEAM.name);

            await request(server)
                .put("/api/guide-teams/" + teamId)
                .send({ name: VALID_TEAM.name })
                .expect(400)
                .expect("Content-Type", /plain/);

            const updatedTeam = await getTeam(request(server), teamId);
            assert.equal(updatedTeam.name, ANOTHER_VALID_TEAM.name);
        });

        it("it should not update a team with an invalid id", async () => {
            await request(server)
                .put("/api/guide-teams/neverGonnaGiveYouUp")
                .send({ name: VALID_TEAM.name })
                .expect(400)
                .expect("Content-Type", /plain/);
        });

        it("it should not update a non-existing team", async () => {
            await request(server)
                .put("/api/guide-teams/60b1e3b4d4f3f1f1f1f1f1f1")
                .send({ name: VALID_TEAM.name })
                .expect(404);
        });
    });

    describe("/PUT guide-teams - team-leader", () => {
        it("it should set a new team-leader", async () => {
            const [
                firstGuideTeamId,
                secondGuideTeamId,
                firstStudentId,
                secondStudentId,
            ] = await initializeGuideTeams(request(server));

            const studentResponse = await request(server)
                .get(`/api/students/${firstStudentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            const matchVal = studentResponse.body.__v;

            await request(server)
                .put(
                    `/api/students/${firstStudentId}/guideLeader/${secondGuideTeamId}`
                )
                .set("if-match", matchVal)
                .expect(200);

            const newLeaderResponse = await request(server)
                .get(`/api/students/${firstStudentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            const newLeader = newLeaderResponse.body;
            const leaderTeam = newLeader.guideTeams.find(
                (gt) => gt.teamId == secondGuideTeamId
            );
            assert.equal(true, leaderTeam.isLeader);

            const oldLeaderResponse = await request(server)
                .get(`/api/students/${secondStudentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            const oldLeader = oldLeaderResponse.body;
            const memberTeam = oldLeader.guideTeams.find(
                (gt) => gt.teamId == secondGuideTeamId
            );
            assert.equal(false, memberTeam.isLeader);
        });

        it("it should fail on invalid team id", async () => {
            const [
                firstGuideTeamId,
                secondGuideTeamId,
                firstStudentId,
                secondStudentId,
            ] = await initializeGuideTeams(request(server));

            const studentResponse = await request(server)
                .get(`/api/students/${firstStudentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            const matchVal = studentResponse.body.__v;

            await request(server)
                .put(`/api/students/${firstStudentId}/guideLeader/a`)
                .set("if-match", matchVal)
                .expect(400);
        });

        it("it should not set a team-leader as the new team-leader", async () => {
            const [
                firstGuideTeamId,
                secondGuideTeamId,
                firstStudentId,
                secondStudentId,
            ] = await initializeGuideTeams(request(server));

            const studentResponse = await request(server)
                .get(`/api/students/${secondStudentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            const matchVal = studentResponse.body.__v;

            await request(server)
                .put(
                    `/api/students/${secondStudentId}/guideLeader/${secondGuideTeamId}`
                )
                .set("if-match", matchVal)
                .expect(400);
        });

        it("it should not set a student with invalid version-number as new-teamleader", async () => {
            const [
                firstGuideTeamId,
                secondGuideTeamId,
                firstStudentId,
                secondStudentId,
            ] = await initializeGuideTeams(request(server));

            await request(server)
                .put(
                    `/api/students/${firstStudentId}/guideLeader/${secondGuideTeamId}`
                )
                .set("if-match", 1234)
                .expect(412);
        });

        it("it should not set a student without a version-number as team-leader", async () => {
            const [
                firstGuideTeamId,
                secondGuideTeamId,
                firstStudentId,
                secondStudentId,
            ] = await initializeGuideTeams(request(server));

            await request(server)
                .put(
                    `/api/students/${firstStudentId}/guideLeader/${secondGuideTeamId}`
                )
                .expect(400);
        });

        it("it should not set a non-existing student as teamleader", async () => {
            const [
                firstGuideTeamId,
                secondGuideTeamId,
                firstStudentId,
                secondStudentId,
            ] = await initializeGuideTeams(request(server));

            await request(server)
                .put(
                    `/api/students/60b1e3b4d4f3f1f1f1f1f1f1/guideLeader/${secondGuideTeamId}`
                )
                .set("if-match", 1234)
                .expect(404);
        });

        it("it should not set a student that's not part of the team as teamLeader", async () => {
            const [
                firstGuideTeamId,
                secondGuideTeamId,
                firstStudentId,
                secondStudentId,
            ] = await initializeGuideTeams(request(server));

            const studentResponse = await request(server)
                .get(`/api/students/${secondStudentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            const matchVal = studentResponse.body.__v;

            await request(server)
                .put(
                    `/api/students/${secondStudentId}/guideLeader/${firstGuideTeamId}`
                )
                .set("if-match", matchVal)
                .expect(400);
        });

        it("it should not set a student as the teamleader of a non-existing team", async () => {
            const [
                firstGuideTeamId,
                secondGuideTeamId,
                firstStudentId,
                secondStudentId,
            ] = await initializeGuideTeams(request(server));

            const studentResponse = await request(server)
                .get(`/api/students/${secondStudentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            const matchVal = studentResponse.body.__v;

            await request(server)
                .put(
                    `/api/students/${secondStudentId}/guideLeader/60b1e3b4d4f3f1f1f1f1f1f1`
                )
                .set("if-match", matchVal)
                .expect(400);
        });

        it("it should not set a student with invalid id as the teamleader", async () => {
            const [
                firstGuideTeamId,
                secondGuideTeamId,
                firstStudentId,
                secondStudentId,
            ] = await initializeGuideTeams(request(server));
            await request(server)
                .put(
                    `/api/students/undefined/guideLeader/60b1e3b4d4f3f1f1f1f1f1f1`
                )
                .set("if-match", 1234)
                .expect(400);
        });
    });

    describe("/PUT guide-teams - remove students from guide-team", () => {
        it("it should remove a team-member", async () => {
            const [
                firstGuideTeamId,
                secondGuideTeamId,
                firstStudentId,
                secondStudentId,
            ] = await initializeGuideTeams(request(server));

            const studentResponse = await request(server)
                .get(`/api/students/${firstStudentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            const matchVal = studentResponse.body.__v;

            await request(server)
                .delete(
                    `/api/students/${firstStudentId}/guideTeam/${secondGuideTeamId}`
                )
                .set("if-match", matchVal)
                .expect(200);

            const updatedResponse = await request(server)
                .get(`/api/students/${firstStudentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            const updated = updatedResponse.body;
            assert.equal(1, updated.guideTeams.length);
        });

        it("it should not remove student with invalid version-number", async () => {
            const [
                firstGuideTeamId,
                secondGuideTeamId,
                firstStudentId,
                secondStudentId,
            ] = await initializeGuideTeams(request(server));

            await request(server)
                .delete(
                    `/api/students/${firstStudentId}/guideTeam/${secondGuideTeamId}`
                )
                .set("if-match", 1234)
                .expect(412);
        });

        it("it should not remove a student without a version-number", async () => {
            const [
                firstGuideTeamId,
                secondGuideTeamId,
                firstStudentId,
                secondStudentId,
            ] = await initializeGuideTeams(request(server));

            await request(server)
                .delete(
                    `/api/students/${firstStudentId}/guideTeam/${secondGuideTeamId}`
                )
                .expect(400);
        });

        it("it should not remove a non-existing student", async () => {
            const [
                firstGuideTeamId,
                secondGuideTeamId,
                firstStudentId,
                secondStudentId,
            ] = await initializeGuideTeams(request(server));

            await request(server)
                .delete(
                    `/api/students/60b1e3b4d4f3f1f1f1f1f1f1/guideTeam/${secondGuideTeamId}`
                )
                .set("if-match", 1234)
                .expect(404);
        });

        it("it should not remove a student that's not part of the team", async () => {
            const [
                firstGuideTeamId,
                secondGuideTeamId,
                firstStudentId,
                secondStudentId,
            ] = await initializeGuideTeams(request(server));

            const studentResponse = await request(server)
                .get(`/api/students/${secondStudentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            const matchVal = studentResponse.body.__v;

            await request(server)
                .delete(
                    `/api/students/${secondStudentId}/guideTeam/${firstGuideTeamId}`
                )
                .set("if-match", matchVal)
                .expect(400);
        });

        it("it should not remove a student with invalid id", async () => {
            const [
                firstGuideTeamId,
                secondGuideTeamId,
                firstStudentId,
                secondStudentId,
            ] = await initializeGuideTeams(request(server));
            await request(server)
                .delete(
                    `/api/students/undefined/guideTeam/60b1e3b4d4f3f1f1f1f1f1f1`
                )
                .set("if-match", 1234)
                .expect(400);
        });
    });

    describe("/PUT guide-teams - add student to guide-team", () => {
        it("it should set add a new team-member", async () => {
            const [
                firstGuideTeamId,
                secondGuideTeamId,
                firstStudentId,
                secondStudentId,
            ] = await initializeGuideTeams(request(server));

            const studentResponse = await request(server)
                .get(`/api/students/${secondStudentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            const matchVal = studentResponse.body.__v;

            await request(server)
                .put(
                    `/api/students/${secondStudentId}/guideTeam/${firstGuideTeamId}`
                )
                .set("if-match", matchVal)
                .expect(200);

            const updatedResponse = await request(server)
                .get(`/api/students/${secondStudentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            const updated = updatedResponse.body;
            assert.equal(firstGuideTeamId, updated.guideTeams[0].teamId);
        });

        it("it should set the first student of a team as the team-leader", async () => {
            const teamId = await addTeam(request(server), VALID_TEAM);
            const studentId = await addStudent(request(server), VALID_STUDENT);

            const studentResponse = await request(server)
                .get(`/api/students/${studentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            const matchVal = studentResponse.body.__v;

            await request(server)
                .put(`/api/students/${studentId}/guideTeam/${teamId}`)
                .set("if-match", matchVal)
                .expect(200);

            const updatedResponse = await request(server)
                .get(`/api/students/${studentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            const updated = updatedResponse.body;
            assert.equal(teamId, updated.guideTeams[0].teamId);
            assert.equal(true, updated.guideTeams[0].isLeader);
        });

        it("it should not add a student with invalid version-number", async () => {
            const [
                firstGuideTeamId,
                secondGuideTeamId,
                firstStudentId,
                secondStudentId,
            ] = await initializeGuideTeams(request(server));

            await request(server)
                .put(
                    `/api/students/${secondStudentId}/guideTeam/${firstGuideTeamId}`
                )
                .set("if-match", 1234)
                .expect(412);
        });

        it("it should not add a student without a version-number", async () => {
            const [
                firstGuideTeamId,
                secondGuideTeamId,
                firstStudentId,
                secondStudentId,
            ] = await initializeGuideTeams(request(server));

            await request(server)
                .put(
                    `/api/students/${firstStudentId}/guideTeam/${secondGuideTeamId}`
                )
                .expect(400);
        });

        it("it should not add a non-existing student", async () => {
            const [
                firstGuideTeamId,
                secondGuideTeamId,
                firstStudentId,
                secondStudentId,
            ] = await initializeGuideTeams(request(server));

            await request(server)
                .put(
                    `/api/students/60b1e3b4d4f3f1f1f1f1f1f1/guideTeam/${secondGuideTeamId}`
                )
                .set("if-match", 1234)
                .expect(404);
        });

        it("it should not add a student that's part of the team as teamLeader", async () => {
            const [
                firstGuideTeamId,
                secondGuideTeamId,
                firstStudentId,
                secondStudentId,
            ] = await initializeGuideTeams(request(server));

            const studentResponse = await request(server)
                .get(`/api/students/${secondStudentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            const matchVal = studentResponse.body.__v;

            await request(server)
                .put(
                    `/api/students/${firstStudentId}/guideTeam/${firstGuideTeamId}`
                )
                .set("if-match", matchVal)
                .expect(400);
        });

        it("it should not add a student to a non-existing team", async () => {
            const [
                firstGuideTeamId,
                secondGuideTeamId,
                firstStudentId,
                secondStudentId,
            ] = await initializeGuideTeams(request(server));

            const studentResponse = await request(server)
                .get(`/api/students/${secondStudentId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            const matchVal = studentResponse.body.__v;

            await request(server)
                .put(
                    `/api/students/${secondStudentId}/guideTeam/60b1e3b4d4f3f1f1f1f1f1f1`
                )
                .set("if-match", matchVal)
                .expect(400);
        });

        it("it should not add a student with invalid id", async () => {
            const [
                firstGuideTeamId,
                secondGuideTeamId,
                firstStudentId,
                secondStudentId,
            ] = await initializeGuideTeams(request(server));
            await request(server)
                .put(
                    `/api/students/undefined/guideTeam/60b1e3b4d4f3f1f1f1f1f1f1`
                )
                .set("if-match", 1234)
                .expect(400);
        });
    });
});
