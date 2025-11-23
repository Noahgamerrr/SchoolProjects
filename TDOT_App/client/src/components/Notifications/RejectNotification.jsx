import { useEffect } from "react";
import { useAuthFetch } from "../../lib/MSAL";

export default function RejectNotification() {
    const fetch = useAuthFetch();

    useEffect(() => {
        const g = new URLSearchParams(window.location.search).get("g");
        const r = new URLSearchParams(window.location.search).get("r");

        fetch(`/api/notifications/reject?g=${g}&r=${r}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                g,
                r,
            }),
        }).then((res) => {
            try {
                window.close();
            } catch (e) {
                window.location.href = "/";
            }
        });
    });

    return <></>;
}
