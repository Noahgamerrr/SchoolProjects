import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Button from "react-bootstrap/Button";

export const StationTableCellActivityType = ({
    getValue,
    row,
    column,
    table,
}) => {
    let initialValue = getValue();
    const [value, setValue] = useState(initialValue);
    const columnMeta = column.columnDef.meta;
    const tableMeta = table.options.meta;

    function parseInteractType(type) {
        switch (type) {
            default:
                return <i className="bi bi-question-circle"> Other </i>;
            case "visual":
                return <i className="bi bi-eye"> Visual </i>;
            case "audio-visual":
                return <i className="bi bi-volume-up"> Audio Visual </i>;
            case "interactive":
                return <i className="bi bi-hand-index"> Interactive </i>;
            case "problem-solving":
                return (
                    <i className="bi bi-file-earmark-text"> Problem Solving </i>
                );
        }
    }

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const onBlur = (e) => {
        if (formerValue != e.target.value)
            table.options.meta?.updateData(row.index, column.id, value);
    };

    const onChange = () => {
        //tableMeta.onCellChange(row.index, column.id, e.target.value, 'onChange');
    };

    const onSelectChange = (e) => {
        setValue(e.target.value);
        if (formerValue != e.target.value)
            tableMeta?.updateData(row.index, column.id, e.target.value);
    };

    if (!value) return <p></p>;

    return (
        <Button className="btn-secondary my-1 gap-1 d-flex">
            {parseInteractType(value)}
        </Button>
    );
};
StationTableCellActivityType.propTypes = {
    getValue: PropTypes.func,
    row: PropTypes.object,
    column: PropTypes.object,
    table: PropTypes.object,
};
