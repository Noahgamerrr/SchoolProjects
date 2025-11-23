import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import Loading from "../Loading";
import { useAuthFetch } from "../../lib/MSAL";
import { showToast } from "../Toasts/ToastContainer";
import RegisterVisitors from "./RegisterVisitors";

export default function ValidateTour() {
    const fetch = useAuthFetch();
    const { tourId } = useParams();
    const queryClient = useQueryClient();

    const { data } = useQuery({
        queryKey: ["tour"],
        queryFn: async () => {
            const response = await fetch(`/api/tours/${tourId}`);
            let data = [];
            let tour;
            if (response.status == 200) {
                tour = await response.json();
                data.push(tour);
            } else return [];
            const studentResponse = await fetch(`/api/students/${tour.guide}`);
            if (studentResponse.status == 200) {
                data.push(await studentResponse.json());
            } else return [];
            return data;
        }
    });

    const verifyMutation = useMutation({
        mutationKey: "verify-tour",
        mutationFn: async (visitors) => {
            return await fetch(`/api/tours/${tourId}/registerVisitors`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(visitors)
            }).then((res) => res.json());
        },
        onSettled: () => {
            queryClient.invalidateQueries(["tour"]);
            showToast(
                "Success!",
                "",
                `Tour successfully verified`,
                "success"
            );
        },
    });

    if (data == null) return <Loading/>

    if (!data.length) return (
        <>
            <h2>Whoops!</h2>
            <p>
                We cannot provide you with this page! This may be either because the requested tour does not exist,
                or because you do not have the required permissions to view this page!
            </p>
        </>
    )

    const [tour, student] = data;

    return (
        <>
            <h2 className="mb-3">Validate Tour</h2>
            <h4 className="mb-4">Guide: {`${student.firstname} ${student.lastname}`}</h4>
            <h3 className="mb-3">Visitors:</h3>
            <RegisterVisitors sendFormLabel={"Validate Tour"} onSendForm={visitors => verifyMutation.mutate(visitors)}/>
        </>
    )
}