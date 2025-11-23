import {useAuthFetch} from "../../lib/MSAL.js";
import RoleTemplate from "../Util/RoleTemplate.jsx";
import NotificationResponsePage from "./NotificationResponsePage.jsx";


export default () => {
    return (
        <>
            <RoleTemplate requiredRoles={["admin", "teacher", "stationworker"]}>
                <NotificationResponsePage/>
            </RoleTemplate>
        </>
    )
}