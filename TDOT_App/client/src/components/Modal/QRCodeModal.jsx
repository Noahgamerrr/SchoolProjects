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
const QRCodeModal = ({
    show,
    title,
    onClose,
    onNewTabRequest,
    onPrint,
    children,
}) => {
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
                onClick={(e) => {
                    e.stopPropagation();
                    if (onClose) onClose();
                }}
                onKeyDown={(e) => {
                    if (e.key === "Escape" && onClose) onClose();
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
                        {onClose && (
                            <button
                                className="btn btn-secondary"
                                onClick={onClose}
                            >
                                Close
                            </button>
                        )}
                        {onNewTabRequest && (
                            <button
                                className="btn btn-info"
                                onClick={onNewTabRequest}
                            >
                                Open in new tab
                            </button>
                        )}
                        {onPrint && (
                            <button className="btn btn-info" onClick={onPrint}>
                                Print
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    return <></>;
};

QRCodeModal.propTypes = {
    show: PropTypes.bool,
    title: PropTypes.string,
    onClose: PropTypes.func,
    onCopy: PropTypes.func,
    onPrint: PropTypes.func,
    children: PropTypes.node,
};

export default QRCodeModal;
