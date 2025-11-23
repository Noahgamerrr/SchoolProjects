import { Button } from "react-bootstrap";
import { useState } from "react";
import ConfirmationModal from "../Modal/ConfirmationModal";
import PropTypes from "prop-types";

export default function EndTourIkea({
    currentTour,
    onNotVerifiedEnd,
    endTour,
}) {
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
                className="rounded-full btn-dark"
                onClick={() =>
                    setModalEvent({
                        function:
                            currentTour.verified ? endTour : onNotVerifiedEnd,
                        title: "Are you sure you want to end the Tour?",
                        message:
                            currentTour.verified ? "" : (
                                "This tour has not been verified yet. Please verify the tour first, or, " +
                                "if you need to end this tour, register the visitors yourself. " +
                                "Note that the tour may not be accepted by the validators if the tour seems dishonest!"
                            ),
                        confirmColor: "danger",
                    })
                }
                style={{
                    position: "absolute",
                    bottom: "4rem",
                    left: "50%",
                    width: "7rem",
                    height: "7rem",
                    backgroundColor: "#cc3333bb",
                    borderRadius: "50%",
                    transform: "translateX(-50%)",
                    boxShadow: "0 0 15px rgba(0, 0, 0, 0.3)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <i
                    className="bi bi-x-circle mx-auto d-block"
                    style={{ fontSize: "4rem", width: "fit-content" }}
                ></i>
            </Button>
        </div>
    );
}

EndTourIkea.propTypes = {
    currentTour: PropTypes.object,
    onNotVerifiedEnd: PropTypes.func,
    endTour: PropTypes.func,
};
