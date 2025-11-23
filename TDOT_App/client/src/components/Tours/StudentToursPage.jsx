import { useParams } from "react-router-dom";
import StudentTours from "./StudentTours";

function StudentToursPage() {
    const { id } = useParams();
    return <StudentTours studentId={id} />;
}

export default StudentToursPage;
