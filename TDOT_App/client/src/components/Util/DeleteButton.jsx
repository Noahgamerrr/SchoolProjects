import { useState } from 'react'
import { Button } from 'react-bootstrap';
import ConfirmationModal from '../Modal/ConfirmationModal';
import PropTypes from "prop-types";

export default function DeleteButton({ onDelete, message }) {
    const [showModal, setShowModal] = useState(false);
    return (
        <>
            <Button
                variant="danger"
                style={{
                    padding: "0.1rem 0.8rem",
                    fontSize: "1.4rem",
                }}
                onClick={() => setShowModal(true)}
            >
                <i className="bi bi-trash" />
            </Button>
            <ConfirmationModal
                show={showModal}
                title="Delete"
                message={message}
                onConfirm={onDelete}
                onCancel={() => setShowModal(false)}
            />
        </>
    );
}
DeleteButton.propTypes = {
    onDelete: PropTypes.func,
    message: PropTypes.string
};

