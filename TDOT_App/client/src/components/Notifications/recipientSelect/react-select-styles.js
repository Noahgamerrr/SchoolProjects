const styles = {
    option: (styles) => {
        return {
            ...styles,
            color: "var(--bs-body-color);",
            backgroundColor: "var(--bs-body-bg);",
            ":hover": {
                backgroundColor: "var(--bs-primary);",
                color: "var(--bs-primary-contrast);",
            },
        };
    },
    control: (styles) => ({
        ...styles,
        backgroundColor: "var(--bs-body-bg);",
        color: "var(--bs-body-color);",
        borderColor: "var(--bs-body-color);",
        ":hover": {
            borderColor: "var(--bs-primary);",
        },
    }),
    multiValue: (styles) => ({
        ...styles,
        backgroundColor: "var(--bs-primary);",
    }),
    multiValueLabel: (styles) => ({
        ...styles,
        color: "var(--bs-primary-contrast);",
    }),
    multiValueRemove: (styles) => ({
        ...styles,
        color: "var(--bs-primary-contrast);",
        ":hover": {
            backgroundColor: "var(--bs-primary);",
            color: "var(--bs-primary-contrast);",
        },
    }),
    input: (styles) => ({
        ...styles,
        color: "var(--bs-body-color);",
    }),
    menu: (styles) => ({
        ...styles,
        backgroundColor: "var(--bs-body-bg);",
        color: "var(--bs-body-color);",
    }),
};

export default styles;
