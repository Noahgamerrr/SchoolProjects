import { useMsal } from "@azure/msal-react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

function AvailabilitySingle({ id, lastname, firstname, state, isTeamLeader }) {
    const { instance } = useMsal();
    const activeAccount = instance.getActiveAccount();
    const roles = activeAccount?.idTokenClaims?.roles;
    const navigate = useNavigate();
    const svgs = {
        available: "bi bi-person-raised-hand",
        tour: "bi bi-person-walking",
        break: "bi bi-cup-hot-fill",
        home: "bi bi-house-fill",
    };

    function navigateToActivity() {
        navigate(`/students/${id}/activity`);
    }

    return (
        <div className={`my-3 mx-5 p-2 ${roles.includes("admin") ? "syp-hover-grey" : ""}`} onClick={navigateToActivity}>
            <div className="d-flex flex-col flex-nowrap">
                <i
                    className={`${svgs[state]} fs-1`}
                    style={{
                        marginRight: "20px",
                    }}
                />
                <div>
                    <div
                        className={`fs-5 syp-max-content ${
                            isTeamLeader ? "fw-bold" : ""
                        }`}
                    >
                        {lastname} {firstname}
                    </div>
                    <div className="text-body-secondary">{state}</div>
                </div>
            </div>
        </div>
    );
}

AvailabilitySingle.propTypes = {
    id: PropTypes.string.isRequired,
    lastname: PropTypes.string.isRequired,
    firstname: PropTypes.string.isRequired,
    state: PropTypes.string.isRequired,
    isTeamLeader: PropTypes.bool,
};

export default AvailabilitySingle;
