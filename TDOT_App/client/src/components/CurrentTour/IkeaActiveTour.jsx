import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import ConfirmationModal from "../Modal/ConfirmationModal";
import PropTypes from "prop-types";
import { useAuthFetch } from "../../lib/MSAL";
import { Button } from "react-bootstrap";
import { useEffect } from "react";
import EndTourIkea from "./EndTourIkea";
import { showToast } from "../Toasts/ToastContainer";
import { useReducer } from "react";
import QRCodeModal from "../Modal/QRCodeModal";
import QRCode from "../QRCode";
import EndTour from "./EndTour";
export default function IkeaActiveTour({
    student,
    tour,
    tourNumber,
    setRegisterVisitors,
}) {
    const queryClient = useQueryClient();
    const fetch = useAuthFetch();
    const [priorityModal, setPriorityModal] = useState(undefined);

    const [qrModalData, dispatchQrModalData] = useReducer(qrModalReducer, {
        show: false,
        title: "",
        url: "",
    });

    const endTour = async () => {
        tour.endTime = new Date();
        let res = await fetch(
            `/api/students/${student._id}/tours/${tour._id}/end`,
            {
                method: "POST",
            }
        );
        queryClient.invalidateQueries([
            "guide-tours",
            `guide-${student.shortform}`,
        ]);
        if (res.status >= 400) {
            showToast(
                "ERROR ending tour!",
                res.status,
                await res.text(),
                "Danger"
            );
            throw new Error(await res.text());
        } else {
            showToast(
                "Successfully ended the tour",
                "",
                "Good job! Keep the tours coming!",
                "Success"
            );
        }
    };

    function qrModalReducer(state, action) {
        switch (action.type) {
            case "show":
                return {
                    show: true,
                    url: action.url,
                };
            case "hide":
                return {
                    show: false,
                    url: "",
                };
        }
    }

    const [size, setSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        const handleResize = () => {
            setSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    function evaluateBackgroundColorFromVisitors(visitorsTime, maxvisitors) {
        let visitors = 0;

        if (visitorsTime) {
            if (visitorsTime.length > 0) {
                visitors = visitorsTime[visitorsTime.length - 1].value;
            }
        }

        if (visitors >= maxvisitors) return "rgba(82, 44, 44, 0.8)";

        if (visitors > maxvisitors * 0.75) return "rgba(90, 64, 43, 0.8)";

        if (visitors > maxvisitors * 0.5) return "rgba(49, 49, 33, 0.8)";

        if (visitors == 0) return "rgba(32, 54, 31, 0.8)";

        return "rgba(92, 92, 92, 0.4)";
    }

    function evaluateBackgroundColorFromVisitorsMain(
        visitorsTime,
        maxvisitors
    ) {
        let visitors = 0;

        if (visitorsTime) {
            if (visitorsTime.length > 0) {
                visitors = visitorsTime[visitorsTime.length - 1].value;
            }
        }

        if (visitors >= maxvisitors) return "rgba(94, 31, 31, 0.8)";

        if (visitors > maxvisitors * 0.75) return "rgba(85, 62, 26, 0.8)";

        if (visitors > maxvisitors * 0.5) return "rgba(99, 99, 32, 0.8)";

        if (visitors == 0) return "rgba(28, 88, 25, 0.8)";

        return "rgba(182, 182, 182, 0.4)";
    }

    async function moveStationToTop(idx, station) {
        let res = await fetch(
            `/api/students/${student._id}/tours/${tour._id}/priority/${station._id}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        queryClient.invalidateQueries([
            "guide-tours",
            `guide-${student.shortform}`,
        ]);
        if (res.status >= 400) {
            let resText = await res.text();
            showToast(
                "ERROR prioritizing station!",
                res.status,
                resText,
                "Danger"
            );
        } else {
            showToast(`Prioritized station: ${station.name}`, "Success");
        }
    }

    function evaluateButtonsUsed() {
        if (size.width > 500)
            return (
                <>
                    <div
                        style={{ marginTop: 1 + "em", marginBottom: 1 + "em" }}
                    >
                        {!tour.verified ?
                            <Button
                                className="btn-secondary mb-2"
                                style={{
                                    width: "100%",
                                }}
                                onClick={() => {
                                    dispatchQrModalData({
                                        type: "show",
                                        title: "Validate Tour",
                                        url: `${window.origin.toString()}/tours/${tour._id}/validate`,
                                    });
                                }}
                            >
                                Validate tour
                            </Button>
                        :   <Button
                                className="btn-secondary mb-2"
                                style={{
                                    width: "100%",
                                }}
                                disabled="true"
                            >
                                Already Validated
                            </Button>
                        }
                        <Button
                            className="btn-info mb-2"
                            style={{
                                width: "100%",
                            }}
                            onClick={() => {
                                dispatchQrModalData({
                                    type: "show",
                                    title: "Feedback",
                                    url: `${window.origin.toString()}/tours/${tour._id}/feedback`,
                                });
                            }}
                        >
                            Ask for feedback
                        </Button>
                        <EndTour
                            currentTour={tour}
                            onNotVerifiedEnd={() => {
                                setRegisterVisitors(true);
                            }}
                            endTour={endTour}
                        />
                    </div>
                </>
            );

        return (
            <>
                {!tour.verified ?
                    <Button
                        className="rounded-full btn-dark"
                        onClick={() => {
                            dispatchQrModalData({
                                type: "show",
                                title: "Validate Tour",
                                url: `${window.origin.toString()}/tours/${tour._id}/validate`,
                            });
                        }}
                        style={{
                            position: "absolute",
                            bottom: "4rem",
                            left: "19%",
                            width: "5rem",
                            height: "5rem",
                            backgroundColor: "#33cc33bb",
                            borderRadius: "50%",
                            transform: "translateX(-50%)",
                            boxShadow: "0 0 15px rgba(0, 0, 0, 0.3)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <i
                            className="bi bi-patch-check mx-auto d-block"
                            style={{
                                fontSize: "3rem",
                                width: "fit-content",
                            }}
                        ></i>
                    </Button>
                :   <Button
                        className="rounded-full btn-dark"
                        disabled="true"
                        style={{
                            position: "absolute",
                            bottom: "4rem",
                            left: "19%",
                            width: "5rem",
                            height: "5rem",
                            backgroundColor: "#77aa77bb",
                            borderRadius: "50%",
                            transform: "translateX(-50%)",
                            boxShadow: "0 0 15px rgba(0, 0, 0, 0.3)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <i
                            className="bi bi-patch-check mx-auto d-block"
                            style={{
                                fontSize: "3rem",
                                width: "fit-content",
                            }}
                        ></i>
                    </Button>
                }
                <EndTourIkea
                    currentTour={tour}
                    onNotVerifiedEnd={() => {
                        setRegisterVisitors(true);
                    }}
                    endTour={endTour}
                />

                <Button
                    className="rounded-full btn-dark"
                    onClick={() => {
                        dispatchQrModalData({
                            type: "show",
                            title: "Feedback",
                            url: `${window.origin.toString()}/tours/${tour._id}/feedback`,
                        });
                    }}
                    style={{
                        position: "absolute",
                        bottom: "4rem",
                        left: "81%",
                        width: "5rem",
                        height: "5rem",
                        backgroundColor: "#aaaaaabb",
                        borderRadius: "50%",
                        transform: "translateX(-50%)",
                        boxShadow: "0 0 15px rgba(0, 0, 0, 0.3)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <i
                        className="bi bi-chat-right-text mx-auto d-block"
                        style={{ fontSize: "2rem", width: "fit-content" }}
                    ></i>
                </Button>
            </>
        );
    }

    let completedStations = tour.stations.map((e) => e.id);
    let consolidatedQueue = [];

    if (tour.stationQueue) {
        consolidatedQueue = tour.stationQueue.filter((station) => {
            return !completedStations.includes(station.station["_id"]);
        });
    }

    const [nextIdx, setNextIdx] = useState(0);
    useEffect(() => {
        let possibleIndices = consolidatedQueue.filter(e => e.order == 1).length
        let interval = setInterval(() => setNextIdx((nextIdx + 1) % possibleIndices), 1500);
        return () => {clearInterval(interval);}
    }, [consolidatedQueue]);

    return (
        <>
            <QRCodeModal
                title={qrModalData.title}
                show={qrModalData.show}
                onClose={() => dispatchQrModalData({ type: "hide" })}
            >
                <div className="d-flex flex-row justify-content-center">
                    <QRCode value={qrModalData.url} />
                </div>
            </QRCodeModal>

            <ConfirmationModal
                show={priorityModal}
                onCancel={() => setPriorityModal(undefined)}
                title="Change Target Station"
                message={
                    "Are you sure that you want to prioritize " +
                    priorityModal?.station?.name +
                    "? This action will move the current target station to the bottom."
                }
                onConfirm={() =>
                    moveStationToTop(priorityModal?.idx, priorityModal?.station)
                }
                disableLockedModal={true}
            />

            <div style={{ maxWidth: "500px" }}>
                <Button
                    className="btn-dark"
                    style={{
                        width: "100%",
                        height: "6rem",
                        marginBottom: "1rem",
                        boxShadow: "0 0 15px rgba(0, 0, 0, 0.4)",
                        backgroundColor:
                            consolidatedQueue.length > 0 ?
                                evaluateBackgroundColorFromVisitorsMain(
                                    consolidatedQueue[nextIdx].station.visitorsAtTime,
                                    consolidatedQueue[nextIdx].station.capacity
                                )
                            :   "rgba(0,0,0,0)",
                    }}
                >
                    <p style={{ marginTop: "0.5rem", fontSize: "0.6rem" }}>
                        Next up
                    </p>
                    <p style={{ marginTop: "-1rem", fontSize: "1.4rem" }}>
                        {consolidatedQueue.length > 0 ?
                            consolidatedQueue[nextIdx].station.name
                        :   "No more upcoming Stations!"}
                    </p>
                    <p style={{ marginTop: "-1rem", fontSize: "0.8rem" }}>
                        {consolidatedQueue.length > 0 ?
                            consolidatedQueue[nextIdx].station.roomNr +
                            " | " +
                            (consolidatedQueue[nextIdx].station.visitorsAtTime.length > 0 ?
                                consolidatedQueue[nextIdx].station.visitorsAtTime[
                                    consolidatedQueue[nextIdx].station.visitorsAtTime.length -
                                        1
                                ].value
                            :   "0") +
                            "/" +
                            consolidatedQueue[nextIdx].station.capacity +
                            " Visitors"
                        :   "You should finish the tour."}
                    </p>
                </Button>
                {consolidatedQueue.map((station, idx) => {
                    if (station.order == 1) return <></>;

                    return (
                        <Button
                            key={idx}
                            className="btn-dark"
                            style={{
                                width: "95%",
                                marginLeft: "2.5%",
                                marginTop: station.order == consolidatedQueue[idx - 1].order ? "0%" : "0.2rem",
                                height: "2.5rem",
                                backgroundColor:
                                    evaluateBackgroundColorFromVisitors(
                                        station.station.visitorsAtTime,
                                        station.station.capacity
                                    ),
                            }}
                            onClick={() => {
                                setPriorityModal({ id: idx, station: station.station });
                            }}
                        >
                            {station.order + ". " + station.station.name + "  " + station.station.roomNr}
                        </Button>
                    );
                })}
                {evaluateButtonsUsed()}
            </div>
        </>
    );
}

IkeaActiveTour.propTypes = {
    student: PropTypes.object,
    tour: PropTypes.object,
    tourNumber: PropTypes.number,
};
