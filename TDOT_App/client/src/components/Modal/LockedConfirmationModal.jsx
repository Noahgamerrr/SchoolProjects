import PropTypes from "prop-types";
import { FormCheck } from "react-bootstrap";
import {useState} from 'react';

/**
 *
 * @type {React.FC<{ show: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; confirmColor: string; }>}
 */
const LockedConfirmationModal = ({
    show,
    title = 'This open day has already been locked!',
    message = 'Changes should only be made if ABSOLUTELY necessary!',
    onConfirm,
    onCancel,
    confirmColor = "danger",
    actionText = "Confirm",
    delayTimeSec = 5
}) => {
    const [cb1, setCb1] = useState(false);
    const [cb2, setCb2] = useState(false);
    const [delay,setDelay] = useState(delayTimeSec!=0?-1:0);
    if(cb1&&cb2&&delay==-1)setDelay(delayTimeSec);
    if(delay>0) setTimeout(()=>setDelay(delay-1),1000);

    function reset(){
        setCb1(false);
        setCb2(false);
        setDelay(-1);
    }
    if (show){
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
                onKeyDown={(e) => {
                    if (e.key === "Escape" && onCancel){
                        onCancel();
                        reset();
                    } 
                }}
            >
                <div
                    className="bg-body col-8 rounded d-flex flex-column p-4 gap-3"
                    style={{ maxWidth: "800px" }}
                >
                    <div className="d-flex flex-row justify-content-between align-items-center">
                        <h3 className="pt-1 text-warning">{title}</h3>
                    </div>
                    <div><h5>{message}</h5></div>
                    <div>{"I understand that by confirming this change I might:"}</div>
                    <FormCheck readOnly checked={cb1} onClick={()=>setCb1(!cb1)} label={"incur costs related to printing a new assignment list."}></FormCheck>
                    <FormCheck readOnly checked={cb2} onClick={()=>setCb2(!cb2)} label={"get scolded by prof. Karasek and/or prof. Dabringer."}></FormCheck>
                    <div><h5>{(delay==-1 || delay==0)?'':`Can be confirmed in ${delay} seconds...`}</h5></div>
                    <div className="d-flex justify-content-between gap-3 pt-1">
                        <button
                            disabled={!(cb1&&cb2&&delay==0)}
                            className={"btn btn-" + confirmColor}
                            onClick={() => {
                                if (onConfirm) onConfirm();
                                if (onCancel) onCancel();
                                reset();
                            }}
                        >
                            {actionText}
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                if (onCancel) onCancel();
                                reset();
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

LockedConfirmationModal.propTypes = {
    show: PropTypes.bool,
    title: PropTypes.string,
    message: PropTypes.string,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
    confirmColor: PropTypes.string,
    actionText: PropTypes.string,
    delayTimeSec: PropTypes.number
};

export default LockedConfirmationModal;
