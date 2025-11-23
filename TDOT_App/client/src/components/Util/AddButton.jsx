import { useState } from 'react'
import { Button } from 'react-bootstrap';
import ConfirmationModal from '../Modal/ConfirmationModal';
import PropTypes from "prop-types";

export default function AddButton({ onAdd, message }) {
    const [showModal, setShowModal] = useState(false);
    return (
        <>
            <Button
                onClick={() => setShowModal(true)}
            >
                Add
            </Button>
            <ConfirmationModal
                show={showModal}
                title="Add"
                message={message}
                onConfirm={onAdd}
                onCancel={() => setShowModal(false)}
                confirmColor='primary'
            />
        </>
    );
}
AddButton.propTypes = {
    onAdd: PropTypes.func,
    message: PropTypes.string
};

