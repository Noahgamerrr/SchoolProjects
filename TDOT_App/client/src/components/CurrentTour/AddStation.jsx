import { useMsal } from "@azure/msal-react";
import { useState } from "react";
import { useAuthFetch } from "../../lib/MSAL";
import Loading from "../Loading";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

export default function AddStation() {
    const { instance } = useMsal();
    const activeAccount = instance.getActiveAccount();
    const shortform = activeAccount.username.split("@")[0];
    const [ tourLoaded, setTourLoaded ] = useState(false); 
    const fetch = useAuthFetch();
    const navigate = useNavigate();
    const { stationId } = useParams();

    const { data: student } = useQuery({
        queryKey: ["student"],
        queryFn: async () => {
            const response = await fetch(`/api/students?shortform=${shortform}`);
            const data = await response.json();
            return data[0];
        },
        staleTime: Infinity,
    });

    const { data: currentTour } = useQuery({
        queryKey: ["currentTour"],
        queryFn: async () => {
            const response = await fetch(`/api/students/${student._id}/currentTour`);
            let data = null;
            if (response.status == 200) {
                data = await response.json();
            }
            setTourLoaded(true);
            return data;
        }
    });

    useQuery({
        queryKey: ["addStation"],
        queryFn: async () => {
            let level = "Success";
            let message = "Station has been successfully added to tour";
            const response = await fetch(`/api/students/${student._id}/tours/${currentTour._id}/stations`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id: stationId,
                        time: {
                            start: new Date()
                        }
                    })
                }
            );
            if (response.status >= 400) {
                level = "Danger"
                message = await response.text();
            }
            navigate(`/currentTour?level=${level}&message=${message}`);
        }
    });

    return <Loading />;



}