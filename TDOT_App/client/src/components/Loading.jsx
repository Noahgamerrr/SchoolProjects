import Spinner from "react-bootstrap/Spinner";
import PropTypes from "prop-types";

const Loading = ({ size = "4rem" }) => {
    return (
        <div className="d-flex justify-content-center align-items-center h-100">
            <Spinner
                style={{
                    width: size,
                    height: size,
                }}
                variant="secondary"
            />
        </div>
    );
};

Loading.propTypes = {
    size: PropTypes.string,
};

export default Loading;
