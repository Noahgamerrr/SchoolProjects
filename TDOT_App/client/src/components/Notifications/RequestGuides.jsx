import { Button, Form, Table } from "react-bootstrap";
import { useState } from "react";
import ConfirmationModal from "../Modal/ConfirmationModal";
import { useAuthFetch } from "../../lib/MSAL";
import { showToast } from "../Toasts/ToastContainer";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Loading from "../Loading";

export const RequestGuides = () => {
    const fetch = useAuthFetch();
    const queryClient = useQueryClient();

    const [confirmModal, setConfirmModal] = useState(null);
    const [formData, setFormData] = useState({
        location: "",
        amount: 1,
    });

    const { data: pendingRequests, isLoading: pendingRequestsLoading } =
        useQuery({
            queryKey: ["guide-requests"],
            queryFn: async () => {
                const response = await fetch("/api/notifications/guiderequest");
                if (!response.ok) return null;
                return await response.json();
            },
            refetchInterval: 3000,
        });

    const requestNGuides = (n, location) => {
        setConfirmModal({
            amount: n,
            location,
        });
    };

    const _requestNGuides = async (n, location) => {
        const resp = await fetch("/api/notifications/guiderequest", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                location,
                amount: n,
            }),
        });

        queryClient.invalidateQueries("guide-requests");

        if (resp.ok) {
            showToast(
                "Guides requested",
                "",
                `Successfully requested ${n} guide${n > 1 ? "s" : ""} to ${location}`,
                "Success"
            );
        } else {
            if (resp.status === 412) {
                const availableGuides = (await resp.json()).availableGuides;
                showToast(
                    "Not enough guides available",
                    "",
                    `There are only ${availableGuides} guides available at the moment, but you requested ${n} guides`,
                    "Danger"
                );
            } else {
                showToast(
                    "Error",
                    "",
                    `Failed to request ${n} guide${n > 1 ? "s" : ""} to ${location}`,
                    "Danger"
                );
            }
        }
    };

    const handleFormError = () => {};

    const handleSubmit = (e) => {
        e.preventDefault();

        if (formData.location.trim() == "")
            return handleFormError("Location cannot be empty");

        if (formData.amount < 1)
            return handleFormError("Amount must be at least 1");

        requestNGuides(formData.amount, formData.location);
    };

    return (
        <>
            <div className="d-flex flex-row-reverse justify-content-end flex-wrap p-3 gap-4 pe-5">
                <div>
                    <h2>Pending requests</h2>
                    {pendingRequestsLoading ?
                        <Loading />
                    :   <div
                            className="overflow-auto"
                            style={{ maxHeight: "350px" }}
                        >
                            {pendingRequests?.length === 0 ?
                                <p>No guide requests pending.</p>
                            :   <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>Location</th>
                                            <th>Confirmed</th>
                                            <th>Guides</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingRequests?.map((req) => (
                                            <tr key={req._id}>
                                                <td className="text-center">
                                                    {req.location}
                                                </td>
                                                <td className="text-center">
                                                    {req.amount -
                                                        req.pending.length}
                                                </td>
                                                <td className="text-center">
                                                    {req.amount}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            }
                        </div>
                    }
                </div>
                <div className="col-12 col-md-8" style={{ maxWidth: "800px" }}>
                    <h2>Request Guides</h2>
                    <h3 className="fs-4">Request guides in one click</h3>
                    <div className="d-flex gap-2 mb-4">
                        <Button
                            className="fs-4"
                            onClick={() => requestNGuides(1, "Infodesk")}
                        >
                            <i className="bi bi-person-raised-hand me-2" />
                            Infodesk
                        </Button>
                        <Button
                            className="fs-4"
                            onClick={() => requestNGuides(1, "Entrance")}
                        >
                            <i className="bi bi-person-raised-hand me-2" />
                            Entrance
                        </Button>
                    </div>
                    <h3 className="fs-4">Request guides to other locations:</h3>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formCount">
                            <Form.Label>Amount</Form.Label>
                            <div className="d-flex gap-2 mb-3">
                                <i className="bi bi-person-standing fs-3"></i>
                                <Form.Control
                                    min={1}
                                    max={9}
                                    type="number"
                                    placeholder="How many guides do you need?"
                                    value={formData.amount}
                                    onChange={(e) => {
                                        e.preventDefault();
                                        let val = parseInt(e.target.value, 10);

                                        if (val >= 10) val %= 10;
                                        if (val < 1) val = 1;
                                        if (isNaN(val)) val = 1;

                                        setFormData({
                                            ...formData,
                                            amount: val,
                                        });
                                    }}
                                />
                            </div>
                        </Form.Group>
                        <Form.Group controlId="formLocation">
                            <Form.Label>Location</Form.Label>
                            <div className="d-flex gap-2 mb-3">
                                <i className="bi bi-geo-alt-fill fs-3"></i>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter location"
                                    value={formData.location}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            location: e.target.value,
                                        })
                                    }
                                />
                                <Button
                                    type="button"
                                    onClick={() =>
                                        setFormData({
                                            ...formData,
                                            location: "Infodesk",
                                        })
                                    }
                                >
                                    Infodesk
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() =>
                                        setFormData({
                                            ...formData,
                                            location: "Entrance",
                                        })
                                    }
                                >
                                    Entrance
                                </Button>
                            </div>
                        </Form.Group>
                        <Button
                            type="submit"
                            disabled={
                                formData.location.trim() == "" ||
                                formData.amount < 1
                            }
                        >
                            Request {formData.amount} guide
                            {formData.amount > 1 ? "s" : ""} to "
                            {formData.location}"
                        </Button>
                    </Form>
                </div>
            </div>
            <ConfirmationModal
                disableLockedModal={true}
                message="Are you sure that you want to request guides?"
                title={`${confirmModal?.amount} guide${confirmModal?.amount > 1 ? "s" : ""} to ${confirmModal?.location}`}
                onConfirm={() => {
                    setConfirmModal(null);
                    _requestNGuides(confirmModal.amount, confirmModal.location);
                }}
                onCancel={() => {
                    setConfirmModal(null);
                }}
                confirmColor="primary"
                show={confirmModal !== null}
            />
        </>
    );
};
