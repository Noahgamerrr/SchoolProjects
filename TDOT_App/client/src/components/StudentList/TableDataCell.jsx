import PropTypes from "prop-types";
import Form from 'react-bootstrap/Form';

export const TableDataCell = ({ getValue, row, column, table }) => {
    let initialValue = getValue();
    const columnMeta = column.columnDef.meta;
    const tableMeta = table.options.meta;

    const onChange = (e) => {
        tableMeta.onCellChange(row.id, column.id, e.target.value, 'onChange');
    }

    const onSelectChange = (e) => {
        tableMeta.onCellChange(row.id, column.id, e.target.value, 'onChange');
    };

    if (columnMeta?.type === "date") {
        initialValue = initialValue.split('T')[0];
    }

    if (columnMeta?.type === "select") {
        return <Form.Select
            value={initialValue}
            onChange={onSelectChange}
        >
            {columnMeta?.options?.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </Form.Select>;
    } else {
        return <Form.Control
            value={initialValue}
            onChange={onChange}
            type={column.columnDef.meta?.type || "text"}
            min={column.columnDef.meta?.min}
            max={column.columnDef.meta?.max} />;
    }
};

TableDataCell.propTypes = {
    getValue: PropTypes.func,
    row: PropTypes.object,
    column: PropTypes.object,
    table: PropTypes.object,
};
