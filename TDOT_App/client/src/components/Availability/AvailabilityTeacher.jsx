import React from "react";
import { useAuthFetch } from "../../lib/MSAL";
import AvailabilityAll from "./AvailabilityAll";
import AvailabilityTeam from "./AvailabilityTeam";
import Button from "react-bootstrap/esm/Button";

function AvailabilityTeacher() {
    const [all, setAll] = React.useState([]);
    const [teams, setTeams] = React.useState([]);
    const [showTeams, setShowTeams] = React.useState(false);
    const [reload, setReload] = React.useState(0);
    const fetch = useAuthFetch();

    const toggleView = () => setShowTeams(!showTeams);

    React.useEffect(() => {
        const intervalID = setInterval(
            () => setReload((c) => c + 1),
            60 * 1000
        );
        return () => clearInterval(intervalID);
    }, []);

    React.useEffect(() => {
        async function getData() {
            const awaiter = [];
            awaiter.push(fetch(`/api/students`));
            awaiter.push(fetch(`/api/students/teams`));
            const resp = await Promise.all(awaiter);
            const json = resp.map((res) => res.json());
            const data = await Promise.all(json);
            return data;
        }

        getData()
            .then(([all, teams]) => {
                setAll(all);
                setTeams(teams);
                console.log(teams);
            })
            .catch(console.log);
    }, [reload, fetch]);

    const switchbtn = (
        <Button className="z-2" variant="secondary" onClick={toggleView}>
            Show&nbsp;{showTeams ? "All" : "Teams"}
        </Button>
    );

    return (
        <>
            {showTeams ? (
                <AvailabilityTeam teams={teams} afterteamselect={switchbtn} />
            ) : (
                <AvailabilityAll students={all} aftersearchbox={switchbtn} />
            )}
        </>
    );
}

export default AvailabilityTeacher;
