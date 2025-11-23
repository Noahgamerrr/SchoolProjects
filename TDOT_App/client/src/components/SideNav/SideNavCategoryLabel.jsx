import PropTypes from "prop-types";

export default function SideNavCategoryLabel({ text, collapsed }) {
    return collapsed ?
            <span className="d-none d-lg-block"
                style={{
                    width: "100%",
                    borderBottom: "1px solid gray",
                }}
            ></span>
        :   <span
                style={{
                    fontSize: "1.1em",
                    display: "block",
                    marginLeft: "0.5em",
                    marginRight: "0.5em",
                    marginBottom: "-0.5em",
                }}
            >
                {text}
            </span>;
}

SideNavCategoryLabel.propTypes = {
    text: PropTypes.string,
    collapsed: PropTypes.bool,
};
