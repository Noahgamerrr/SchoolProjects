import PropTypes from "prop-types";
import "./feedback-input.css";

import one from "../../assets/feedback-emojis/1.svg";
import two from "../../assets/feedback-emojis/2.svg";
import three from "../../assets/feedback-emojis/3.svg";
import four from "../../assets/feedback-emojis/4.svg";
import five from "../../assets/feedback-emojis/5.svg";

/**
 *
 * @type {React.FC<{
 *     rating: number;
 *     onChange: (rating: number) => void;
 * }>}
 */
const FeedbackInput = ({ rating, onChange }) => {
    return (
        <div className="d-flex flex-row flex-nowrap">
            {[one, two, three, four, five].map((value, idx) => (
                <div
                    key={idx}
                    style={{
                        width: "20%",
                    }}
                >
                    <img
                        className={
                            "w-100 h-100 " +
                            (onChange
                                ? "feedback-emoji"
                                : "feedback-emoji-readonly")
                        }
                        src={value}
                        alt={`${idx + 1}`}
                        onClick={() => onChange(idx + 1)}
                        style={{
                            filter:
                                rating === idx + 1 ? "none" : "grayscale(100%)",
                            transform:
                                rating === idx + 1 ? "none" : "scale(0.8)",
                        }}
                    />
                </div>
            ))}
        </div>
    );
};

FeedbackInput.propTypes = {
    rating: PropTypes.number,
    onChange: PropTypes.func,
};

export default FeedbackInput;
