import request from "supertest";
import { dropDatabase } from "./util.js";
import server from "../server.js";
import assert from "assert";

import { otherValidStudent, validStudent } from "./students/common.js";
import { Student } from "../api/students/students-model.js";
import { Tour } from "../api/tours/tours-model.js";
import { Openday } from "../api/opendays/opendays-model.js";
import { Station } from "../api/stations/stations-model.js";

describe("Statistics - Tests", () => {
    beforeEach(async () => {
        await dropDatabase();
    });

    it("GET /statistics/teacher - No statistics", async () => {
        await request(server)
            .get("/api/statistics/teacher")
            .expect(200)
            .expect({
                stations: {},
                studentsOnBreak: [],
                toursStarted: [],
            });
    });

    it("GET /statistics/teacher - Break statistics", async () => {
        const student = await Student.create({
            ...validStudent,
            activity: [
                {
                    activity: "break",
                    time: new Date() - 1000,
                },
            ],
        });

        await request(server)
            .get("/api/statistics/teacher")
            .expect(200)
            .expect({
                stations: {},
                studentsOnBreak: [
                    {
                        name: `${student.lastname} ${student.firstname}`,
                        time: student.activity[0].time.toISOString(),
                    },
                ],
                toursStarted: [],
            });
    });

    it("GET /statistics/teacher - Tour statistics", async () => {
        const openday = await Openday.create({
            date: "2024-04-24",
        });

        const student = await Student.create({
            ...validStudent,
            activity: [
                {
                    activity: "tour",
                    time: new Date() - 1000,
                },
            ],
        });

        const tour = await Tour.create({
            startTime: "2024-04-24T10:00:00",
            stations: [],
            visitors: [],
            guide: student._id,
            identifier: "brot1"
        });

        await request(server)
            .get("/api/statistics/teacher")
            .expect(200)
            .expect({
                stations: {},
                studentsOnBreak: [],
                toursStarted: [
                    {
                        amount: 1,
                        hour: "10:00",
                        visitors: 0,
                    },
                ],
            });
    });

    it("GET /statistics/teacher - Station statistics", async () => {
        const openday = await Openday.create({
            date: "2024-04-24",
        });

        const student = await Student.create({
            ...validStudent,
            activity: [
                {
                    activity: "tour",
                    time: new Date() - 1000,
                },
            ],
        });

        const station = await Station.create({
            name: "Station 1",
            description: "Description",
            capacity: 1,
            minWorkers: 1,
            maxWorkers: 4,
            interactType: "audio-visual",
            tags: ["NSCS", "Info"],
            roomNr: "420",
        });

        const tour = await Tour.create({
            identifier: "iden1",
            startTime: "2024-04-24T10:00:00",
            stations: [
                {
                    id: station._id,
                    time: {
                        start: "2024-04-24T10:00:00",
                        end: "2024-04-24T10:00:01",
                    },
                },
            ],
            visitors: [],
            guide: student._id,
        });

        const tour2 = await Tour.create({
            identifier: "iden2",
            startTime: "2024-04-24T11:00:00",
            stations: [
                {
                    id: station._id,
                    time: {
                        start: "2024-04-24T11:00:00",
                        end: "2024-04-24T11:00:01",
                    },
                },
            ],
            visitors: [],
            guide: student._id,
        });

        await request(server)
            .get("/api/statistics/teacher")
            .expect(200)
            .expect({
                stations: {
                    [station._id]: {
                        name: station.name,
                        timesVisited: 2,
                        averageTimeSpent: "0min 1s",
                    },
                },
                studentsOnBreak: [],
                toursStarted: [
                    {
                        amount: 1,
                        hour: "10:00",
                        visitors: 0,
                    },
                    {
                        amount: 1,
                        hour: "11:00",
                        visitors: 0,
                    },
                ],
            });
    });
});
