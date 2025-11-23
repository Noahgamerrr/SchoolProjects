import PropTypes from "prop-types";
import { useCallback, useState } from "react";
import LockedConfirmationModal from "./LockedConfirmationModal";
import { useAuthFetch } from "../../lib/MSAL";

/**
 *
 * @type {React.FC<{ show: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; confirmColor: string; }>}
 */
const ConfirmationModal = ({
    show,
    title,
    message,
    onConfirm,
    onCancel,
    confirmColor = "danger",
    actionText = "Confirm",
    lockedModalDelay = 5,
    disableLockedModal = false,
}) => {
    const [odLocked, setOdLocked] = useState(false);
    const fetch = useAuthFetch();

    const loadOd = useCallback(async () => {
        let response = await fetch(`/api/opendays/active`);
        if (!response.ok)
            throw { status: response.status, msg: response.statusText };
        let od = await response.json();
        setOdLocked(od.locked);
    }, [fetch]);

    if (show) {
        loadOd();
        if (odLocked && !disableLockedModal) {
            return (
                <LockedConfirmationModal
                    show={show}
                    onConfirm={onConfirm}
                    onCancel={onCancel}
                    delayTimeSec={lockedModalDelay}
                />
            );
        }
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
                    if (onCancel) onCancel();
                }}
                onKeyDown={(e) => {
                    if (e.key === "Escape" && onCancel) onCancel();
                }}
            >
                <div
                    className="bg-body col-8 rounded d-flex flex-column p-4 gap-3"
                    style={{ maxWidth: "800px" }}
                >
                    <div className="d-flex flex-row justify-content-between align-items-center">
                        <h3 className="pt-1">{title}</h3>
                    </div>
                    <div>{message}</div>
                    <div className="d-flex justify-content-between gap-3 pt-1">
                        <button
                            className={"btn btn-" + confirmColor}
                            onClick={() => {
                                if (onConfirm) onConfirm();
                            }}
                        >
                            {actionText}
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                if (onCancel) onCancel();
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    return <></>;
};

ConfirmationModal.propTypes = {
    show: PropTypes.bool,
    title: PropTypes.string,
    message: PropTypes.string,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
    confirmColor: PropTypes.string,
    lockedModalDelay: PropTypes.number,
    actionText: PropTypes.string,
    disableLockedModal: PropTypes.bool,
};

export default ConfirmationModal;
