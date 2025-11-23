import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Button from "react-bootstrap/Button";

export const TableCellTag = ({ getValue, row, column, table }) => {
    let initialValue = getValue();
    const [value, setValue] = useState(initialValue);
    const columnMeta = column.columnDef.meta;
    const tableMeta = table.options.meta;

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

    if (!value)
        return <p></p>

    let tagList = []

    for (let tag of value) {
        tagList.push(<Button className="btn-secondary my-1 text-small">{tag}</Button>)
    }

    return <div className="gap-1 d-flex"> {tagList} </div>
};
TableCellTag.propTypes = {
    getValue: PropTypes.func,
    row: PropTypes.object,
    column: PropTypes.object,
    table: PropTypes.object,
};
