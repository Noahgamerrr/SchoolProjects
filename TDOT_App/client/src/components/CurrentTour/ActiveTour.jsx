import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { Button, Table } from "react-bootstrap";
import { useAuthFetch } from "../../lib/MSAL";
import Loading from "../Loading";
import { useEffect, useReducer, useState } from "react";
import ConfirmationModal from "../Modal/ConfirmationModal";
import { showToast } from "../Toasts/ToastContainer";
import EndTour from "./EndTour";
import QRCodeModal from "../Modal/QRCodeModal";
import QRCode from "../QRCode";
import RegisterVisitors from "./RegisterVisitors";
import TourTimer from "./TourTimer";
import IkeaActiveTour from "./IkeaActiveTour";

export default function ActiveTour({ student, tour, tourNumber }) {
    const fetch = useAuthFetch();
    const queryClient = useQueryClient();
    const lastStation = tour.stations.at(-1);
    const lastVisit =
        lastStation ? new Date(lastStation.time.start) : new Date(0);
    const showButtonUntil = new Date(lastVisit.getTime() + 30000);
    const now = new Date();
    const diff = showButtonUntil - now;
    const [showRemoveStationModal, setShowRemoveStationModal] = useState(false);
    const [qrModalData, dispatchQrModalData] = useReducer(qrModalReducer, {
        show: false,
        url: "",
    });
    const [showLastStationButton, setShowLastStationButton] = useState(
        diff > 0
    );
    const [registerVisitors, setRegisterVisitors] = useState(false);

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

    useEffect(() => {
        if (diff > 0) {
            setInterval(() => {
                setShowRemoveStationModal(false);
                setShowLastStationButton(false);
            }, diff);
        }
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

    const { data: stations } = useQuery({
        queryKey: ["stations"],
        queryFn: async () => {
            const response = await fetch("api/stations");
            const data = await response.json();
            return data;
        },
    });

    const registerMutation = useMutation({
        mutationKey: "verify-tour",
        mutationFn: async (visitors) => {
            const result = await fetch(
                `/api/students/${student._id}/tours/${tour._id}/registerVisitors`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(visitors),
                }
            ).then((res) => res.json());
            await endTour();
            return result;
        },
        onSettled: () => {
            queryClient.invalidateQueries(["tour"]);
        },
    });

    async function onRemoveClick() {
        await fetch(
            `api/students/${student._id}/tours/${tour._id}/stations/${lastStation.id}`,
            {
                method: "DELETE",
            }
        );
        queryClient.invalidateQueries(["currentTour"]);
        showToast(
            "Success!",
            "",
            "Station has successfully been removed from tour",
            "Success"
        );
        setShowLastStationButton(false);
    }

    if (!stations) return <Loading />;

    function RegisterVisitorsView() {
        return (
            <>
                <h2>Register Visitors</h2>
                <RegisterVisitors
                    sendFormLabel={"Register Visitors"}
                    onSendForm={(visitors) => registerMutation.mutate(visitors)}
                />
            </>
        );
    }

    function TourView() {
        return (
            <>
                <h2>Current Tour ({tour.identifier})</h2>
                <div style={{ marginTop: 1 + "em", marginBottom: 1 + "em" }}>
                    {!tour.verified && (
                        <Button
                            className="btn-secondary mb-2"
                            style={{
                                width: "100%",
                            }}
                            onClick={() => {
                                dispatchQrModalData({
                                    type: "show",
                                    url: `${window.origin.toString()}/tours/${tour._id}/validate`,
                                });
                            }}
                        >
                            Validate tour
                        </Button>
                    )}
                    <Button
                        className="btn-info mb-2"
                        style={{
                            width: "100%",
                        }}
                        onClick={() => {
                            dispatchQrModalData({
                                type: "show",
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
                <div>
                    <div className="mx-auto" style={{ width: "fit-content" }}>
                        <h3
                            className="mx-auto"
                            style={{ width: "fit-content" }}
                        >
                            Tour {tourNumber}:
                        </h3>
                        <i
                            className="bi bi-person-walking mx-auto d-block"
                            style={{ fontSize: "4rem", width: "fit-content" }}
                        ></i>
                        <TourTimer tour={tour} />
                    </div>
                    <div className="d-flex justify-content-between align-items-end mb-2">
                        <h3>Visited Stations:</h3>
                        {showLastStationButton && (
                            <Button
                                className="btn-danger"
                                onClick={() => setShowRemoveStationModal(true)}
                            >
                                Remove last station
                            </Button>
                        )}
                    </div>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Station name</th>
                                <th>Visited at:</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tour.stations.map((s) => {
                                let time = new Date(s.time.start);
                                return (
                                    <tr key={s.id}>
                                        <td>
                                            {
                                                stations.find(
                                                    (st) => st._id == s.id
                                                ).name
                                            }
                                        </td>
                                        <td>{`${time.getHours() < 10 ? "0" : ""}${time.getHours()}:${time.getMinutes() < 10 ? "0" : ""}${time.getMinutes()}`}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </div>
                <ConfirmationModal
                    show={showRemoveStationModal}
                    onCancel={() => setShowRemoveStationModal(false)}
                    title="Remove Station from Tour?"
                    message="Are you sure you want to remove the last visited station from the tour?"
                    onConfirm={onRemoveClick}
                    disableLockedModal={true}
                />
                <QRCodeModal
                    title="QR Code"
                    show={qrModalData.show}
                    onClose={() => dispatchQrModalData({ type: "hide" })}
                    onNewTabRequest={() => {
                        window.open(qrModalData.url, "_blank");
                        dispatchQrModalData({ type: "hide" });
                    }}
                >
                    <div className="d-flex flex-row justify-content-center">
                        <QRCode value={qrModalData.url} />
                    </div>
                </QRCodeModal>
            </>
        );
    }

    return (
        <>
            {registerVisitors ?
                <RegisterVisitorsView />
            :   <IkeaActiveTour
                    student={student}
                    tour={tour}
                    tourNumber={tourNumber}
                    setRegisterVisitors={setRegisterVisitors}
                />
            }
        </>
    );
}

ActiveTour.propTypes = {
    student: PropTypes.object,
    tour: PropTypes.object,
    tourNumber: PropTypes.number,
};
