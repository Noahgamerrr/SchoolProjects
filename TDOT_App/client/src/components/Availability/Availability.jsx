import AvailabilityTeacher from "./AvailabilityTeacher";
import { useMsal } from "@azure/msal-react";
import Forbidden from "../Errors/Forbidden";
import Unauthorized from "../Errors/Unauthorized";
import AvailabilityTeamlead from "./AvailabilityTeamlead";

function Availability() {
    const { instance } = useMsal();
    const activeAccount = instance.getActiveAccount();
    const roles = activeAccount?.idTokenClaims?.roles;

    let ShownElement = Unauthorized;
    if (roles?.includes("teacher") || roles?.includes("admin"))
        ShownElement = AvailabilityTeacher;
    else if (roles?.includes("teamlead")) ShownElement = AvailabilityTeamlead;
    else if (roles) ShownElement = Forbidden;

    return <ShownElement />;
}

export default Availability;
