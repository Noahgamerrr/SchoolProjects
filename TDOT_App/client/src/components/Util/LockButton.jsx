import { useState } from 'react'
import { Button } from 'react-bootstrap';
import ConfirmationModal from '../Modal/ConfirmationModal';
import { showToast } from "../Toasts/ToastContainer";
import PropTypes from "prop-types";

export default function LockButton({ onInput, message, openDayLocked }) {
    const [showModal, setShowModal] = useState(false);
    return (
        <>
            <Button
                variant={(openDayLocked ? "muted" : "secondary")}
                style={{
                    padding: "0.1rem 0.8rem",
                    fontSize: "1.4rem",
                }}
                onClick={!openDayLocked ? () => setShowModal(true) : () => {
                    showToast(
                        "Openday already Locked",
                        "",
                        `Cannot lock this openday`,
                        "warning"
                    );
                }}
            >
                <i className={("bi bi-lock"+(openDayLocked ? " text-muted" : ""))} />
            </Button>
            <ConfirmationModal
                show={showModal}
                title="Lock"
                message={message}
                onConfirm={onInput}
                onCancel={() => setShowModal(false)}
            />
        </>
    );
}
LockButton.propTypes = {
    onDelete: PropTypes.func,
    message: PropTypes.string,
    openDayLocked: PropTypes.bool
};

