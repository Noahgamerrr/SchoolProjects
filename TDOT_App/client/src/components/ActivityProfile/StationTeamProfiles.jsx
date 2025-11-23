import React from "react";

import { useAuthFetch } from "../../lib/MSAL";

import { useQuery, } from "@tanstack/react-query";
import SingleProfile from "./SingleProfile";

// Renders a row of profiles
// The team refers to the guide team that the users should be fetched from.
// The user refers to the logged in user that should be considered for showing the "You are the only one logged in."
function StationTeamProfiles({ station , user}) {

    if (!station) {
        return <div>NO TEAM SELECTED</div>
    }

    const fetch = useAuthFetch();
    
    // /api/guide-teams/:id/students
    const { data: teamMembers } = useQuery({
        queryKey: ["station-team-members"],
        queryFn: async () => {
            const res = await fetch("/api/stations/"+station._id+"/members");
            const data = await res.json();
            console.log("MEMBER DATA: "+JSON.stringify(data))
            return data.sort((a, b) => {
                if (a.isLeader)
                    return -1;
                if (b.isLeader)
                    return 1;

                return 0;
            });
        },
        staleTime: Infinity,
        refetchInterval: 5000
    });

   
    if (!teamMembers) {
        return <div>Loading...</div>
    }

    let amountOfAvailable = teamMembers.filter((student) => student.activity[student.activity.length-1].activity == "available").length

    console.log("AvailableMembers: "+amountOfAvailable);

    return (
    <React.Fragment>
        {fetchAvailable(amountOfAvailable, user)}
        {teamMembers.map((member) => {
            return <SingleProfile student={member}/>
        })}
    </React.Fragment>)
};

function fetchAvailable(amount, user) {

    if (user.activity[user.activity.length-1].activity == "available") {
        if (amount == 1)
            return modalText("Caution. You're the only available member.", "bg-warning")
    } 

    if (amount == 1)
        return modalText("Caution, only one member available.", "bg-warning")

    if (amount == 0)
        return modalText("Caution, no members available.", "bg-danger")

    return <div></div>
}

function modalText(text, bgStyle) {
    return (
        <div className={"opacity-50 fs-4 mb-2 "+bgStyle+" text-center text-dark"}>{text}</div>
    );
}

export default StationTeamProfiles;