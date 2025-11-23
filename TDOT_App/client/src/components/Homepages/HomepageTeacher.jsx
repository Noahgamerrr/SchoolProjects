import { useQuery } from "@tanstack/react-query";
import { useAuthFetch } from "../../lib/MSAL";
import ToursStartedDiagram from "./Diagrams/Teacher/ToursStartedDiagram";
import StudentsOnBreak from "./Diagrams/Teacher/StudentsOnBreak";
import StationVisits from "./Diagrams/Teacher/StationVisits";

export default function HomepageTeacher() {
    const fetch = useAuthFetch();

    const { data: statistics } = useQuery({
        queryKey: ["statistics", "teacher"],
        queryFn: async () => {
            const response = await fetch("/api/statistics/teacher");
            const data = await response.json();
            return data;
        },
        staleTime: Infinity,
    });

    return (
        <>
            <div className="row w-100">
                <div className="col-md-5">
                    <StudentsOnBreak students={statistics?.studentsOnBreak}/>
                    <div className="w-100" style={{height: "42%"}}>
                        <ToursStartedDiagram toursStarted={statistics?.toursStarted}/> 
                    </div>
                </div>
                <div className="col-md-7">
                    <div style={{height: "80vh", overflowY: "scroll"}}>
                        <StationVisits stationVisits={statistics?.stations}/>
                    </div>
                </div>
            </div> 
        </>
    )
}
