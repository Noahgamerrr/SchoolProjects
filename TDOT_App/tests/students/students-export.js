import request from "supertest"
import { dropDatabase } from "../util.js";
import server from "../../server.js";
import assert from "assert";
import {
    addStudent,
    validStudent,
    anotherValidStudent
} from "./common.js";

describe("Students - Export", () => {
    beforeEach(async () => {
        await dropDatabase();
    });

    describe("/GET students export", () => {
        it("it should initially return a file with only the header-line", async () => {
            const response = await request(server)
                .get("/api/students/export")
                .expect(200)
                .expect("Content-Type", /text\/csv/);
            const body = response.text;
            assert(body, `${["shortform", "firstname", "lastname", "stations", "guideTeams"].join("\t")}\n`);
        });

        it("it should return a file with two entries", async () => {
            await addStudent(request(server), validStudent);
            await addStudent(request(server), anotherValidStudent);
            const response = await request(server)
                .get("/api/students/export")
                .expect(200)
                .expect("Content-Type", /text\/csv/);
            const body = response.text;
            assert(body.split("\n").length, 3);
        });
    });
});
