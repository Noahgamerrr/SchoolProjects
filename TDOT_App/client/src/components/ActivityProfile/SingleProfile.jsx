import React from "react";
import { OverlayTrigger } from "react-bootstrap";
import { useAuthFetch, useGraphFetch } from "../../lib/MSAL";
import { Button } from "react-bootstrap";
import { Tooltip } from "react-bootstrap";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Loading from "../Loading";

// Displays a single small sized profile of a given student.
// Fetches the students profile picture by their shortform.
// Paints the profile by the last activity, also displaying when the activity changed.
function SingleProfile({ student }) {
    const fetch = useAuthFetch();
    const graphFetch = useGraphFetch();

    let shortform = student.shortform;
    let activity = student.activity[student.activity.length - 1].activity;
    console.log(
        "Activities for student: " +
            shortform +
            " is : " +
            JSON.stringify(student.activity.map((e) => e.activity))
    );

    const statusTranslations = {
        available: "Available",
        tour: "On Tour",
        break: "On Break",
        home: "At Home",
    };

    let modifiedshortform = shortform;
    const renderTooltip = (props) =>
        shortform != modifiedshortform ?
            <Tooltip id={"button-tooltip-activity-usr-" + shortform} {...props}>
                <div>{shortform}</div>
            </Tooltip>
        :   <></>;

    function formatTime(rawTime) {
        const time = new Date(rawTime);
        const hours = time.getHours().toString().padStart(2, "0");
        const minutes = time.getMinutes().toString().padStart(2, "0");

        return `${hours}:${minutes}`;
    }

    const renderAvailabilityTooltip = (props) => (
        <Tooltip id={"button-tooltip-usr-" + shortform} {...props}>
            <div>{statusTranslations[activity]}</div>
            <div>
                {"Since " +
                    formatTime(
                        student.activity[student.activity.length - 1].time
                    )}
            </div>
        </Tooltip>
    );

    const renderLeaderTooltip = (props) => (
        <Tooltip id={"button-tooltip-leader-" + shortform} {...props}>
            <div>Leader</div>
        </Tooltip>
    );

    let size = 14;

    let textLength = shortform.length;

    if (textLength > 11) {
        modifiedshortform = shortform.substring(0, 9) + "..";
    }

    const svgs = {
        available: "bi bi-brightness-high-fill",
        tour: "bi bi-hourglass",
        break: "bi bi-moon-fill",
        home: "bi bi-ban",
    };

    const { data: image } = useQuery({
        queryKey: [`profilepic-${shortform}`],
        queryFn: async () => {
            const res = await graphFetch(
                "https://graph.microsoft.com/v1.0/users/" +
                    shortform +
                    "@" +
                    (shortform.length === 3 ? "" : "edu.") +
                    "htl-villach.at/photo/$value"
            );
            if (res.ok) {
                const data = URL.createObjectURL(await res.blob());
                return data;
            }
            return "images/avatar_anonymous_logo.png";
        },
        staleTime: Infinity,
    });

    console.log("Image data is: " + image);

    const cols = {
        available: "green",
        tour: "red",
        break: "orange",
        home: "gray",
    };

    return (
        <div className="d-inline-block m-1">
            <div
                style={{
                    height: "73px",
                    width: "73px",
                    backgroundColor: cols[activity],
                    borderRadius: "50%",
                }}
            >
                {image ?
                    <img
                        src={image}
                        alt="..."
                        style={{
                            borderRadius: "50%",
                            padding: "2px",
                            height: "72px",
                            width: "72px",
                        }}
                    />
                :   <Loading />}
            </div>
            <OverlayTrigger
                class="m-0"
                placement="bottom"
                delay={{ show: 250, hide: 400 }}
                overlay={renderAvailabilityTooltip}
            >
                <div
                    className={`border border-4 border-dark rounded-circle`}
                    style={{
                        textAlign: "center",
                        marginBottom: "-20px",
                        bottom: "20px",
                        left: "50px",
                        height: "29px",
                        width: "29px",
                        position: "relative",
                        backgroundColor: cols[activity],
                    }}
                >
                    <i
                        className={`fw-bolder ${svgs[activity]}`}
                        style={{
                            fontSize: "16px",
                            position: "relative",
                            bottom: "1.5px",
                            opacity: "0.4",
                            textAlign: "center",
                            color: "black",
                        }}
                    />
                </div>
            </OverlayTrigger>
            <OverlayTrigger
                class="m-0"
                placement="bottom"
                delay={{ show: 250, hide: 400 }}
                overlay={renderLeaderTooltip}
            >
                {student.isLeader ?
                    <div
                        style={{
                            textAlign: "center",
                            marginBottom: "-29px",
                            bottom: "90px",
                            left: "50px",
                            height: "29px",
                            width: "29px",
                            position: "relative",
                        }}
                    >
                        <i
                            className={`fw-bolder text-dark bi bi-star-fill`}
                            style={{
                                fontSize: "28px",
                                position: "absolute",
                                left: "1.5px",
                                textAlign: "center",
                            }}
                        />
                        <i
                            className={`fw-bolder bi bi-star-fill`}
                            style={{
                                fontSize: "18px",
                                position: "absolute",
                                left: "6.5px",
                                top: "8px",
                                textAlign: "center",
                                color: "yellow",
                            }}
                        />
                    </div>
                :   <div></div>}
            </OverlayTrigger>

            <OverlayTrigger
                class="m-0"
                placement="bottom"
                delay={{ show: 250, hide: 400 }}
                overlay={renderTooltip}
            >
                <Button
                    className="btn btn-secondary"
                    style={{
                        fontSize: "" + size + "px",
                        textAlign: "center",
                        maxWidth: "100%",
                        width: "100%",
                        padding: "0px",
                        margin: "0px",
                    }}
                    onClick={() => setShow(!show)}
                >
                    {modifiedshortform}
                </Button>
            </OverlayTrigger>
        </div>
    );
}

export default SingleProfile;
