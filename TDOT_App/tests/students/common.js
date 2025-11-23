import assert from "assert";

export const otherValidStudent = {
    openDayId: "1234567890",
    shortform: "Tripolt",
    firstname: "Matth",
    lastname: "Trp",
    stations: [],
    guideTeams: [],
    activity: [
        {
            time: "2024-04-01T09:00:00.000Z",
            activity: "Ended Break",
        },
        {
            time: "2024-04-01T13:00:00.000Z",
            activity: "Started tour",
        },
    ],
};

export const validStudent = {
    shortform: "doej",
    firstname: "John",
    lastname: "Doe",
    stations: [],
    guideTeams: [
        {
            teamId: "A",
            isLeader: true,
        },
        {
            teamId: "B",
            isLeader: false,
        },
    ],
    activity: [
        {
            time: "2024-04-01T09:00:00.000Z",
            activity: "Ended Break",
        },
        {
            time: "2024-04-01T13:00:00.000Z",
            activity: "Started tour",
        },
    ],
};

export const anotherValidStudent = {
    shortform: "smitha",
    firstname: "Alice",
    lastname: "Smith",
    stations: [],
    guideTeams: [
        {
            teamId: "C",
            isLeader: false,
        },
        {
            teamId: "D",
            isLeader: true,
        },
    ],
    activity: [
        {
            time: "2024-04-01T10:30:00.000Z",
            activity: "Started Break",
        },
        {
            time: "2024-04-01T14:30:00.000Z",
            activity: "Ended Break",
        },
    ],
};

export const validStation = {
    name: "NSCS-Stand",
    description: "Hier wird das Innenleben eines Computers erklärt",
    capacity: 1,
    minWorkers: 1,
    maxWorkers: 4,
    interactType: "audio-visual",
    tags: ["NSCS", "Info"],
    roomNr: "420",
};

export async function addStudent(r, student) {
    const response = await r
        .post("/api/students")
        .send(student)
        .expect(201)
        .expect("Content-Type", /json/);

    const studentId = response.body._id;

    assert.equal(typeof response.body, "object");
    assert.notEqual(studentId, undefined);
    assert.equal(response.headers.location, `/api/students/${studentId}`);

    return studentId;
}

export async function getStudent(r, studentId) {
    const response = await r
        .get("/api/students/" + studentId)
        .expect(200)
        .expect("Content-Type", /json/);

    assert.equal(typeof response.body, "object");
    assert.equal(response.body._id, studentId);

    return response.body;
}

export async function getAllStudents(r) {
    const response = await r
        .get("/api/students")
        .expect(200)
        .expect("Content-Type", /json/);

    assert.equal(typeof response.body, "object");

    return response.body;
}

export async function addStation(r, station) {
    const response = await r
        .post("/api/stations")
        .send(station)
        .expect(201)
        .expect("Content-Type", /json/);

    const stationId = response.body._id;

    assert.equal(typeof response.body, "object");
    assert.notEqual(stationId, undefined);
    assert.equal(response.headers.location, `/api/stations/${stationId}`);

    return stationId;
}

export async function updateOpenday(r, stations) {
    const response = await r
        .patch("/api/opendays/active/stationsOrder")
        .send(stations)
        .expect(200)
        .expect("Content-Type", /json/);

    return response.body;
}

export async function initializeStudentsAndStation(r) {
    const studentId = await addStudent(r, validStudent);
    const anotherStudentId = await addStudent(r, anotherValidStudent);
    const stationId = await addStation(r, validStation);
    return {
        studentId: studentId,
        anotherStudentId: anotherStudentId,
        stationId: stationId,
    };
}
