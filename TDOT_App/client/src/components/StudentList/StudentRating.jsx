import { useQuery } from "@tanstack/react-query";
import { useAuthFetch } from "../../lib/MSAL";
import FeedbackOutput from "../Feedback/FeedbackOutput";
import Loading from "../Loading";

export default function StudentRating({ studentId }) {
    const fetch = useAuthFetch();

    const { data: studentRating } = useQuery({
        queryKey: ["student-rating", studentId],
        queryFn: async () => {
            const response = await fetch(
                `/api/students/${studentId}/feedback/average`
            );
            const data = await response.json();
            return data;
        },
    });

    if (!studentRating) return <p>Loading feedback...</p>;

    if (!studentRating.average) return <p>No feedback!</p>;

    return <FeedbackOutput rating={studentRating.average} size={40} />;
}
