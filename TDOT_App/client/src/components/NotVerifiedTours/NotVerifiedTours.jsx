import { useQuery } from "@tanstack/react-query";
import ROLES from "../../lib/roles.json";
import Loading from "../Loading";
import RoleTemplate from "../Util/RoleTemplate";
import { useAuthFetch } from "../../lib/MSAL";
import { useState } from "react";
import { Button } from "react-bootstrap";
import VerifyTour from "./VerifyTour";

export default function NotVerifiedTours() {
	const fetch = useAuthFetch();
	const [verifyingTour, setVerifyingTour] = useState(-1);

	const { data: tours } = useQuery({
        queryKey: ["tours", "not-verified"],
        queryFn: async () => {
            const response = await fetch("api/tours/notVerified");
            const data = await response.json();
            return data;
        },
		refetchInterval: 5000
    });

	const { data: activeOpenday } = useQuery({
        queryKey: ["openday", "active", "not-verified"],
        queryFn: async () => {
            const response = await fetch("/api/opendays/active");
            return await response.json();
        },
        staleTime: Infinity,
    });

	if (!tours || !activeOpenday) return <Loading/>

	function formatTime(rawTime) {
		const time = new Date(rawTime);
		const hours = time.getHours().toString().padStart(2, "0");
		const minutes = time.getMinutes().toString().padStart(2, "0");
	
		return `${hours}:${minutes}`;
	}

	function NotVerifiedToursView() {
		return (
			<>
				<h2>Verify Tours</h2>
				{
					tours.length ? tours.map((t, idx) => (
						<div className={`my-3 mx-5 p-2`} key={t._id}>
							<div className="d-flex flex-col flex-nowrap">
								<i
									className="bi bi-person-walking fs-1"
									style={{
										marginRight: "20px",
									}}
								/>
								<div>
									<div
										className={`fs-3 syp-max-content`}
									>
										{`${t.guide.firstname} ${t.guide.lastname}`}
									</div>
									<div className="text-body-secondary">{formatTime(t.startTime)}-{formatTime(t.endTime)}</div>
								</div>
								<Button className="ms-5 align-self-center" onClick={() => setVerifyingTour(idx)}>
									Verify
								</Button>
							</div>
						</div>
					)):<>
					<br></br>
					<h5>No tours to verify, time to relax a bit...🛌</h5>
					</>
				}
			</>
		)
	}

	return (
		<RoleTemplate requiredRoles={[ROLES.ADMIN, ROLES.TEACHER, ROLES.TRUSTED_STUDENT]}>
			{
				verifyingTour == -1 ?
				<NotVerifiedToursView/>:
				<VerifyTour tour={tours[verifyingTour]} openDay={activeOpenday} onSettled={() => {setVerifyingTour(-1)}}/>
			}
		</RoleTemplate>
	)
}