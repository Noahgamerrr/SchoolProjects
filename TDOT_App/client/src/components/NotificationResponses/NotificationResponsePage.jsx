import {useQuery, useQueryClient} from "@tanstack/react-query";
import {useAuthFetch} from "../../lib/MSAL.js";
import {useEffect, useState} from "react";
import MessageList from "./PendingResponseList.jsx";
import PendingResponseList from "./PendingResponseList.jsx";

export default () => {
    const fetch = useAuthFetch()
    const queryClient = useQueryClient()

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: "responses",
        queryFn: async () => {
            const response = await fetch("/api/notifications/responses/pending");
            if (!response.ok) {
                throw response;
            }
            const data = await response.json();
            return data;
        },
    });
    console.log(data)
    const onAccept = (id) => {
        fetch("/api/notifications/responses/", {
            method: "POST",
            headers: {"x-response-target": id, "x-accept-calling": "accept"},
        }).then((_) => {
            queryClient.invalidateQueries(["responses"])
        })
    }
    const onDeny = (id) => {}
    return data && data.length ? <PendingResponseList pendingResponses={data} onAccept={onAccept} onDeny={onDeny}/> : <p>No responses to give...</p>
}