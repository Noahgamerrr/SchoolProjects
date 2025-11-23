import PropTypes from "prop-types";
import { Form, Button } from "react-bootstrap";
import { showToast } from "../../Toasts/ToastContainer";
import QRCodeModal from "../../Modal/QRCodeModal";
import QRCode from "../../QRCode";
import { useState } from "react";
import { useAuthFetch } from "../../../lib/MSAL";
import ConfirmationModal from "../../Modal/ConfirmationModal";
import NotificationTestButton from "../NotificationTestButton";

function NotificationPreferencesNtfy({
    data,
    isLoading,
    refetch,
    preferences,
    setPreferences,
}) {
    const [regenerateModal, setRegenerateModal] = useState(false);
    const [ntfyModal, setNtfyModal] = useState(undefined);
    const [deleteModal, setDeleteModal] = useState(false);
    const fetch = useAuthFetch();

    const regenerate = async () => {
        const topic = "htl-vil-tdot-" + crypto.randomUUID();
        const response = await fetch("/api/notifications/providers/ntfy", {
            method: "PUT",
            body: JSON.stringify({
                data: topic,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            showToast(
                "Failed to subscribe to ntfy notifications",
                "",
                await response.text(),
                "Danger"
            );
        }
        await refetch();
        setNtfyModal(topic);
    };

    return (
        <div>
            <h3>Ntfy.sh</h3>
            <Form.Group className="mb-3" controlId="formBasicNtfy">
                <Form.Label>
                    {data?.ntfy ?
                        `Subscribed to ${data.ntfy}`
                    :   "Not subscribed"}
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
                        placeholder='Click "Generate" to subscribe'
                        disabled={true}
                        style={{
                            width: "300px",
                        }}
                        value={preferences.ntfy || ""}
                        onChange={(e) =>
                            setPreferences({
                                ...preferences,
                                ntfy: e.target.value,
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
                            disabled={isLoading}
                            onClick={(e) => {
                                e.preventDefault();
                                if (data?.ntfy) {
                                    setRegenerateModal(true);
                                } else {
                                    regenerate();
                                }
                            }}
                        >
                            {!data?.ntfy ? "Generate" : "Regenerate"}
                        </Button>
                        <NotificationTestButton
                            provider="ntfy"
                            disabled={isLoading || !data?.ntfy}
                        />
                        <Button
                            variant="danger"
                            type="submit"
                            style={{
                                display: "inline-block",
                                width: "120px",
                            }}
                            onClick={() => setDeleteModal(true)}
                            disabled={isLoading || !data?.ntfy}
                        >
                            Unsubscribe
                        </Button>
                        <Button
                            title="Show Ntfy.sh Setup QR-code"
                            variant="secondary"
                            type="submit"
                            style={{
                                display: "inline-block",
                            }}
                            onClick={() => setNtfyModal(data.ntfy)}
                            disabled={isLoading || !data?.ntfy}
                        >
                            <i className="bi bi-qr-code"></i>
                        </Button>
                    </div>
                </div>
            </Form.Group>
            <QRCodeModal
                show={ntfyModal}
                onNewTabRequest={() => {
                    window.open(`https://ntfy.sh/${ntfyModal}`);
                }}
                onClose={() => setNtfyModal(undefined)}
                title="Set up ntfy.sh"
            >
                <div className="d-flex flex-row justify-content-center">
                    <QRCode value={`ntfy://ntfy.sh/${ntfyModal}`} />
                </div>
                <div className="mt-2 px-4">
                    <p>
                        If you have already installed the app, you can scan the
                        QR code to subscribe to notifications.
                        <br />
                        You can also{" "}
                        <a href="https://docs.ntfy.sh/subscribe/phone/">
                            follow this guide
                        </a>{" "}
                        to subscribe to notifications.
                        <br />
                        The topic for manually subscibing is:{" "}
                        <pre>{ntfyModal}</pre>
                        Please do not share this topic with others. If you
                        regenerate the topic, the old topic will no longer
                        recieve notifications.
                    </p>
                </div>
            </QRCodeModal>
            <ConfirmationModal
                confirmColor="danger"
                title="Delete Ntfy.sh Subscription"
                message="Are you sure you want to delete the ntfy.sh subscription?"
                show={deleteModal}
                setShow={setDeleteModal}
                onConfirm={async () => {
                    setDeleteModal(false);
                    let resp = await fetch(
                        "/api/notifications/providers/ntfy",
                        {
                            method: "DELETE",
                        }
                    );
                    if (!resp.ok) {
                        showToast(
                            "Failed to unsubscribe from ntfy notifications",
                            "",
                            await resp.text(),
                            "Danger"
                        );
                        return;
                    }
                    await refetch();
                    showToast(
                        "Unsubscribed from ntfy notifications",
                        "",
                        `${data.ntfy} unsubscribed`,
                        "Success"
                    );
                    setPreferences({
                        ...preferences,
                        ntfy: "",
                    });
                }}
                onCancel={() => {
                    setDeleteModal(false);
                }}
                disableLockedModal={true}
            />
            <ConfirmationModal
                confirmColor="warning"
                title="Regenerate Ntfy.sh Subscription"
                message="Are you sure you want to regenerate the ntfy.sh subscription? You will stop recieving notifications on the old topic."
                show={regenerateModal}
                setShow={setRegenerateModal}
                onConfirm={() => {
                    setRegenerateModal(false);
                    regenerate();
                }}
                onCancel={() => {
                    setRegenerateModal(false);
                }}
                disableLockedModal={true}
            />
        </div>
    );
}

NotificationPreferencesNtfy.propTypes = {
    data: PropTypes.object,
    isLoading: PropTypes.bool.isRequired,
    preferences: PropTypes.object.isRequired,
    setPreferences: PropTypes.func.isRequired,
    refetch: PropTypes.func.isRequired,
};

export default NotificationPreferencesNtfy;
