import { useEffect } from "react";
import { useAuthFetch } from "../../lib/MSAL";

export default function AcceptNotification() {
    const fetch = useAuthFetch();

    useEffect(() => {
        const g = new URLSearchParams(window.location.search).get("g");
        const r = new URLSearchParams(window.location.search).get("r");

        fetch(`/api/notifications/accept`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                g,
                r,
            }),
        }).then((res) => {
            window.location.href = "/currentTour";
        });
    });

    return <></>;
}
