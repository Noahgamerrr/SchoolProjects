import RoleTemplate from "../Util/RoleTemplate";
import { Form, Button } from "react-bootstrap";
import { lazy, useState } from "react";
import { showToast } from "../Toasts/ToastContainer";

const SingleStudentSelect = lazy(
    () => import("./recipientSelect/SingleStudentSelect")
);
import { useAuthFetch } from "../../lib/MSAL";
import { RequestGuides } from "./RequestGuides";
// <HomepageTeacher/>
export default function NotificationTeacherDashboard() {
    const fetch = useAuthFetch();
    const [formData, setFormData] = useState({
        title: "",
        body: undefined,
        recipients: [],
        recipientsGroups: {
            all: false,
            workers: false,
            guides: false,
            guideTeamLeads: false,
        },
        allowResponse: false
    });

    async function handleSubmit(e) {
        e.preventDefault();
        const response = await fetch("/api/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-allow-response": formData.allowResponse ? "allow" : "deny"
            },
            body: JSON.stringify({
                ...formData,
                recipients: formData.recipients.map((r) => r.value),
            }),
        });
        if (response.ok) {
            showToast(
                "Notification sent",
                "",
                `Notification "${formData.title}" was successfully dispatched to ${(await response.json()).length} recipients.`,
                "Success"
            );
        } else {
            showToast(
                "Error",
                "",
                `Failed to send notification "${formData.title}".`,
                "Danger"
            );
        }
    }

    return (
        <>
            <RoleTemplate requiredRoles={["admin", "teacher"]}>
                <div className="ps-3 pt-3 pe-3">
                    <h1>Teacher Notification Dashboard</h1>
                </div>
                <RequestGuides />
                <div
                    className="col-12 col-md-8 p-3"
                    style={{ maxWidth: "800px" }}
                >
                    <span
                        style={{
                            display: "block",
                            height: "1px",
                            width: "100%",
                            "background-color": "#888",
                            "margin-top": "1em",
                            "margin-bottom": "1em",
                        }}
                    ></span>
                    <h2>Send Notification</h2>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="formBasicDate">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter title"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        title: e.target.value,
                                    })
                                }
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicBody">
                            <Form.Label>
                                Body{" "}
                                <span
                                    style={{
                                        "font-size": "0.8em",
                                        color: "gray",
                                    }}
                                >
                                    (optional)
                                </span>
                            </Form.Label>
                            <Form.Check
                                type="checkbox"
                                label="Include body"
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        body: e.target.checked ? "" : undefined,
                                    })
                                }
                                disabled={
                                    formData.body !== undefined &&
                                    formData.body !== ""
                                }
                            />
                            {formData.body !== undefined && (
                                <Form.Control
                                    as="textarea"
                                    placeholder="Enter body"
                                    value={formData.body}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            body: e.target.value,
                                        })
                                    }
                                />
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formRecipient">
                            <Form.Label>Send to</Form.Label>
                            <SingleStudentSelect
                                recipients={formData.recipients}
                                setRecipients={(recipients) =>
                                    setFormData({
                                        ...formData,
                                        recipients,
                                    })
                                }
                            />
                        </Form.Group>
                        <Form.Group
                            className="mb-3"
                            controlId="formRecipientGroups"
                        >
                            <Form.Label>Send to groups</Form.Label>
                            <div className="ps-3">
                                <Form.Check
                                    type="checkbox"
                                    label="Everyone"
                                    checked={formData.recipientsGroups.all}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            recipientsGroups: {
                                                ...formData.recipientsGroups,
                                                all: e.target.checked,
                                                workers: e.target.checked,
                                                guides: e.target.checked,
                                                guideTeamLeads:
                                                    e.target.checked,
                                            },
                                        });
                                    }}
                                />
                                <Form.Check
                                    type="checkbox"
                                    label="Workers"
                                    checked={formData.recipientsGroups.workers}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            recipientsGroups: {
                                                ...formData.recipientsGroups,
                                                workers: e.target.checked,
                                            },
                                        })
                                    }
                                />
                                <Form.Check
                                    type="checkbox"
                                    label="Guides"
                                    checked={formData.recipientsGroups.guides}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            recipientsGroups: {
                                                ...formData.recipientsGroups,
                                                guides: e.target.checked,
                                            },
                                        })
                                    }
                                />
                                <Form.Check
                                    type="checkbox"
                                    label="Guide Team Leaders"
                                    checked={
                                        formData.recipientsGroups.guideTeamLeads
                                    }
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            recipientsGroups: {
                                                ...formData.recipientsGroups,
                                                guideTeamLeads:
                                                    e.target.checked,
                                            },
                                        })
                                    }
                                />
                            </div>
                        </Form.Group>
                        <Form.Group
                            className="mb-3"
                            controlId="formRecipientGroups"
                        >
                            <div className="ps-0">
                                <Form.Check
                                    type="checkbox"
                                    label="allow response"
                                    checked={formData.allowResponse}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            allowResponse: e.target.checked,
                                        });
                                    }}
                                />
                            </div>
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Submit
                        </Button>
                    </Form>
                </div>
            </RoleTemplate>
        </>
    );
}
