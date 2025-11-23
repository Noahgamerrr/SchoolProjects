import PropTypes from "prop-types";
import { Form, Button } from "react-bootstrap";
import { showToast } from "../../Toasts/ToastContainer";
import { useAuthFetch } from "../../../lib/MSAL";
import { useState } from "react";
import ConfirmationModal from "../../Modal/ConfirmationModal";
import NotificationTestButton from "../NotificationTestButton";

function NotificationPreferencesEmail({
    data,
    isLoading,
    refetch,
    preferences,
    setPreferences,
}) {
    const fetch = useAuthFetch();
    const [deleteModal, setDeleteModal] = useState(false);
    return (
        <div>
            <h3>Email</h3>
            <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>
                    {data?.email
                        ? `Subscribed to ${data.email}`
                        : "Not subscribed"}
                </Form.Label>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: "10px",
                        flexWrap: "wrap",
                    }}
                >
                    <Form.Control
                        type="email"
                        placeholder="Enter email"
                        disabled={isLoading}
                        style={{
                            width: "300px",
                        }}
                        value={preferences.email || ""}
                        onChange={(e) =>
                            setPreferences({
                                ...preferences,
                                email: e.target.value,
                            })
                        }
                    />
                    <div className="d-flex flex-row flex-nowrap gap-2">
                        <Button
                            variant="success"
                            type="submit"
                            style={{
                                display: "inline-block",
                                width: "120px",
                            }}
                            disabled={
                                isLoading ||
                                preferences.email?.trim() == data?.email ||
                                !/.+@.+/g.test(preferences.email)
                            }
                            onClick={async (e) => {
                                e.preventDefault();
                                if (!/.+@.+/g.test(preferences.email)) return;
                                const response = await fetch(
                                    "/api/notifications/providers/email",
                                    {
                                        method: "PUT",
                                        body: JSON.stringify({
                                            data: preferences.email,
                                        }),
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                    }
                                );
                                if (!response.ok) {
                                    showToast(
                                        "Failed to subscribe to email notifications",
                                        "",
                                        await response.text(),
                                        "Danger"
                                    );
                                }
                                await refetch();
                                showToast(
                                    "Subscribed to email notifications",
                                    "",
                                    `${preferences.email} subscribed`,
                                    "Success"
                                );
                            }}
                        >
                            {!data?.email ? "Subscribe" : "Update"}
                        </Button>
                        <NotificationTestButton
                            provider="email"
                            disabled={isLoading || !data?.email}
                        />
                        <Button
                            variant="danger"
                            type="submit"
                            style={{
                                display: "inline-block",
                                width: "120px",
                            }}
                            onClick={(e) => {
                                e.preventDefault();
                                setDeleteModal(true);
                            }}
                            disabled={isLoading || !data?.email}
                        >
                            Unsubscribe
                        </Button>
                    </div>
                </div>
            </Form.Group>
            <ConfirmationModal
                confirmColor="danger"
                title="Delete Email Subscription"
                message="Are you sure you want to delete the email subscription?"
                show={deleteModal}
                setShow={setDeleteModal}
                onConfirm={async () => {
                    setDeleteModal(false);
                    let resp = await fetch(
                        "/api/notifications/providers/email",
                        {
                            method: "DELETE",
                        }
                    );
                    if (!resp.ok) {
                        showToast(
                            "Failed to unsubscribe from email notifications",
                            "",
                            await resp.text(),
                            "Danger"
                        );
                        return;
                    }
                    await refetch();
                    showToast(
                        "Unsubscribed from email notifications",
                        "",
                        `${data.email} unsubscribed`,
                        "Success"
                    );
                    setPreferences({
                        ...preferences,
                        email: "",
                    });
                }}
                onCancel={() => {
                    setDeleteModal(false);
                }}
                disableLockedModal={true}
            />
        </div>
    );
}

NotificationPreferencesEmail.propTypes = {
    data: PropTypes.object,
    isLoading: PropTypes.bool.isRequired,
    preferences: PropTypes.object.isRequired,
    setPreferences: PropTypes.func.isRequired,
    refetch: PropTypes.func.isRequired,
};

export default NotificationPreferencesEmail;
