import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {useAuthFetch} from "../../lib/MSAL.js";

const MessageCard = ({userId, text, onAccept, onDeny}) => {
    const fetch = useAuthFetch()
    const {data: user} = useQuery({
        queryKey: "user",
        queryFn: async () => {
            const response = await fetch("api/students/" + userId)
            const data = await response.json()
            console.log(data)
            return data
        },
        staleTime: Infinity,
    })
    return (
        <div className="card sw-100 w-md-75">
            <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                    <h6 className="card-title mb-1">{user?.firstname}</h6>
                    <p className="card-text mb-0">{text}</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-primary" onClick={() => onAccept(userId)}>ok</button>
                    <button className="btn btn-danger" onClick={() => onDeny(userId)}>deny</button>
                </div>
            </div>
        </div>
    );
};

const PendingResponseList = ({pendingResponses, onAccept, onDeny}) => {
    return (
        <div className="d-flex flex-column gap-3">
            {pendingResponses.map((msg, index) => (
                <MessageCard key={index} userId={msg} text={"Call to Station"} onAccept={onAccept} onDeny={onDeny}/>
            ))}
        </div>
    );
};

export default PendingResponseList;
