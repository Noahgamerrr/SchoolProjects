import assert from "assert";

export const VALID_TEAM = {
    name: "Super cool team 1"
};
export const ANOTHER_VALID_TEAM = {
    name: "Super cool team 2"
};

export const VALID_STUDENT = {
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

export async function addTeam(r, team) {
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

export async function addStudent(r, student) {
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

export async function getTeam(r, teamId) {
    const response = await r
        .get('/api/guide-teams/' + teamId)
        .expect(200)
        .expect('Content-Type', /json/);

    assert.equal(typeof (response.body), 'object');
    assert.equal(response.body._id, teamId);

    return response.body;
}

export async function initializeGuideTeams(r) {
  const firstGuideTeamId = await addTeam(r, VALID_TEAM);
  const secondGuideTeamId = await addTeam(r, ANOTHER_VALID_TEAM);
  VALID_STUDENT.guideTeams = [];
  ANOTHER_VALID_STUDENT.guideTeams = [];
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
  const firstStudentId = await addStudent(r, VALID_STUDENT);
  const secondStudentId = await addStudent(r, ANOTHER_VALID_STUDENT);
  return [firstGuideTeamId, secondGuideTeamId, firstStudentId, secondStudentId]
}