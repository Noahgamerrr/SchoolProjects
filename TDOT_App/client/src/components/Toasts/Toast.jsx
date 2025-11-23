import RBToast from "react-bootstrap/Toast";
import PropTypes from "prop-types";

export default function Toast({ data, onClose }) {
    const { heading1, heading2, body, type: variant } = data;

    return (
        <RBToast onClose={() => onClose(data.id)} bg={variant.toLowerCase()}>
            <RBToast.Header>
                <i className="bi bi-bell me-2"></i>
                <strong className="me-auto">{heading1}</strong>
                <small className="text-muted">{heading2}</small>
            </RBToast.Header>
            <RBToast.Body className={variant === "Dark" && "text-white" || variant === "Warning" && "text-dark"}>
                {body}
            </RBToast.Body>
        </RBToast>
    );
}

Toast.propTypes = {
    data: PropTypes.object,
    onClose: PropTypes.func,
    heading1: PropTypes.string,
    heading2: PropTypes.string,
    body: PropTypes.string,
};
