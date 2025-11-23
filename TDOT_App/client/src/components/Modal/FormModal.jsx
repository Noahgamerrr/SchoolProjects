import PropTypes from "prop-types";

/**
 *
 * @type {React.FC<{
 *      show: boolean;
 *      title: string;
 *      onClose: () => void;
 *      children: React.ReactNode;
 * }>}
 */
const FormModal = ({ show, title, createBtnText="Create", onSave, onClose, children }) => {
    if (show)
        return (
            <div
                style={{
                    background: "rgba(0, 0, 0, 0.5)",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 100,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <div
                    className="bg-body col-8 rounded d-flex flex-column p-4 gap-3"
                    style={{ maxWidth: "800px" }}
                >
                    <div className="d-flex flex-row justify-content-between align-items-center">
                        <h3 className="pt-1">{title}</h3>
                    </div>
                    <div>{children}</div>
                    <div className="d-flex justify-content-between gap-3 pt-1">
                        <button
                            className="btn btn-danger"
                            onClick={() => {
                                if (onClose) onClose();
                            }}
                        >
                            Close
                        </button>
                        <button
                            className="btn btn-success"
                            onClick={() => {
                                if (onSave) onSave();
                                if (onClose) onClose();
                            }}
                        >
                            {createBtnText}
                        </button>
                    </div>
                </div>
            </div>
        );
    return <></>;
};

FormModal.propTypes = {
    show: PropTypes.bool,
    title: PropTypes.string,
    onSave: PropTypes.func,
    onClose: PropTypes.func,
    children: PropTypes.node,
};

export default FormModal;
