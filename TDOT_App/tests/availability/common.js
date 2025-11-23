import assert from "assert";

const VALID_STATION = {
    "name": "NSCS-Stand",
    "description": "Hier wird das Innenleben eines Computers erklärt",
    "capacity": 1,
    "minWorkers": 1,
    "maxWorkers": 4,
    "interactType": "audio-visual",
    "tags": ["NSCS", "Info"],
    "roomNr": "420"
};
const ANOTHER_VALID_STATION = {
  "name": "Programmierstand",
  "description": "Einfache Java-Programmierübungen",
  "capacity": 12,
  "minWorkers": 1,
  "maxWorkers": 4,
  "interactType": "problem-solving",
  "tags": ["Java", "Coding", "Challange"],
  "roomNr": "421"
};

const VALID_GUIDE_TEAM = {
  name: "Super cool team 1"
};
const ANOTHER_VALID_GUIDE_TEAM = {
  name: "Super cool team 2"
};

const VALID_STUDENT = {
    "openDayId": "65e85c74062477ce17e89c27",
    "firstname": "Ciara",
    "lastname": "Hegmann-Herzog",
    "shortform": "Ciara",
    "stations": [],
    "guideTeams": [],
    "activity": [
      {
        "time": "1976-12-02T18:55:47.127Z",
        "activity": "available"
      },
      {
        "time": "1972-08-14T13:26:20.540Z",
        "activity": "available"
      },
      {
        "time": "1992-09-14T07:14:53.792Z",
        "activity": "available"
      },
      {
        "time": "2018-09-26T13:29:12.568Z",
        "activity": "home"
      },
      {
        "time": "2001-05-17T03:45:51.798Z",
        "activity": "break"
      }
    ]
  };

export const ANOTHER_VALID_STUDENT = {
    "openDayId": "65e85c74062477ce17e89c57",
    "firstname": "Aaron",
    "lastname": "Jones",
    "shortform": "Aaron",
    "stations": [],
    "guideTeams": [],
    "activity": [
      {
        "time": "1990-05-01T05:10:04.681Z",
        "activity": "available"
      },
      {
        "time": "2017-09-11T03:35:34.009Z",
        "activity": "home"
      },
      {
        "time": "2005-04-12T21:05:20.557Z",
        "activity": "tour"
      },
      {
        "time": "2000-03-08T06:11:42.101Z",
        "activity": "home"
      },
      {
        "time": "1994-10-28T05:03:37.511Z",
        "activity": "home"
      }
    ]
  }

async function addStation(r, station) {
    const response = await r
        .post('/api/stations')
        .send(station)
        .expect(201)
        .expect('Content-Type', /json/);

    const stationId = response.body._id;

    assert.equal(typeof (response.body), 'object');
    assert.notEqual(stationId, undefined);
    assert.equal(response.headers.location, `/api/stations/${stationId}`);

    return stationId;
}

async function addGuideTeam(r, team) {
  const response = await r
      .post('/api/guide-teams')
      .send(team)
      .expect(201)
      .expect('Content-Type', /json/);

  const teamId = response.body._id;

  assert.equal(typeof (response.body), 'object');
  assert.notEqual(teamId, undefined);
  assert.equal(response.headers.location, `/api/guide-teams/${teamId}`);

  return teamId;
}

async function addStudent(r, student) {
    const response = await r
        .post('/api/students')
        .send(student)
        .expect(201)
        .expect('Content-Type', /json/);

    const studentId = response.body._id;

    assert.equal(typeof (response.body), 'object');
    assert.notEqual(studentId, undefined);
    assert.equal(response.headers.location, `/api/students/${studentId}`);

    return studentId;
}

export async function initializeAvailability(r) {
    const firstStationId = await addStation(r, VALID_STATION);
    const secondStationId = await addStation(r, ANOTHER_VALID_STATION);
    const firstGuideTeamId = await addGuideTeam(r, VALID_GUIDE_TEAM);
    const secondGuideTeamId = await addGuideTeam(r, ANOTHER_VALID_GUIDE_TEAM);
    VALID_STUDENT.stations = [];
    VALID_STUDENT.guideTeams = [];
    ANOTHER_VALID_STUDENT.stations = [];
    ANOTHER_VALID_STUDENT.guideTeams = [];
    VALID_STUDENT.stations.push({
        "stationId": firstStationId,
        "isLeader": "false"
    });
    VALID_STUDENT.stations.push({
        "stationId": secondStationId,
        "isLeader": "true"
    });
    ANOTHER_VALID_STUDENT.stations.push({
        "stationId": firstStationId,
        "isLeader": "true"
    });
    VALID_STUDENT.guideTeams.push({
        "teamId": firstGuideTeamId,
        "isLeader": "true"
    });
    VALID_STUDENT.guideTeams.push({
        "teamId": secondGuideTeamId,
        "isLeader": "false"
    });
    ANOTHER_VALID_STUDENT.guideTeams.push({
        "teamId": secondGuideTeamId,
        "isLeader": "true"
    });
    await addStudent(r, VALID_STUDENT);
    await addStudent(r, ANOTHER_VALID_STUDENT);
}