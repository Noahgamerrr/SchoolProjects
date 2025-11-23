import StudentHomepage from "./StudentHomepage";
import RoleTemplate from "../Util/RoleTemplate";
import HomepageTeacher from "./HomepageTeacher";

export default function Homepage() {
    return (
        <>
            <RoleTemplate requiredRoles={["admin", "teacher"]}>
                <HomepageTeacher />
            </RoleTemplate>

            <RoleTemplate requiredRoles={["pupil"]}>
                <StudentHomepage />
            </RoleTemplate>
        </>
    );
}
