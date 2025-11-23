import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Button from "react-bootstrap/Button";

export const TableCellPersonCount = ({ getValue, row, column, table }) => {
    let initialValue = getValue();
    const [value, setValue] = useState(initialValue);
    const columnMeta = column.columnDef.meta;
    const tableMeta = table.options.meta;

    let formerValue = 0;

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

    if (columnMeta?.type === "date") {
        initialValue = initialValue.split("T")[0];
    }

    let iconList = [];

    if (value > 10) {
        iconList = <i className="bi bi-person-standing">({value} x)</i>;
    } else {
        for (let x = 0; x < value; x++) {
            iconList.push(<i className="bi bi-person-standing"></i>);
        }
    }

    return iconList;
};
TableCellPersonCount.propTypes = {
    getValue: PropTypes.func,
    row: PropTypes.object,
    column: PropTypes.object,
    table: PropTypes.object,
};
