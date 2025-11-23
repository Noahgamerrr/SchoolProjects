import PropTypes from "prop-types";
import { Form, Button } from "react-bootstrap";
import { showToast } from "../../Toasts/ToastContainer";
import ConfirmationModal from "../../Modal/ConfirmationModal";
import { useState } from "react";
import { useAuthFetch } from "../../../lib/MSAL";
import NotificationTestButton from "../NotificationTestButton";

function NotificationPreferencesDiscord({
    data,
    isLoading,
    refetch,
    preferences,
    setPreferences,
}) {
    const [deleteModal, setDeleteModal] = useState(false);
    const fetch = useAuthFetch();
    return (
        <div>
            <h3>Discord</h3>
            <p>
                If you need help, check out:{" "}
                <a href="https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks">
                    How to create a discord webhook
                </a>
            </p>
            <Form.Group className="mb-3" controlId="formBasicDiscord">
                <Form.Label>
                    {data?.discord
                        ? `Subscribed to ${data.discord}`
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
                        type="text"
                        placeholder="Enter webhook url"
                        disabled={isLoading}
                        style={{
                            width: "300px",
                        }}
                        value={preferences.discord || ""}
                        onChange={(e) =>
                            setPreferences({
                                ...preferences,
                                discord: e.target.value,
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
                                preferences.discord?.trim() == data?.discord ||
                                !(preferences.discord || "").startsWith(
                                    "https://discord.com/api/webhooks/"
                                )
                            }
                            onClick={async (e) => {
                                e.preventDefault();
                                if (
                                    !(preferences.discord || "").startsWith(
                                        "https://discord.com/api/webhooks/"
                                    )
                                )
                                    return;
                                const response = await fetch(
                                    "/api/notifications/providers/discord",
                                    {
                                        method: "PUT",
                                        body: JSON.stringify({
                                            data: preferences.discord,
                                        }),
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                    }
                                );
                                if (!response.ok) {
                                    showToast(
                                        "Failed to subscribe to discord notifications",
                                        "",
                                        await response.text(),
                                        "Danger"
                                    );
                                }
                                await refetch();
                                showToast(
                                    "Subscribed to discord notifications",
                                    "",
                                    `${preferences.discord} subscribed`,
                                    "Success"
                                );
                            }}
                        >
                            {!data?.discord ? "Subscribe" : "Update"}
                        </Button>
                        <NotificationTestButton
                            provider="discord"
                            disabled={isLoading || !data?.discord}
                        />
                        <Button
                            variant="danger"
                            type="submit"
                            style={{
                                display: "inline-block",
                                width: "120px",
                            }}
                            onClick={async (e) => {
                                e.preventDefault();
                                setDeleteModal(true);
                            }}
                            disabled={isLoading || !data?.discord}
                        >
                            Unsubscribe
                        </Button>
                    </div>
                </div>
            </Form.Group>
            <ConfirmationModal
                confirmColor="danger"
                title="Delete Discord Webhook"
                message="Are you sure you want to delete the discord webhook?"
                show={deleteModal}
                setShow={setDeleteModal}
                onConfirm={async () => {
                    setDeleteModal(false);
                    let resp = await fetch(
                        "/api/notifications/providers/discord",
                        {
                            method: "DELETE",
                        }
                    );
                    if (!resp.ok) {
                        showToast(
                            "Failed to unsubscribe from discord notifications",
                            "",
                            await resp.text(),
                            "Danger"
                        );
                        return;
                    }
                    await refetch();
                    showToast(
                        "Unsubscribed from discord notifications",
                        "",
                        `${data.discord} unsubscribed`,
                        "Success"
                    );
                    setPreferences({
                        ...preferences,
                        discord: "",
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

NotificationPreferencesDiscord.propTypes = {
    data: PropTypes.object,
    isLoading: PropTypes.bool.isRequired,
    preferences: PropTypes.object.isRequired,
    setPreferences: PropTypes.func.isRequired,
    refetch: PropTypes.func.isRequired,
};

export default NotificationPreferencesDiscord;
