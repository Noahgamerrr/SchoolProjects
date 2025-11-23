import request from "supertest";
import { dropDatabase } from "./util.js";
import server from "../server.js";
import assert from "assert";
import { Visitor } from "../api/visitors/visitors-model.js";
import { Openday } from "../api/opendays/opendays-model.js";

async function insertVisitor() {
    const openday = await Openday.create({
        date: "2024-04-24",
    });

    const visitor = await Visitor.create({
        name: "Max Mustermann",
        grade: 3,
        email: "test@example.org",
    });

    return visitor;
}

describe("Visitors - Tests", () => {
    beforeEach(async () => {
        await dropDatabase();
    });

    it("GET /api/visitors - No visitors", async () => {
        await request(server).get("/api/visitors").expect(200).expect([]);
    });

    it("GET /api/visitors/:id - Visitor not found", async () => {
        await request(server)
            .get("/api/visitors/6617fa094214bc5d23ce03bc")
            .expect(404);
    });

    it("GET /api/visitors/:id - Invalid id", async () => {
        await request(server).get("/api/visitors/invalid_id").expect(400);
    });

    it("GET /api/visitors/:id - OK", async () => {
        const visitor = await insertVisitor();

        await request(server)
            .get(`/api/visitors/${visitor._id}`)
            .expect(200)
            .expect("Content-Type", /json/);
    });

    it("GET /api/visitors - One visitor", async () => {
        const visitor = await insertVisitor();

        await request(server)
            .get("/api/visitors")
            .expect(200)
            .expect((res) => {
                assert.strictEqual(res.body.length, 1);
                assert.strictEqual(res.body[0].name, visitor.name);
            });
    });

    it("POST /api/visitors - OK", async () => {
        const openday = await Openday.create({
            date: "2024-04-24",
        });

        await request(server)
            .post("/api/visitors")
            .send({
                name: "Max Mustermann",
                grade: 2,
                email: "test@example.org",
            })
            .expect(201)
            .expect("Content-Type", /json/);

        const visitors = await Visitor.find();
        assert.strictEqual(visitors.length, 1);
    });

    it("POST /api/visitors/:id - Invalid", async () => {
        await request(server)
            .post("/api/visitors")
            .send({
                _id: 1,
                name: "Max Mustermann",
                grade: 4,
            })
            .expect(400);
    });

    it("PUT /api/visitors/:id - Visitor not found", async () => {
        await request(server)
            .put("/api/visitors/6617fa094214bc5d23ce03bc")
            .send({
                name: "Max Mustermann",
                grade: 4,
            })
            .expect(404);
    });

    it("PUT /api/visitors/:id - Invalid id", async () => {
        await request(server)
            .put("/api/visitors/invalid_id")
            .send({
                name: "Max Mustermann",
                age: 42,
            })
            .expect(400);
    });

    it("PUT /api/visitors/:id - OK", async () => {
        const visitor = await insertVisitor();

        await request(server)
            .put(`/api/visitors/${visitor._id}`)
            .send({
                name: "Max Mustermann",
                grade: 4,
            })
            .expect(204);

        const updatedVisitor = await Visitor.findById(visitor._id);
        assert.strictEqual(updatedVisitor.grade, 4);
    });

    it("DELETE /api/visitors/:id - Visitor not found", async () => {
        await request(server)
            .delete("/api/visitors/6617fa094214bc5d23ce03bc")
            .expect(404);
    });

    it("DELETE /api/visitors/:id - Invalid id", async () => {
        await request(server).delete("/api/visitors/invalid_id").expect(400);
    });

    it("DELETE /api/visitors/:id - OK", async () => {
        const visitor = await insertVisitor();

        await request(server)
            .delete(`/api/visitors/${visitor._id}`)
            .expect(204);

        const visitors = await Visitor.find();
        assert.strictEqual(visitors.length, 0);
    });
});
