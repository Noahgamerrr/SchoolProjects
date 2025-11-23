import { Button } from "react-bootstrap";
import { useState } from "react";
import ConfirmationModal from "../Modal/ConfirmationModal";
import PropTypes from "prop-types";

export default function EndTour({ currentTour, onNotVerifiedEnd, endTour }) {
    const [modalEvent, setModalEvent] = useState({
        function: null,
        title: null,
        message: null,
        confirmColor: null,
    });

    return (
        <div>
            <ConfirmationModal
                title={modalEvent.title}
                message={modalEvent.message}
                confirmColor={modalEvent.confirmColor}
                show={modalEvent.function}
                onCancel={() =>
                    setModalEvent({
                        function: null,
                        title: null,
                        message: null,
                        confirmColor: null,
                    })
                }
                onConfirm={() => {
                    modalEvent.function();
                    setModalEvent({
                        function: null,
                        title: null,
                        message: null,
                        confirmColor: null,
                    });
                }}
                actionText={"Confirm"}
                disableLockedModal={true}
            />
            <Button
                className="btn-danger"
                style={{
                    width: 100 + "%",
                }}
                onClick={() =>
                    setModalEvent({
                        function: currentTour.verified ? endTour : onNotVerifiedEnd,
                        title: "Are you sure you want to end the Tour?",
                        message: currentTour.verified ? "" : 
                            "This tour has not been verified yet. Please verify the tour first, or, " +
                            "if you need to end this tour, register the visitors yourself. " +
                            "Note that the tour may not be accepted by the validators if the tour seems dishonest!",
                        confirmColor: "danger",
                    })
                }
            >
                End tour
            </Button>
        </div>
    );
}

EndTour.propTypes = {
    currentTour: PropTypes.object,
    onNotVerifiedEnd: PropTypes.func,
    endTour: PropTypes.func
};
