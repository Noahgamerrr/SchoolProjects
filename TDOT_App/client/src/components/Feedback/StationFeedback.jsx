import { useNavigate, useParams } from "react-router-dom";
import ClientError from "../Errors/ClientError";
import { useAuthFetch } from "../../lib/MSAL";
import { useQuery } from "@tanstack/react-query";
import Loading from "../Loading";
import FeedbackInput from "./FeedbackInput";
import { useState } from "react";
import { Button } from "react-bootstrap";
import { AuthenticatedTemplate } from "@azure/msal-react";
import PopupModal from "../Modal/PopupModal";
import QRCode from "../QRCode";

/**
 * @type {React.FC}
 */
const StationFeedback = () => {
    // Get url parm from react router
    const { id } = useParams();
    const fetch = useAuthFetch();
    const navigate = useNavigate();

    const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false);

    // Use localStorage to store feedbacked stations (to prevent accidentally sending multiple)
    let feedbackedStations = JSON.parse(
        localStorage.getItem("feedbackedStations")
    );

    if (!feedbackedStations) {
        feedbackedStations = [];
    }

    const { data: station, error } = useQuery({
        queryKey: ["stations", id],
        queryFn: async () => {
            return await fetch(`/api/stations/${id}`).then((res) => res.json());
        },
    });

    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState("");

    if (!id || error)
        return (
            <ClientError title="Not found">
                The station you are trying to give feedback to does not exist.
            </ClientError>
        );

    if (!station) {
        return <Loading />;
    }

    if (feedbackedStations.includes(station._id)) {
        // redirect to thank you page at /feedback/success
        navigate(`/feedback/success`);
    }

    return (
        <div className="d-flex flex-column h-100">
            <h2 className="fs-1">{station.name}</h2>
            <h3 className="text-secondary fs-4">Station Feedback</h3>
            <AuthenticatedTemplate>
                <div className="d-flex flex-row flex-nowrap mt-2">
                    <Button
                        className="fs-3 py-1"
                        variant="secondary"
                        title="Generate QR code"
                        onClick={() => setQrCodeModalOpen(true)}
                    >
                        <i className="bi bi-qr-code" />
                    </Button>
                    <PopupModal
                        title="QR Code"
                        show={qrCodeModalOpen}
                        onClose={() => setQrCodeModalOpen(false)}
                    >
                        <div className="d-flex flex-row justify-content-center">
                            <QRCode value={window.location.toString()} />
                        </div>
                    </PopupModal>
                </div>
            </AuthenticatedTemplate>
            <div className="flex-grow-1 d-flex flex-column justify-content-center">
                <FeedbackInput
                    rating={rating}
                    onChange={(newRating) => {
                        setRating(newRating);
                    }}
                />
            </div>
            <div>
                <label htmlFor="ta-feedback-comment" className="pb-1">
                    If you want, you can leave a comment:
                </label>
                <textarea
                    className="w-100"
                    id="ta-feedback-comment"
                    value={feedback}
                    onChange={(ev) => setFeedback(ev.target.value)}
                ></textarea>
            </div>

            <div>
                <Button
                    className="w-100 mt-2 fs-2"
                    variant="success"
                    disabled={rating == 0}
                    onClick={() => {
                        if (rating == 0) return;
                        fetch(`/api/stations/${station._id}/feedback`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                rating,
                                feedback,
                            }),
                        }).then((res) => {
                            if (res.ok) {
                                feedbackedStations.push(station._id);
                                localStorage.setItem(
                                    "feedbackedStations",
                                    JSON.stringify(feedbackedStations)
                                );
                                navigate(`/feedback/success`);
                            } else {
                                alert("Failed to submit feedback");
                            }
                        });
                    }}
                >
                    Submit
                </Button>
            </div>
        </div>
    );
};

export default StationFeedback;
