import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthFetch } from "../../lib/MSAL";
import NotificationPreferencesEmail from "./preferencesForms/NotificationPreferencesEmail";
import NotificationPreferencesDiscord from "./preferencesForms/NotificationPreferencesDiscord";
import NotificationPreferencesNtfy from "./preferencesForms/NotificationPreferencesNtfy";

function NotificationPreferences() {
    const fetch = useAuthFetch();
    const [preferences, setPreferences] = useState({});

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: "notification-preferences",
        queryFn: async () => {
            const response = await fetch("/api/notifications/providers");
            if (!response.ok) {
                throw response;
            }
            const data = await response.json();
            setPreferences(data);
            return data;
        },
    });

    // If error 412, show a message to the user
    if (error?.status === 412) {
        return <div>Student not found</div>;
    }

    return (
        <>
            <h2>Notification Providers</h2>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                    flexWrap: "nowrap",
                    paddingLeft: "2em",
                    paddingTop: "0.5em",
                }}
            >
                {/* web-push not yet implemented
                <div>
                    <h3>Browser Notifications</h3>
                    <p
                        style={{
                            marginBottom: "0.5em",
                        }}
                    >
                        Notifications are currently{" "}
                        <b>
                            {Notification.permission.replace(
                                "default",
                                "unset"
                            )}
                        </b>
                        .<br />
                        {Notification.permission === "denied" &&
                            "Please allow them in your browser settings. If you have already allowed them, please refresh the page."}
                        {Notification.permission === "granted" &&
                            "You can disable them in your browser settings."}
                        {Notification.permission === "default" &&
                            "Enable browser notifications by pressing the button below and allowing notifications."}
                    </p>
                    <Button
                        variant="success"
                        type="submit"
                        style={{
                            display: "inline-block",
                            width: "200px",
                            marginRight: "10px",
                        }}
                        onClick={async () => {
                            const permission =
                                await Notification.requestPermission();
                            if (permission === "granted") {
                                await refetch();
                            }
                        }}
                        disabled={
                            isLoading || Notification.permission !== "default"
                        }
                    >
                        Request Permission
                    </Button>
                </div>
                */}

                <NotificationPreferencesEmail
                    data={data}
                    isLoading={isLoading}
                    preferences={preferences}
                    setPreferences={setPreferences}
                    refetch={refetch}
                />
                <NotificationPreferencesDiscord
                    data={data}
                    isLoading={isLoading}
                    preferences={preferences}
                    setPreferences={setPreferences}
                    refetch={refetch}
                />
                <NotificationPreferencesNtfy
                    data={data}
                    isLoading={isLoading}
                    preferences={preferences}
                    setPreferences={setPreferences}
                    refetch={refetch}
                />
            </div>
        </>
    );
}

export default NotificationPreferences;
