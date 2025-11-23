import { useMsal } from "@azure/msal-react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

function formatTime(rawTime) {
    const time = new Date(rawTime);
    const hours = time.getHours().toString().padStart(2, "0");
    const minutes = time.getMinutes().toString().padStart(2, "0");

    return `${hours}:${minutes}`;
}

function AvailabilityHomepage({ id, activity }) {
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
                    className={`${svgs[activity.activity]} fs-1`}
                    style={{
                        marginRight: "20px",
                    }}
                />
                <div>
                    <div
                        className={`fs-3 syp-max-content`}
                    >
                        {activity.activity}
                    </div>
                    <div className="text-body-secondary">Since {formatTime(activity.time)}</div>
                </div>
            </div>
        </div>
    );
}

AvailabilityHomepage.propTypes = {
    id: PropTypes.string.isRequired,
    activity: PropTypes.object.isRequired,
};

export default AvailabilityHomepage;
