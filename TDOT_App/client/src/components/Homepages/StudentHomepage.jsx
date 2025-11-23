import { useState } from "react";
import React from "react";

import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuthFetch } from "../../lib/MSAL";
import Loading from "../Loading";
import { useMsal } from "@azure/msal-react";
import AvailabilityHomepage from "./AvailabilityHomepage";
import { showToast } from "../Toasts/ToastContainer";
import { Button } from "react-bootstrap";
import ConfirmationModal from "../Modal/ConfirmationModal";
import StationRowCompressed from "../StationsManager/Modules/StationRowCompressed";
import GuideTeamProfiles from "../ActivityProfile/GuideTeamProfiles";
import StationTeamProfiles from "../ActivityProfile/StationTeamProfiles";

let greetings = [
    "Goededag, ",
    "Guten Tag, ",
    "Hola, ",
    "Greetings, ",
    "Hello, ",
    "Bonjour, ",
    "Ciao, ",
    "你好, ",
    "こんにちは, ",
    "안녕하세요, ",
    "Привет, ",
    "Zdravo, ",
];

export default function StudentHomepage() {
    const { instance } = useMsal();


    const [selectedDisplayTeam, setDisplayTeam] = useState(null)
    const [teamType, setTeamType] = useState(null)


    const [guideTeams, setGuideTeams] = useState(null);
    const [stations, setStations] = useState(null);
    const [homeModal, setHomeModal] = useState(false);
    const [greetingIdx, setGreetingIdx] = useState(
        Math.floor(Math.random() * greetings.length)
    );

    function updateSelectedDisplayTeam(team, type) {
        setDisplayTeam(team);
        setTeamType(type);
    }

    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const fetch = useAuthFetch();
    const shortform = instance.getActiveAccount().username.split("@")[0];

    const { data: students } = useQuery({
        queryKey: ["students"],
        queryFn: async () => {
            const response = await fetch("/api/students");
            const data = await response.json();
            return data;
        },
        staleTime: Infinity,
    });

    const { data: allGuideTeams } = useQuery({
        queryKey: ["guide-teams"],
        queryFn: async () => {
            const response = await fetch("/api/guide-teams");
            const data = await response.json();
            return data;
        },
        staleTime: Infinity,
    });

    const { data: allStations } = useQuery({
        queryKey: ["stations"],
        queryFn: async () => {
            const response = await fetch("/api/stations");
            const data = await response.json();
            return data;
        },
        staleTime: Infinity,
    });

    const changeActivity = async (name) => {
        let res = await fetch(`/api/students/${studentCopy._id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "If-Match": name.__v,
            },
            body: JSON.stringify(name),
        });
        if (res.status != 200) throw new Error(await res.text());
    };

    function consolodateTeam() {
        if (teamType == undefined)
            return <div>NONE SELECTED</div>

        if (teamType == "guideTeam") {
            return (<GuideTeamProfiles team={selectedDisplayTeam} user={studentCopy}/>);
        } else {
            return (<StationTeamProfiles station={selectedDisplayTeam} user={studentCopy}/>);
        }
    }

    const updateStatusMutation = useMutation({
        mutationFn: changeActivity,
        mutationKey: ["students", "changeActivity"],
        onError: (error) =>
            showToast(
                "Error changing activity",
                error.name,
                error.message,
                "Danger"
            ),
        onSettled: (data, error) => {
            if (!error)
                showToast(
                    "Activity status changed",
                    "",
                    `Activity status successfully changed`,
                    "Success"
                );
            queryClient.invalidateQueries(["students"]);
        },
    });

    if (!students) return <Loading />;
    let studentCopy = students.find((e) => e.shortform == shortform);

    if (!studentCopy) return <></>;

    function appendActivityState(stateName) {
        let newStudent = { ...studentCopy };

        newStudent.activity.push({ activity: stateName, time: new Date() });

        updateStatusMutation.mutate(newStudent);
    }

    function loadStatusButtons() {
        let lastActivity =
            studentCopy.activity[studentCopy.activity.length - 1];

        if (lastActivity.activity == "home") {
            return <div className="text-mute">Already signed out.</div>;
        }

        if (lastActivity.activity == "available") {
            return (
                <div className="gap-3 d-flex">
                    <Button
                        className="btn btn-danger"
                        onClick={() => setHomeModal(true)}
                    >
                        <i className="bi bi-house-door"></i> Go Home
                    </Button>
                    <Button
                        className="btn btn-secondary"
                        onClick={() => appendActivityState("break")}
                    >
                        <i className="bi bi-cup-hot"></i> Go on Break
                    </Button>
                </div>
            );
        }

        return (
            <div className="gap-1 d-flex">
                <Button
                    className="btn btn-success"
                    onClick={() => appendActivityState("available")}
                >
                    <i className="bi bi-person-raised-hand bt-su"></i> Become
                    Available
                </Button>
            </div>
        );
    }

    if (!allGuideTeams) return <Loading />;

    if (!guideTeams) {
        let allTeamIds = studentCopy.guideTeams.map((team) => team.teamId);
        console.log("Studentcopy: " + JSON.stringify(studentCopy));
        console.log(
            "stn Ids is: " + allTeamIds + " for " + studentCopy.guideTeams
        );
        setGuideTeams(allGuideTeams.filter((e) => allTeamIds.includes(e._id)));
        return <Loading />;
    }

    // If no team is selected, auto select the first guide team.
    if (!selectedDisplayTeam) {
        if (guideTeams.length > 0) {
            updateSelectedDisplayTeam(guideTeams[0], "guideTeam")
        }
    }

    if (!allStations) return <Loading />;
    if (!stations) {
        let allStationIds = studentCopy.stations.map((team) => team.stationId);
        console.log(
            "stn Ids is: " + allStationIds + " for " + studentCopy.stations
        );
        setStations(allStations.filter((e) => allStationIds.includes(e._id)));
        return <Loading />;
    }

    // If still no team is selected, auto select the first station team.
    if (!selectedDisplayTeam) {
        if (stations.length > 0) {
            updateSelectedDisplayTeam(stations[0], "stationTeam")
        }
    }

    return (
        <React.Fragment>
            <ConfirmationModal
                show={homeModal}
                title="Go Home"
                message="Are you sure you want to go home. This cannot be undone"
                onConfirm={() => {
                    appendActivityState("home");
                }}
                onCancel={() => setHomeModal(false)}
                disableLockedModal={true}
            />
            <h2>
                {greetings[greetingIdx]} {studentCopy.firstname}
            </h2>
            <hr />

            <AvailabilityHomepage
                id={studentCopy._id}
                activity={studentCopy.activity[studentCopy.activity.length - 1]}
            />

            {loadStatusButtons()}
            <hr/>
            {consolodateTeam()}
        
            <hr />
            <h4>Assigned Guide Teams</h4>
            {guideTeams.map((team, idx) => (
                <div className="gap-3 d-flex" key={idx}>
                    <hr />
                    <h5 style={{marginTop: "6px"}}>{team.name}</h5>
                    <Button
                        style={{width: "40px", height: "40px"}}
                        className="btn btn-secondary"
                        onClick={() => updateSelectedDisplayTeam(team, "guideTeam")}
                    >
                        <i className="bi bi-search"></i>
                    </Button>
                    <hr />
                </div>
            ))}
            <hr />
            <h4>Assigned Stations</h4>
            {stations.map((station) => (
                (
                <div>
                    <StationRowCompressed key={station._id} station={station} updateSelectCallback={updateSelectedDisplayTeam} />
                </div>
                )
            ))}
        </React.Fragment>
    );
}
