import PropTypes from "prop-types";
import FeedbackOutput from "./FeedbackOutput";

const FeedbackAverage = ({ avg }) => {
    let content = <></>;

    // console.log("FeedbackAverage: avg=" + avg);

    if (!avg || avg == 0) content = <span>No feedback yet</span>;
    else content = <FeedbackOutput size={30} rating={avg || 0} />;

    return (
        <div
            className="d-flex flex-row justify-content-center align-items-center"
            style={{
                height: "45px",
            }}
        >
            {content}
        </div>
    );
};

FeedbackAverage.propTypes = {
    avg: PropTypes.number.isRequired,
};

export default FeedbackAverage;
