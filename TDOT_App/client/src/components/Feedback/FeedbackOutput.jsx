import PropTypes from "prop-types";

const Star = ({ fillPercentage, size }) => {
    return (
        <div
            style={{
                position: "relative",
                width: `${size}px`,
                height: `${size}px`,
            }}
        >
            {fillPercentage > 0 && (
                <svg
                    version="1.0"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                        position: "absolute",
                        padding: `${Math.ceil(size / 15)}px`,
                        clip: `rect(0px, ${Math.floor(
                            fillPercentage * size
                        )}px, ${size}px, 0px)`,
                        zIndex: 1,
                    }}
                    width={`${size}px`}
                    height={`${size}px`}
                    viewBox="0 0 64 64"
                    enableBackground="new 0 0 64 64"
                    xmlSpace="preserve"
                >
                    <path
                        fill="#76757A"
                        d="M63.893,24.277c-0.238-0.711-0.854-1.229-1.595-1.343l-19.674-3.006L33.809,1.15
   C33.479,0.448,32.773,0,31.998,0s-1.48,0.448-1.811,1.15l-8.815,18.778L1.698,22.935c-0.741,0.113-1.356,0.632-1.595,1.343
   c-0.238,0.71-0.059,1.494,0.465,2.031l14.294,14.657L11.484,61.67c-0.124,0.756,0.195,1.517,0.822,1.957
   c0.344,0.243,0.747,0.366,1.151,0.366c0.332,0,0.666-0.084,0.968-0.25l17.572-9.719l17.572,9.719c0.302,0.166,0.636,0.25,0.968,0.25
   c0.404,0,0.808-0.123,1.151-0.366c0.627-0.44,0.946-1.201,0.822-1.957l-3.378-20.704l14.294-14.657
   C63.951,25.771,64.131,24.987,63.893,24.277z"
                    />
                </svg>
            )}
            {fillPercentage < 1 && (
                <svg
                    version="1.0"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                        position: "absolute",
                        padding: `${Math.ceil(size / 15)}px`,
                        zIndex: 0,
                    }}
                    width={`${size}px`}
                    height={`${size}px`}
                    viewBox="0 0 64 64"
                    enableBackground="new 0 0 64 64"
                    xmlSpace="preserve"
                >
                    <path
                        fill="#1C1B24"
                        d="M63.893,24.277c-0.238-0.711-0.854-1.229-1.595-1.343l-19.674-3.006L33.809,1.15
   C33.479,0.448,32.773,0,31.998,0s-1.48,0.448-1.811,1.15l-8.815,18.778L1.698,22.935c-0.741,0.113-1.356,0.632-1.595,1.343
   c-0.238,0.71-0.059,1.494,0.465,2.031l14.294,14.657L11.484,61.67c-0.124,0.756,0.195,1.517,0.822,1.957
   c0.344,0.243,0.747,0.366,1.151,0.366c0.332,0,0.666-0.084,0.968-0.25l17.572-9.719l17.572,9.719c0.302,0.166,0.636,0.25,0.968,0.25
   c0.404,0,0.808-0.123,1.151-0.366c0.627-0.44,0.946-1.201,0.822-1.957l-3.378-20.704l14.294-14.657
   C63.951,25.771,64.131,24.987,63.893,24.277z"
                    />
                </svg>
            )}
        </div>
    );
};

Star.propTypes = {
    fillPercentage: PropTypes.number,
    size: PropTypes.number,
};

/**
 *
 * @type {React.FC<{
 *     rating: number;
 *     onChange: (rating: number) => void;
 *     size: number;
 * }>}
 */
const FeedbackOutput = ({ rating, size = 30 }) => {
    return (
        <div
            className="d-flex flex-row flex-nowrap align-items-center"
            style={{
                paddingLeft: "0.5rem",
                paddingRight: "0.5rem",
            }}
        >
            <span
                style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: `${size}px`,
                    width: "4rem",
                    paddingRight: "0.5rem",
                }}
            >
                {rating.toFixed(1)}
            </span>
            {[1, 2, 3, 4, 5].map((value, idx) => {
                let fillPercentage = 0;
                if (rating >= value) {
                    fillPercentage = 1;
                } else if (rating + 1 > value) {
                    fillPercentage = rating % 1;
                }
                return (
                    <div key={idx}>
                        <Star size={size} fillPercentage={fillPercentage} />
                    </div>
                );
            })}
        </div>
    );
};

FeedbackOutput.propTypes = {
    rating: PropTypes.number.isRequired,
    size: PropTypes.number,
};

export default FeedbackOutput;
