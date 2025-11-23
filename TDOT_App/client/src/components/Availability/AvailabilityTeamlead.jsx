import React from "react";
import { useMsal } from "@azure/msal-react";
import AvailabilityTeam from "./AvailabilityTeam";
import Loading from "../Loading";
import { useAuthFetch } from "../../lib/MSAL";

function AvailabilityTeamlead() {
    const [teams, setTeams] = React.useState("");
    const [reload, setReload] = React.useState(0);
    const { instance } = useMsal();
    const fetch = useAuthFetch();

    React.useEffect(() => {
        const intervalID = setInterval(
            () => setReload((c) => c + 1),
            60 * 1000
        );
        return () => clearInterval(intervalID);
    }, []);

    React.useEffect(() => {
        async function getTeams() {
            const shortform = instance
                .getActiveAccount()
                .username.split("@")[0];
            const res = await fetch(`/api/students/${shortform}/teamMembers`);
            let data = await res.json();
            return data;
        }

        getTeams().then(setTeams).catch(console.log);
    }, [reload, fetch, instance]);

    if (!teams) return <Loading />;
    else return <AvailabilityTeam teams={teams} />;
}

export default AvailabilityTeamlead;
