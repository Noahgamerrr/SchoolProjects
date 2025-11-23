import { useState, useEffect } from "react";
import RBToastContainer from "react-bootstrap/ToastContainer";
import Toast from "./Toast";

let glbSetToasts;
let glbToasts;

export default function ToastContainer() {
    const [toasts, setToasts] = useState([]);
    const autoHideDelay = 3000;

    useEffect(() => {
        for (const toast of toasts) {
            setTimeout(
                () => setToasts((prev) => prev.filter((t) => t.id != toast.id)),
                autoHideDelay
            );
        }
    }, [toasts]);

    glbSetToasts = setToasts;
    glbToasts = toasts;

    function handleClose(id) {
        setToasts(toasts.filter((t) => t.id != id));
    }

    return (
        <RBToastContainer
            position="top-end"
            className="mt-5 p-3"
            style={{ zIndex: 1 }}
        >
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    data={toast}
                    onClose={handleClose}
                ></Toast>
            ))}
        </RBToastContainer>
    );
}

/**
 *
 * @param {string} heading1
 * @param {string} heading2
 * @param {string} body
 * @param {'Primary' | 'Secondary' | 'Success' | 'Danger' | 'Warning' | 'Info' | 'Light' | 'Dark'} type
 */
// eslint-disable-next-line react-refresh/only-export-components
export function showToast(
    heading1 = "Info",
    heading2 = "just now",
    body = "",
    type = "Info"
) {
    if (!glbToasts || !glbSetToasts) {
        console.error("can not create toast - no toastcontainer available");
        return;
    }

    const demoToast = { id: 1, heading1, heading2, body, type };
    const id = (glbToasts[0]?.id ?? 0) + 1;
    demoToast.id = id;
    console.log(demoToast);
    glbSetToasts([demoToast, ...glbToasts]);
}
