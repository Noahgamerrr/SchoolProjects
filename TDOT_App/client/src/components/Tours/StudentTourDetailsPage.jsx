import { useParams } from "react-router-dom";
import TourDetails from "./TourDetails";

function StudentToursPage() {
    const { id, tourId } = useParams();
    return <TourDetails url={`/api/students/${id}/tours/${tourId}`} />;
}

export default StudentToursPage;
