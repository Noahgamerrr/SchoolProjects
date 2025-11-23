import { useState, useEffect } from 'react';
import PropTypes from "prop-types";
import Form from 'react-bootstrap/Form';

export const TableCell = ({ getValue, row, column, table }) => {
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

    const onChange = (e) => {
    //tableMeta.onCellChange(row.index, column.id, e.target.value, 'onChange');
        setValue(e.target.value);
    }

    const onSelectChange = (e) => {
        setValue(e.target.value);
        if (formerValue != e.target.value)
            tableMeta?.updateData(row.index, column.id, e.target.value);
    };

    if (columnMeta?.type === "date") {
        initialValue = initialValue.split('T')[0];
    }

    if (columnMeta?.type === "select") {
        return <Form.Select
            value={value}
            onChange={onSelectChange}
        >
            {columnMeta?.options?.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </Form.Select>;
    } else {
        return <Form.Control
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            type={column.columnDef.meta?.type || "text"}
            min={column.columnDef.meta?.min}
            max={column.columnDef.meta?.max} />;
    }
};
TableCell.propTypes = {
    getValue: PropTypes.func,
    row: PropTypes.object,
    column: PropTypes.object,
    table: PropTypes.object,
};
