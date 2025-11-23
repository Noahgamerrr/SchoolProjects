import { useNavigate, useParams } from "react-router-dom"
import FeedbackInput from "./FeedbackInput";
import { useState } from "react";
import { useAuthFetch } from "../../lib/MSAL";
import Loading from "../Loading";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import FeedbackStationSelect from "./FeedbackStationSelect";
import { Button, Form } from "react-bootstrap";
import { showToast } from "../Toasts/ToastContainer";

export default function TourFeedback() {
    const [stationsLoaded, setStationsLoaded] = useState(false);
    const [feedback, setFeedback] = useState({
        rating: 0,
        favouriteStation: "",
        leastFavouriteStation: "",
        additionalFeedback: ""
    });
    const fetch = useAuthFetch();
    const { tourId } = useParams();
    const navigate = useNavigate();

    // Use localStorage to store feedbacked stations (to prevent accidentally sending multiple)
    let feedbackedTours = JSON.parse(
        localStorage.getItem("feedbackedTours")
    );

    if (!feedbackedTours) {
        feedbackedTours = [];
    }

    if (feedbackedTours.includes(tourId)) {
        // redirect to thank you page at /feedback/success
        navigate(`/feedback/success`);
    }

    const { data: stations } = useQuery({
        queryKey: ["tour-stations"],
        queryFn: async () => {
            const response = await fetch(`/api/tours/${tourId}/stations`);
            setStationsLoaded(true);
            const data = await response.json();
            return data;
        },
        staleTime: Infinity
    });

    const giveFeedbackMutation = useMutation({
        mutationKey: "post-feedback",
        mutationFn: async () => {
            return result = await fetch(`/api/tours/${tourId}/feedback`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    feedback: feedback
                })
            }).then((res) => res.json());
        },
        onSettled: () => {
            feedbackedTours.push(tourId);
            localStorage.setItem(
                "feedbackedTours",
                JSON.stringify(feedbackedTours)
            );
            navigate(`/feedback/success`);
        },
    })

    function validateFeedback() {
        if (feedback.rating == 0)
            showToast("Warning", "", "Please give your guide a rating!", "Warning");
        else if (feedback.favouriteStation == feedback.leastFavouriteStation && feedback.favouriteStation != 0)
            showToast("Warning", "", "Your favourite station cannot be your least favourite station!", "Warning");
        else giveFeedbackMutation.mutate();
    }

    if (!stationsLoaded) return <Loading/>
    if (!stations) return (
        <>
            <h2>Whoops!</h2>
            <p>Seems like this tour does not exist!</p>
        </>
    );

    return (
        <>
            <h2>Tour Feedback!</h2>
            <div className="flex-grow-1 d-flex flex-column justify-content-center">
                <h3>How would you rate your guide?</h3>
                <FeedbackInput
                    rating={feedback.rating}
                    onChange={(newRating) => {
                        setFeedback({
                            ...feedback,
                            rating: newRating
                        });
                    }}
                />
            </div>
            <div>
                <h3>What was your favourite station?</h3>
                <FeedbackStationSelect 
                    stations={stations} 
                    selectedStation={feedback.favouriteStation}
                    onStationSelect={(station) => setFeedback({
                        ...feedback,
                        favouriteStation: station
                    })}
                />
            </div>
            <div className="mt-2">
                <h3>What was your least favourite station?</h3>
                <FeedbackStationSelect 
                    stations={stations}
                    selectedStation={feedback.leastFavouriteStation}
                    onStationSelect={(station) => setFeedback({
                        ...feedback,
                        leastFavouriteStation: station
                    })}
                />
            </div>
            <div className="mt-2">
                <h3>Do you have additional feedback?</h3>
                <Form.Control 
                    as="textarea" 
                    rows={5} 
                    value={feedback.additionalFeedback}
                    onChange={e => setFeedback({
                        ...feedback,
                        additionalFeedback: e.target.value
                    })}
                />
            </div>
            <Button variant="success" className="mt-2" onClick={validateFeedback}>
                Submit
            </Button>
        </>
    )
}