
import { useMsal } from "@azure/msal-react";
import Unauthorized from "../Errors/Unauthorized";
import StationsTableDetail from "./StationsTableDetail";
import StationsTableDetailReadonly from "./StationsTableDetailReadonly";

function StationsDetail() {
    const { instance } = useMsal();
    const activeAccount = instance.getActiveAccount();
    const roles = activeAccount?.idTokenClaims?.roles;

    let ShownElement = Unauthorized;
    if (roles?.includes("admin")) ShownElement = StationsTableDetail;
    else if (roles) ShownElement = StationsTableDetailReadonly;

    return <ShownElement />;
}

export default StationsDetail;
