import PropTypes from "prop-types";
import { showToast } from "../Toasts/ToastContainer";
import { Button } from "react-bootstrap";
import { useAuthFetch } from "../../lib/MSAL";

function NotificationTestButton({ provider, disabled }) {
    const fetch = useAuthFetch();
    return (
        <Button
            variant="primary"
            type="button"
            disabled={disabled}
            onClick={async () => {
                if (disabled) return;
                const response = await fetch(
                    `/api/notifications/providers/${provider}/test`,
                    {
                        method: "POST",
                    }
                );
                if (response.ok) {
                    showToast(
                        "Notification sent",
                        "",
                        `Test Notification was successfully dispatched.`,
                        "Success"
                    );
                } else {
                    showToast(
                        "Error",
                        "",
                        `Test Notification failed to send.`,
                        "Danger"
                    );
                }
            }}
        >
            Test
        </Button>
    );
}

NotificationTestButton.propTypes = {
    provider: PropTypes.string,
    disabled: PropTypes.bool,
};

export default NotificationTestButton;
