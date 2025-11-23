import { useState } from 'react';
import PropTypes from "prop-types";
import { FormCheck } from 'react-bootstrap';
import ConfirmationModal from '../Modal/ConfirmationModal';

export default function ModalCheckbox({ onCheck, checked, title, modalText}) {
    const [showModal, setShowModal] = useState(false);
    return (
        <>
            <FormCheck
                type="radio"
                checked={checked}
                onChange={() => setShowModal(true)}
            />
            <ConfirmationModal
                show={showModal}
                title={title}
                message={modalText}
                onConfirm={onCheck}
                onCancel={() => setShowModal(false)}
                confirmColor="warning"
            />
        </>
    );
}

ModalCheckbox.propTypes = {
    onCheck: PropTypes.func,
    checked: PropTypes.bool,
    title: PropTypes.string,
    modalText: PropTypes.string
}
