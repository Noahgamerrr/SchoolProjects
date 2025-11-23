import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Form from "react-bootstrap/Form";
import { Button } from "react-bootstrap";

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

    const onSelectChange = (e) => {
        setValue(e.target.value);
        if (formerValue != e.target.value)
            tableMeta?.updateGuideTeam(row.index, column.id, e.target.value);
    };

    const onCheckboxChange = (e) => {
        if (e.target.checked)
            tableMeta?.updateTeamLeader(row.index, column.id, e.target.checked);
    }

    if (columnMeta?.type === "date") {
        initialValue = initialValue.split("T")[0];
    }

    if (columnMeta?.type === "select") {
        return (
            <Form.Select value={initialValue} onChange={onSelectChange}>
                <option key="no-team" value="no-team">
                    No team
                </option>
                {columnMeta?.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.value}
                    </option>
                ))}
            </Form.Select>
        );
    } else if (columnMeta?.type === "checkbox") {
        return (
            <>
                { value != undefined && <Form.Check checked={value} onChange={onCheckboxChange}/>}
            </>
        )
    }
    else {
        return (
            <Form.Label
                onBlur={onBlur}
            >{value}</Form.Label>
        );
    }
};
TableCell.propTypes = {
    getValue: PropTypes.func,
    row: PropTypes.object,
    column: PropTypes.object,
    table: PropTypes.object,
};
