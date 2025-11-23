import { useParams } from "react-router-dom";
import TourDetails from "./TourDetails";

function TourDetailsPage() {
    const { tourId } = useParams();
    return <TourDetails url={`/api/tours/${tourId}`} privileged={true} />;
}

export default TourDetailsPage;
