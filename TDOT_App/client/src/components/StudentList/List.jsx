// https://tanstack.com/table/latest/docs/guide/tables
// https://muhimasri.com/blogs/react-editable-table/
import { useState } from "react";

import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";

import PropTypes from "prop-types";
import {
    useReactTable,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
} from "@tanstack/react-table";

import { getLatestActivity } from "./StudentListUtil.jsx";
import Button from "react-bootstrap/esm/Button.js";
import { useAuthFetch } from "../../lib/MSAL.js";
import { useQuery } from "@tanstack/react-query";

//import { TableDataCell } from './TableDataCell';
//import { showToast } from '../Toasts/ToastContainer';

/**
 *
 * @type {React.FC<{
 *      data: any[];
 *      columns: import("@tanstack/react-table").ColumnDef<any, any>[];
 *      onTableCellChange: Function;
 *      tableRowClassName: Function;
 * }>}
 */
const List = ({
    title,
    data,
    columns,
    onTableCellChange,
    tableRowClassName,
    onRowClick,
}) => {
    const fetch = useAuthFetch();
    const [columnFilters, setColumnFilters] = useState([]);
    const [sorting, setSorting] = useState([]);

    const table = useReactTable({
        data: data,
        columns,
        // important: row-id is objectId from server!
        getRowId: (originalRow) => originalRow._id,
        state: {
            columnFilters,
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        meta: {
            onCellChange: onTableCellChange,
            // show Commit and Revert Button
        },
        onColumnFiltersChange: setColumnFilters,
        sortingFns: {
            activitySorting: (rowA, rowB, columnId) => {
                return (
                        getLatestActivity(rowA.getValue(columnId)).time <
                            getLatestActivity(rowB.getValue(columnId)).time
                    ) ?
                        1
                    :   -1;
            },
        },
    });

    // todo remove static usage of columns from the list"

    return (
        <div>
            {title && <h2>{title}</h2>}
            <Table striped bordered hover>
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th key={header.id}>
                                    {header.column.getCanFilter() ?
                                        <div>
                                            {/* Filtertextbox */}
                                            <Form.Control
                                                type={
                                                    header.column.columnDef.meta
                                                        ?.type || "text"
                                                }
                                                value={
                                                    header.column.getFilterValue() ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    header.column.setFilterValue(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    :   null}
                                    {
                                        header.isPlaceholder ? null
                                            //  Headline (Sortable)
                                        : (
                                            <div
                                                role={
                                                    header.column.getCanSort() ?
                                                        "button"
                                                    :   ""
                                                }
                                                className={
                                                    header.column.getCanSort() ?
                                                        ""
                                                    :   "pe-none"
                                                }
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(
                                                    header.column.columnDef
                                                        .header,
                                                    header.getContext()
                                                )}
                                                {{
                                                    asc: (
                                                        <i className="bi bi-caret-up-fill"></i>
                                                    ),
                                                    desc: (
                                                        <i className="bi bi-caret-down-fill"></i>
                                                    ),
                                                }[
                                                    header.column.getIsSorted()
                                                ] ?? null}
                                            </div>
                                        )
                                    }
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows?.map((row) => (
                        <tr
                            key={row.id}
                            className={
                                tableRowClassName ? tableRowClassName(row) : ""
                            }
                            onClick={() => {
                                if (onRowClick) onRowClick(row);
                            }}
                            onKeyUp={(e) => {
                                if (e.key === "Enter" && onRowClick)
                                    onRowClick(row);
                            }}
                            tabIndex={0}
                            role={onRowClick ? "button" : "listitem"}
                            style={{
                                cursor: onRowClick ? "pointer" : "default",
                            }}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id}>
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </Table>
            {/* <Button
                className="btn-secondary"
                onClick={() => table.options.meta?.addRow(true)}
            >
                <i className="bi bi-plus-square pe-2" />
                Add row
            </Button> */}
        </div>
    );
};

List.propTypes = {
    title: PropTypes.string,
    data: PropTypes.array,
    columns: PropTypes.array,
    onTableCellChange: PropTypes.func,
    tableRowClassName: PropTypes.func,
    onRowClick: PropTypes.func,
};

export default List;
