import {useEffect, useMemo} from "react";
import {useAuthFetch} from "../../lib/MSAL";
import {useQuery} from "@tanstack/react-query";
import Loading from "../Loading.jsx";

const COLORS = {
    90: "#db2c2c",
    75: "#ebcf00",
    30: "#02db3d",
    0: "#017821"
};

function findLastTimeInstance(data) {
    if (!Array.isArray(data) || data.length === 0) {
        return null; // Handle invalid or empty input
    }

    // Convert time strings to comparable Date objects, find max, and return the name
    const dateRegex = /^(?<hours>[0-9]{1,2}):(?<minutes>[0-9]{2})$/
    const lastTimeEntry = data.reduce((latest, current) => {

        const regexLatest = dateRegex.exec(latest.name)?.groups
        let latestTime, currentTime

        if (regexLatest) {
            const {hours, minutes} = regexLatest
            latestTime = new Date(`1970-01-01T${`${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`}:00`);
        } else return latest
        const regexCurrent = dateRegex.exec(current.name)?.groups
        if (regexCurrent) {
            const {hours, minutes} = regexCurrent
            currentTime = new Date(`1970-01-01T${`${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`}:00`);
        } else return latest


        return currentTime > latestTime ? current : latest;
    });

    return lastTimeEntry.value;
}

export default function Overview() {
    const fetch = useAuthFetch();

    const {data: stations, isLoading} = useQuery({
        queryKey: ["stations"],
        queryFn: async () => {
            const response = await fetch(`/api/stations`, {
                headers: {
                    accept: "application/json",
                },
            });
            const s = await response.json();
            // console.log(s);
            return s.sort((a, b) => a.name.localeCompare(b.name));
        },
    });

    const stationData = useMemo(
        () =>
            stations?.map((s) => {
                const occupied = findLastTimeInstance(s.visitorsAtTime);


                return {
                    name: s.name,
                    id: s._id,
                    occ: occupied,
                    free: s.capacity - occupied,
                    cap: s.capacity,
                    color: Object.keys(COLORS).sort((a, b) => b - a)
                            .find(e => e <= (occupied * 100 / s.capacity))
                };
            }),
        [stations]
    );

    useEffect(() => {
        console.log(stationData);
    }, [stationData]);

    if (isLoading || !stationData || !stations) return <Loading/>;

    return (
        <>
            {
                stationData.map(s => 
                    <div>
                        <h2>{s.name}</h2>
                        <div className="d-flex justify-content-around">
                            <div className="text-center">
                                <i class="bi bi-person-fill" 
                                    style={{fontSize: "40px"}}
                                ></i>
                                <p>Total: {s.cap}</p>
                            </div>
                            <div className="text-center">
                                <i class="bi bi-person-fill-dash d-block"
                                    style={{fontSize: "40px", color: "#aaa"}}
                                ></i>
                                <p>Occupied: {s.occ}</p>
                            </div>
                            <div className="text-center">
                                <i class="bi bi-person-fill-check" 
                                    style={{fontSize: "40px", color: COLORS[s.color]}}
                                ></i>
                                <p>Free: {s.free}</p>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
}
