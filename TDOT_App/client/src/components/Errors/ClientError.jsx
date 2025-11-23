import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/esm/Button";

function ClientError({ title, children }) {
    const navigate = useNavigate();

    return (
        <div className="border border-dark rounded py-3 fit-content m-auto">
            <h2 className="text-center border-bottom border-dark pb-3">
                {title}
            </h2>
            <div className="px-3 pt-2 pb-3 border-bottom border-dark">
                {children}
            </div>
            <div className="fit-content m-auto pt-3">
                <Button className="btn-secondary" onClick={() => navigate(-1)}>
                    <span className="p-2">Go back</span>
                </Button>
            </div>
        </div>
    );
}

ClientError.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};

export default ClientError;
