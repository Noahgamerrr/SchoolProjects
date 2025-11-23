import {
    AuthenticatedTemplate,
    UnauthenticatedTemplate,
} from "@azure/msal-react";
import { switchTheme } from "../../lib/theme";
import { useQueryClient } from "@tanstack/react-query";
import { Button, NavDropdown, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import PropTypes from "prop-types";

function TopNavButtonBar({ beforeNavigate = () => {} }) {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { instance } = useMsal();
    const activeAccount = instance.getActiveAccount();

    const renderTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props}>
            <div className="fw-bold">{activeAccount?.name}</div>
            <div className="fw-light">{activeAccount?.username}</div>
            <div className="fw-light">
                Roles: {activeAccount?.idTokenClaims.roles.join(", ")}
            </div>
        </Tooltip>
    );

    return (
        <span className="d-flex flex-row flex-nowrap justify-content-center gap-2 gap-sm-0">
            <AuthenticatedTemplate>
                <Button
                    className="btn btn-secondary m-1"
                    title="Preferences"
                    onClick={() => {
                        beforeNavigate();
                        navigate("/preferences");
                    }}
                >
                    <i className="bi bi-gear-fill fs-5" />
                </Button>
            </AuthenticatedTemplate>
            <NavDropdown
                title={<span className="text-white">Theme</span>}
                className="bg-secondary m-1 px-3 fs-5 rounded d-flex flex-row flex-nowrap align-items-center px-2 custom-dropdown-toggle"
            >
                <NavDropdown.Item onClick={() => switchTheme("light")}>
                    Light
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => switchTheme("dark")}>
                    Dark
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => switchTheme("auto")}>
                    Auto
                </NavDropdown.Item>
            </NavDropdown>
            <UnauthenticatedTemplate>
                <Button
                    className="btn btn-success m-1 me-2"
                    onClick={() =>
                        instance
                            .loginPopup()
                            .then(() =>
                                queryClient.invalidateQueries(["active"])
                            )
                    }
                >
                    Login
                </Button>
            </UnauthenticatedTemplate>
            <AuthenticatedTemplate>
                <OverlayTrigger
                    placement="bottom"
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderTooltip}
                >
                    <Button
                        className="btn btn-secondary m-1"
                        onClick={() => instance.logoutPopup()}
                    >
                        <i className="bi bi-box-arrow-right fs-5"></i>
                    </Button>
                </OverlayTrigger>
            </AuthenticatedTemplate>
        </span>
    );
}

TopNavButtonBar.propTypes = {
    beforeNavigate: PropTypes.func,
};

export default TopNavButtonBar;
