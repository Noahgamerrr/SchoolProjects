import PropTypes from "prop-types";
import Select, { components } from "react-select";

const options = [
    { value: "other", label: "Other", bgcolor: "#7880A2", fgcolor: "#3F414A" },
    {
        value: "visual",
        label: "Visual",
        bgcolor: "#8D429A",
        fgcolor: "#402F42",
    },
    {
        value: "audio-visual",
        label: "Audio-Visual",
        bgcolor: "#4E4B8E",
        fgcolor: "#28273C",
    },
    {
        value: "interactive",
        label: "Interactive",
        bgcolor: "#41754F",
        fgcolor: "#253529",
    },
    {
        value: "problem-solving",
        label: "Problem Solving",
        bgcolor: "#767D43",
        fgcolor: "#353824",
    },
];

function CustomOption(props) {
    return (
        <components.Option {...props}>
            <span
                style={{
                    content: '" "',
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    borderRadius: 10,
                    marginRight: 8,
                    backgroundColor: props.data.bgcolor,
                }}
            ></span>{" "}
            <span
                style={{
                    content: '" "',
                    display: "inline-block",
                    color: props.data.fgcolor,
                }}
            >
                {" "}
                {props.label}
            </span>
        </components.Option>
    );
}

function InteractionDropdown({ selectedValue, onChangedHandler }) {
    const handleChange = (selectedOption) => {
        console.log("SELECTED: " + JSON.stringify(selectedOption));
        onChangedHandler("interactType", selectedOption.value);
    };

    console.log("SelectedValue=" + selectedValue);
    return (
        <Select
            options={options}
            onChange={handleChange}
            value={options.filter((option) => option.value === selectedValue)}
            components={{ Option: CustomOption }}
        />
    );
}

CustomOption.propTypes = {
    label: PropTypes.string,
    data: PropTypes.object,
    ...components.Option.propTypes,
};

InteractionDropdown.propTypes = {
    selectedValue: PropTypes.string.isRequired,
    onChangedHandler: PropTypes.func.isRequired,
};

export default InteractionDropdown;
