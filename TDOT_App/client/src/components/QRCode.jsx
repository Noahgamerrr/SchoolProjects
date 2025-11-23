import PropTypes from "prop-types";
import QR from "qrcode";
import { useMemo, useState } from "react";
import Loading from "./Loading";

const QRCode = ({
    value,
    options,
}) => {
    const [dataUrl, setDataUrl] = useState("");

    useMemo(() => {
        const qrOptions = {
            errorCorrectionLevel: "H",
            type: "image/jpeg",
            quality: 0.92,
            margin: 1,
            width: 256,
            color: {
                dark: "#000000ff",
                light: "#ffffffff",
            },
            ...options
        }
        QR.toDataURL(value, qrOptions)
            .then((url) => {
                setDataUrl(url);
            })
            .catch((err) => {
                console.error(err);
            });
    }, [value, options]);

    if (!dataUrl) return <Loading />;

    return <img src={dataUrl} alt="QR code" />;
};

QRCode.propTypes = {
    value: PropTypes.string.isRequired,
    options: PropTypes.object,
};

export default QRCode;
