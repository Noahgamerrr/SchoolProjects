import {
    AuthenticatedTemplate,
    UnauthenticatedTemplate,
} from "@azure/msal-react";
import PropTypes from "prop-types";

const StudentMissing = ({ children }) => {
    return (
        <>
            <div className="d-flex justify-content-center align-items-center h-100">
                    <i className="bi bi-emoji-frown fs-1"></i>
                    <h1 className="text-muted">
                         No student associated with account. 
                    </h1>
                    <i className="bi bi-emoji-frown fs-1"></i>
            </div>
        </>
    );
};

StudentMissing.propTypes = {
    children: PropTypes.node,
};

export default StudentMissing;
