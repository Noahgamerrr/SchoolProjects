import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthFetch } from "../../lib/MSAL";
import Loading from "../Loading";
import { Link } from "react-router-dom";
import List from "../StudentList/List";
import { createColumnHelper } from "@tanstack/react-table";
import FeedbackOutput from "./FeedbackOutput";
import PropTypes from "prop-types";
import { Button, ButtonGroup } from "react-bootstrap";
import { showToast } from "../Toasts/ToastContainer";
import { useState } from "react";
import ConfirmationModal from "../Modal/ConfirmationModal";

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

/**
 * @type {React.FC<{
 *  stationId: string,
 *  showDeleteButtons: boolean
 * }>}
 */
const FeedbackOverview = ({ stationId, showDeleteButtons = false }) => {
    // const [rating, setRating] = useState(0);
    const fetch = useAuthFetch();
    const queryClient = useQueryClient();

    const { data: stationFeedbacks } = useQuery({
        queryKey: ["feedback", "stationfeedback"],
        queryFn: async () => {
            return await fetch(`/api/stations/${stationId}/feedback`).then(
                (res) => res.json()
            );
        },
    });

    const deleteMutation = useMutation({
        mutationKey: "delete-feedback",
        mutationFn: async (id) => {
            return await fetch(`/api/stations/${stationId}/feedback/${id}`, {
                method: "DELETE",
            }).then((res) => res.json());
        },
        onSettled: () => {
            queryClient.invalidateQueries(["feedback", "stationfeedback"]);
            showToast(
                "Success!",
                "",
                `Feedback successfully deleted!`,
                "success"
            );
        },
    });

    if (!stationFeedbacks) return <Loading />;

    const feedbacks = [
        ...stationFeedbacks.map((sf) => ({ ...sf, type: "Station" })),
    ];

    if (feedbacks.length === 0)
        return (
            <div>
                <h2>Feedback</h2>
                <p>No feedback available.</p>
            </div>
        );

    const columnHelper = createColumnHelper();

    let additionalColumns = [];

    if (showDeleteButtons)
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
                    columnHelper.accessor("station", {
                        header: "Link",
                        cell: (station) => (
                            <Link to={`/stations/${station.getValue()._id}`}>
                                {station.getValue().name}
                            </Link>
                        ),
                        enableSorting: false,
                        enableColumnFilter: false,
                    }),
                    columnHelper.accessor("rating", {
                        header: "Rating",
                        cell: (rating) => (
                            <FeedbackOutput
                                rating={rating.getValue()}
                                size={40}
                            />
                        ),
                    }),
                    columnHelper.accessor("feedback", {
                        header: "Feedback",
                        enableSorting: false,
                        filterFn: "includesString",
                    }),
                    columnHelper.accessor("createdAt", {
                        header: "Created At",
                        cell: (createdAt) =>
                            new Date(createdAt.getValue()).toLocaleString(),
                        enableSorting: true,
                        sortingFn: (a, b) => {
                            return (
                                new Date(a).getTime() - new Date(b).getTime()
                            );
                        },
                        enableColumnFilter: false,
                    }),
                    ...additionalColumns,
                ]}
            />
            {/* <FeedbackInput rating={rating} onChange={setRating} size={100} /> */}
        </>
    );
};

FeedbackOverview.propTypes = {
    stationId: PropTypes.string.isRequired,
    showDeleteButtons: PropTypes.bool,
};

export default FeedbackOverview;
