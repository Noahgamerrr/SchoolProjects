import request from "supertest";
import { dropDatabase } from "../util.js";
import server from "../../server.js";
import assert from "assert";
import {
    validStudent,
    addStudent,
    getAllStudents
} from "./common.js";

describe("Students - DELETE", () => {
    beforeEach(async () => {
        await dropDatabase();
    });

    describe("/DELETE students - happy flow", () => {
        it("it should delete a single student", async () => {
            const studentId = await addStudent(request(server), validStudent);

            await request(server)
                .delete("/api/students/" + studentId)
                .expect(204);

            let allStudents = await getAllStudents(request(server));

            assert.equal(allStudents.length, 0);
        });
    });

    describe("/DELETE students - error flow", () => {
        it("it should not delete a nonexisting student", async () => {
            const studentId = await addStudent(request(server), validStudent);

            await request(server)
                .delete("/api/students/" + studentId)
                .expect(204);

            await request(server)
                .delete("/api/students/" + studentId)
                .expect(404);
        });
    });
});
