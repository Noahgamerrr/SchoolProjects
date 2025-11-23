import React from "react";
import AvailabilitySingle from "./AvailabilitySingle";
import Form from "react-bootstrap/esm/Form";
import PropTypes from "prop-types";

function AvailabilityTeam({ teams, afterteamselect }) {
    const [teamFilter, setTeamFilter] = React.useState("");

    const { guideTeams, stations } = teams;

    if (!guideTeams && !stations) return <h2>Whoops! Seems like there is no data to be displayed!</h2>

    const guideTeamOptions = Object.keys(guideTeams).map((team) => (
        <option key={team} value={team}>
            {guideTeams[team].name}
        </option>
    ));

    const stationsOptions = Object.keys(stations).map((team) => (
        <option key={team} value={team}>
            {stations[team].name}
        </option>
    ));

    const teamOptions = [
        <option key={"guideTeamIndicator"} disabled={true}>
            ------Guide-Teams------
        </option>,
        ...guideTeamOptions,
        <option key={"stationIndicator"} disabled={true}>
            -------Stations-------
        </option>,
        ...stationsOptions
    ];

    const guideTeamElems = Object.keys(guideTeams)
        .filter((team) => !teamFilter || team === teamFilter)
        .map((teamId) => {
            const team = guideTeams[teamId];
            const members = team.members
                .filter(student => student.activity?.length)
                .map((student) => (
                    <AvailabilitySingle
                        key={`${student.firstname} ${student.lastname}`}
                        id={student._id}
                        lastname={student.lastname}
                        firstname={student.firstname}
                        state={student.activity[0].activity}
                        isTeamLeader={
                            student.shortform === team.teamLeader.shortform
                        }
                    />
                ));
            return (
                <div key={teamId}>
                    <h3 className="text-start">{team.name}</h3>
                    <div>{members}</div>
                </div>
            );
        });

    const stationsElems = Object.keys(stations)
        .filter((team) => !teamFilter || team === teamFilter)
        .map((teamId) => {
            const team = stations[teamId];
            const members = team.members
                .filter(student => student.activity)
                .map((student) => (
                    <AvailabilitySingle
                        key={`${student.firstname} ${student.lastname}`}
                        id={student._id}
                        lastname={student.lastname}
                        firstname={student.firstname}
                        state={student.activity[0].activity}
                        isTeamLeader={
                            student.shortform === team.teamLeader.shortform
                        }
                    />
                ));
            return (
                <div key={teamId}>
                    <h3 className="text-start">{team.name}</h3>
                    <div>{members}</div>
                </div>
            );
        });

    return (
        <div className="h-100 d-flex flex-column flex-nowrap">
            <div className="bg-light-subtle p-2 rounded z-1">
                <Form.Group className="fit-content m-auto d-flex align-items-center syp-mx-c-1">
                    <Form.Label>Team: </Form.Label>
                    <Form.Select
                        value={teamFilter}
                        onChange={(event) => setTeamFilter(event.target.value)}
                    >
                        <option value="">All teams</option>
                        {teamOptions}
                    </Form.Select>
                    {afterteamselect}
                </Form.Group>
            </div>
            <div className="position-relative overflow-y-scroll">
                <div className="pt-2">
                    {!teamFilter && <h2>Guide-Teams:</h2>}
                    {guideTeamElems}
                </div>
                <div className="pt-2">
                    {!teamFilter && <h2>Stations:</h2>}
                    {stationsElems}
                </div>
            </div>
        </div>
    );
}

AvailabilityTeam.propTypes = {
    teams: PropTypes.object.isRequired,
    afterteamselect: PropTypes.element,
};

export default AvailabilityTeam;
