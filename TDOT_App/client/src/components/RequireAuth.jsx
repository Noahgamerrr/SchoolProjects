import {
    AuthenticatedTemplate,
    UnauthenticatedTemplate,
    useMsal,
} from "@azure/msal-react";
import { Button } from "react-bootstrap";
import PropTypes from "prop-types";
import { useQueryClient } from "@tanstack/react-query";
import UnauthorizedTemplate from "./Util/UnauthorizedTemplate";
import { useState } from "react";

const RequireAuth = ({ children }) => {
    const { instance } = useMsal();
    const [loginLoading, setLoginLoading] = useState(false);
    const queryClient = useQueryClient();
    return (
        <>
            <AuthenticatedTemplate>
                <UnauthorizedTemplate />
                {children}
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
                <div className="d-flex flex-column justify-content-center align-items-center h-100">
                    <h1 className="text-muted">
                        Please sign in to access the TdoT-app.
                    </h1>
                    <div
                        style={{
                            maxWidth: "350px",
                            width: "100%",
                        }}
                    >
                        <Button
                            className="btn btn-success w-100 mt-4 fs-4"
                            onClick={() => {
                                setLoginLoading(true);
                                instance.loginPopup().then(() => {
                                    queryClient.invalidateQueries(["active"]);
                                    setLoginLoading(false);
                                });
                            }}
                            disabled={loginLoading}
                        >
                            {loginLoading ? "Loading..." : "Sign in"}
                        </Button>
                    </div>
                </div>
            </UnauthenticatedTemplate>
        </>
    );
};

RequireAuth.propTypes = {
    children: PropTypes.node,
};

export default RequireAuth;
