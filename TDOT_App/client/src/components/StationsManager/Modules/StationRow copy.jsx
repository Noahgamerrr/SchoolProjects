import React from "react";
import { useNavigate } from "react-router-dom";
import FeedbackAverage from "../../Feedback/FeedbackAverage";
import Button from "react-bootstrap/Button";
import PropTypes from "prop-types";

export default function StationRowCompressed({ station }) {
    const navigate = useNavigate();

    function parseInteractType(type) {
        switch (type) {
            default:
                return <i className="bi bi-question-circle"> Other </i>;
            case "visual":
                return <i className="bi bi-eye"> Visual </i>;
            case "audio-visual":
                return <i className="bi bi-volume-up"> Audio Visual </i>;
            case "interactive":
                return <i className="bi bi-hand-index"> Interactive </i>;
            case "problem-solving":
                return (
                    <i className="bi bi-file-earmark-text"> Problem Solving </i>
                );
        }
    }

    // ['other', 'visual', 'audio-visual', 'interactible', 'problem-solving']
    let capacityList = [];
    console.log("Rating is: " + station.rating);
    console.log("AND " + JSON.stringify(station.rating));
    console.log("AND " + JSON.stringify(station));
    if (station.capacity > 10) {
        capacityList = (
            <i className="bi bi-person-standing">({station.capacity} x)</i>
        );
    } else {
        for (let x = 0; x < station.capacity; x++) {
            capacityList.push(<i className="bi bi-person-standing"></i>);
        }
    }

    let workerList = [];

    for (let x = 0; x < station.minWorkers; x++) {
        workerList.push(<i className="bi bi-person-standing text-primary"></i>);
    }

    for (let x = station.minWorkers; x < station.maxWorkers; x++) {
        workerList.push(<i className="bi bi-person-standing text-muted"></i>);
    }

    let tagList = [];

    for (let tag of station.tags) {
        tagList.push(
            <Button className="btn-primary my-1 gap-1 d-flex">{tag}</Button>
        );
    }

    return (
        <React.Fragment>
            <div className="rounded mb-2 p-3">
                <h1>{station.name} </h1>

                <div className="gap-1 d-flex">
                    <Button className="btn-primary my-1 mr-3 gap-1 d-flex">
                        {station.roomNr}
                    </Button>
                    <Button className="btn-secondary my-1 gap-1 d-flex">
                        {parseInteractType(station.interactType)}
                    </Button>
                </div>

                <FeedbackAverage avg={station.rating} />
                <p className="font-italic mb-2">{station.description}</p>
                <p>Capacity</p>
                {capacityList}
                <br />
                <p>Worker Count</p>
                {workerList}
                <br />
                <div className="gap-1 d-flex">{tagList}</div>

                <div>
                    <Button
                        className="d-inline"
                        variant="info"
                        title="Feedback page"
                        onClick={() => {
                            navigate(`/stations/${station._id}/feedback`);
                        }}
                    >
                        <i className="bi bi-chat-left-heart"></i>
                    </Button>
                </div>
            </div>
            <hr />
        </React.Fragment>
    );
}

StationRowCompressed.propTypes = {
    station: PropTypes.object,
};
