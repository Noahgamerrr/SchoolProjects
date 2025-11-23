import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import FeedbackAverage from "../../Feedback/FeedbackAverage";
import Button from "react-bootstrap/Button";
import PropTypes from "prop-types";
import QRCode from "../../QRCode";
import QRCodeModal from "../../Modal/QRCodeModal";

const COLORS = {
    90: "#db2c2c",
    75: "#ebcf00",
    30: "#02db3d",
    0: "#017821",
};

export default function StationRow({ station, openday }) {
    const navigate = useNavigate();

    const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false);
    const printRef = useRef();

    const handlePrint = useReactToPrint({
        contentRef: printRef,
    });

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

    function findLastTimeInstance(data) {
        if (!Array.isArray(data) || data.length === 0) {
            return null; // Handle invalid or empty input
        }

        // Convert time strings to comparable Date objects, find max, and return the name
        const dateRegex = /^(?<hours>[0-9]{1,2}):(?<minutes>[0-9]{2})$/;
        const lastTimeEntry = data.reduce((latest, current) => {
            const regexLatest = dateRegex.exec(latest.name)?.groups;
            let latestTime, currentTime;

            if (regexLatest) {
                const { hours, minutes } = regexLatest;
                latestTime = new Date(
                    `1970-01-01T${`${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`}:00`
                );
            } else return latest;
            const regexCurrent = dateRegex.exec(current.name)?.groups;
            if (regexCurrent) {
                const { hours, minutes } = regexCurrent;
                currentTime = new Date(
                    `1970-01-01T${`${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`}:00`
                );
            } else return latest;

            return currentTime > latestTime ? current : latest;
        });

        return lastTimeEntry.value;
    }

    const occupied = findLastTimeInstance(station.visitorsAtTime);
    const freeColor = Object.keys(COLORS)
        .sort((a, b) => b - a)
        .find((e) => e <= (occupied * 100) / station.capacity);

    // ['other', 'visual', 'audio-visual', 'interactible', 'problem-solving']
    console.log("Rating is: " + station.rating);
    console.log("AND " + JSON.stringify(station.rating));
    console.log("AND " + JSON.stringify(station));

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
                <div>
                    <div className="d-flex">
                        <div className="text-center me-3">
                            <i
                                class="bi bi-person-fill"
                                style={{ fontSize: "20px" }}
                            ></i>
                            <p>Total: {station.capacity}</p>
                        </div>
                        <div className="text-center me-3">
                            <i
                                class="bi bi-person-fill-dash d-block"
                                style={{ fontSize: "20px", color: "#aaa" }}
                            ></i>
                            <p>Occupied: {occupied}</p>
                        </div>
                        <div className="text-center">
                            <i
                                class="bi bi-person-fill-check"
                                style={{
                                    fontSize: "20px",
                                    color: COLORS[freeColor],
                                }}
                            ></i>
                            <p>Free: {station.capacity - occupied}</p>
                        </div>
                    </div>
                </div>
                <p>Worker Count</p>
                {workerList}
                <br />
                <div className="gap-1 d-flex">{tagList}</div>

                <div>
                    <Button
                        className="d-inline me-1"
                        variant="info"
                        title="Feedback page"
                        onClick={() => {
                            navigate(`/stations/${station._id}/feedback`);
                        }}
                    >
                        <i className="bi bi-chat-left-heart"></i>
                    </Button>
                    <Button
                        className="d-inline"
                        variant="info"
                        title="Get QR-Code"
                        onClick={() => {
                            setQrCodeModalOpen(true);
                        }}
                    >
                        <i className="bi bi-qr-code"></i>
                    </Button>
                </div>
            </div>
            <QRCodeModal
                title="QR Code"
                show={qrCodeModalOpen}
                onClose={() => setQrCodeModalOpen(false)}
                onNewTabRequest={() => {
                    window.open(
                        `${window.origin.toString()}/stations/${station._id}/addToTour`,
                        "_blank"
                    );
                    setQrCodeModalOpen(false);
                }}
                onPrint={handlePrint}
            >
                <div className="d-flex flex-row justify-content-center">
                    <QRCode
                        value={`${window.origin.toString()}/stations/${station._id}/addToTour`}
                    />
                </div>
            </QRCodeModal>
            <hr />
            <div className="d-none">
                <div ref={printRef} className="m-5">
                    <div
                        className="d-flex justify-content-between align-items-center"
                        style={{ height: "100px" }}
                    >
                        <img
                            src="/images/htl-villach.png"
                            style={{ height: "100px" }}
                        />
                        <h1 className="fs-3">Tag der offenen T&uuml;r</h1>
                        <p className="fs-3">{openday}</p>
                    </div>
                    <div
                        className="mx-auto"
                        style={{ width: "fit-content", marginTop: "50px" }}
                    >
                        <h2 className="text-center">{station.name}</h2>
                        <div
                            className="mx-auto"
                            style={{ width: "fit-content" }}
                        >
                            <QRCode
                                value={`${window.origin.toString()}/stations/${station._id}/addToTour`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

StationRow.propTypes = {
    station: PropTypes.object,
    openday: PropTypes.string,
};
