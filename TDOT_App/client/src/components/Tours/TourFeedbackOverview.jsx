import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthFetch } from "../../lib/MSAL";
import Loading from "../Loading";
import List from "../StudentList/List";
import { createColumnHelper } from "@tanstack/react-table";
import FeedbackOutput from "../Feedback/FeedbackOutput";
import PropTypes from "prop-types";
import { Button, ButtonGroup } from "react-bootstrap";
import { showToast } from "../Toasts/ToastContainer";
import { useState } from "react";
import ConfirmationModal from "../Modal/ConfirmationModal";
import StationName from "./StationName";

const FeedbackDeleteButton = ({ onDelete }) => {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <Button
                variant="danger"
                title="Delete"
                onClick={() => setShowModal(true)}
            >
                <i className="bi bi-trash"></i>
            </Button>
            <ConfirmationModal
                show={showModal}
                onCancel={() => setShowModal(false)}
                title="Delete Feedback"
                message="Are you sure you want to delete this feedback?"
                onConfirm={() => {
                    onDelete();
                    setShowModal(false);
                }}
                disableLockedModal={true}
            />
        </>
    );
};

FeedbackDeleteButton.propTypes = {
    onDelete: PropTypes.func.isRequired,
};

const TourFeedbackOverview = ({ feedbacks, getDeleteUrl }) => {
    // const [rating, setRating] = useState(0);
    const fetch = useAuthFetch();
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationKey: "delete-tour-feedback",
        mutationFn: async (id) => {
            if (!getDeleteUrl()) throw new Error("No delete url");
            const res = await fetch(getDeleteUrl(id), {
                method: "DELETE",
            });

            if (!res.ok) {
                const error = new Error(
                    "An error occurred while deleting the feedback."
                );
                error.status = res.status;
                error.info = await res.json();
                throw error;
            }
        },
        onSettled: (data, error) => {
            queryClient.invalidateQueries(["tours", "tour", "toursfeedback"]);
            if (!error)
                showToast(
                    "Success!",
                    "",
                    `Feedback successfully deleted!`,
                    "success"
                );
            else
                showToast(
                    "Error!",
                    "",
                    `An error occurred while deleting the feedback: ${error.status}`,
                    "danger"
                );
        },
    });

    if (!feedbacks) return <Loading />;

    if (feedbacks.length === 0)
        return (
            <div>
                <h2>Feedback</h2>
                <p>No feedback available.</p>
            </div>
        );

    const columnHelper = createColumnHelper();

    let additionalColumns = [];

    if (getDeleteUrl)
        additionalColumns = [
            columnHelper.display({
                header: "Actions",
                cell: (meta) => (
                    <>
                        <ButtonGroup>
                            <FeedbackDeleteButton
                                onDelete={() =>
                                    deleteMutation.mutate(meta.row.original._id)
                                }
                            />
                        </ButtonGroup>
                    </>
                ),
                enableSorting: false,
            }),
        ];

    return (
        <>
            <List
                title="Feedback"
                data={feedbacks}
                columns={[
                    /* columnHelper.accessor("type", {
                        header: "Type",
                    }), */
                    columnHelper.accessor("rating", {
                        header: "Rating",
                        cell: (rating) => (
                            <FeedbackOutput
                                rating={rating.getValue()}
                                size={40}
                            />
                        ),
                        enableColumnFilter: false,
                    }),
                    columnHelper.accessor("favouriteStation", {
                        header: "Favourite Station",
                        cell: (station) => (
                            <StationName stationId={station.getValue()}/>
                        ),
                        enableSorting: false,
                        filterFn: "includesString",
                    }),
                    columnHelper.accessor("leastFavouriteStation", {
                        header: "Least favourite Station",
                        cell: (station) => (
                            <StationName stationId={station.getValue()}/>
                        ),
                        enableSorting: false,
                        filterFn: "includesString",
                    }),
                    columnHelper.accessor("additionalFeedback", {
                        header: "Feedback",
                        enableSorting: false,
                        filterFn: "includesString",
                    }),

                    ...additionalColumns,
                ]}
            />
            {/* <FeedbackInput rating={rating} onChange={setRating} size={100} /> */}
        </>
    );
};

TourFeedbackOverview.propTypes = {
    feedbacks: PropTypes.array.isRequired,
    getDeleteUrl: PropTypes.func,
};

export default TourFeedbackOverview;
