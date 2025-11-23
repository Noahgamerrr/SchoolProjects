import PropTypes from "prop-types";
import { useMsal } from "@azure/msal-react";

export default function RoleTemplate({
    requiredRoles,
    children,
    fallback = <></>,
}) {
    const { instance } = useMsal();
    const activeAccount = instance.getActiveAccount();
    const roles = activeAccount?.idTokenClaims?.roles;

    // DEBUG ONLY
    // const roles = ["guide", "pupil"];

    const isAuthorized =
        roles ? roles.some((role) => requiredRoles.includes(role)) : false;

    return <>{isAuthorized ? children : fallback}</>;
}

RoleTemplate.propTypes = {
    requiredRoles: PropTypes.array.isRequired,
    children: PropTypes.node.isRequired,
    fallback: PropTypes.node,
};
