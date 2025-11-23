
import { useMsal } from "@azure/msal-react";
import Unauthorized from "../Errors/Unauthorized";
import StationsTable from "./StationsTable";
import StationsTableReadonly from "./StationsTableReadonly";

function StationsManager() {
    const { instance } = useMsal();
    const activeAccount = instance.getActiveAccount();
    const roles = activeAccount?.idTokenClaims?.roles;

    let ShownElement = Unauthorized;
    if (roles?.includes("admin")) ShownElement = StationsTable;
    else if (roles) ShownElement = StationsTableReadonly;

    return <ShownElement />;
}

export default StationsManager;
