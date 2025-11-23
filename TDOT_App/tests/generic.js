import request from "supertest";
import { dropDatabase } from "./util.js";
import server from "../server.js";
import assert from "assert";
import { Openday } from "../api/opendays/opendays-model.js";
import { Tour } from "../api/tours/tours-model.js";
import mongoose from "mongoose";

describe("Generic - Tests", () => {
    beforeEach(async () => {
        await dropDatabase();
    });

    it("GET /api/audit-log", async () => {
        await request(server)
            .get("/api/audit-log")
            .expect(200)
            .expect("Content-Type", /json/)
            .then((response) => {
                assert.deepEqual(response.body, []);
            });
    });

    it("GET /live", async () => {
        await request(server)
            .get("/live")
            .expect(200)
            .expect("Content-Type", /json/)
            .then((response) => {
                assert.deepEqual(response.body, { status: "ok" });
            });
    });

    it("GET /health", async () => {
        await request(server)
            .get("/health")
            .expect(200)
            .expect("Content-Type", /json/)
            .then((response) => {
                assert.deepEqual(response.body, { status: "ok" });
            });
    });

    it("GET /health - MongoDB not connected", async () => {
        const readyState = mongoose.connection.readyState;
        mongoose.connection.readyState = 0;
        await request(server)
            .get("/health")
            .expect(503)
            .expect("Content-Type", /json/)
            .then((response) => {
                assert.deepEqual(response.body, {
                    status: "error",
                });
            });
        mongoose.connection.readyState = readyState;
    });

    it("GET /health - Simulate mongoose connecting", async () => {
        const readyState = mongoose.connection.readyState;
        mongoose.connection.readyState = 2;
        await request(server)
            .get("/health")
            .expect(503)
            .expect("Content-Type", /json/)
            .then((response) => {
                assert.deepEqual(response.body, {
                    status: "error",
                });
            });
        mongoose.connection.readyState = readyState;
    });
});
