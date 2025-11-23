// https://tanstack.com/table/latest/docs/guide/tables
// https://muhimasri.com/blogs/react-editable-table/
import defaultData from '../../data/TanStackTableDemoData.json';

import { useState } from 'react';
import { useNavigate } from "react-router-dom";

import { TableCell } from './TableCell';

import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import {
    useReactTable, createColumnHelper, flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel
} from '@tanstack/react-table';

export default function TanStackTableDemo() {
    const columnHelper = createColumnHelper();

    const columns = [
        columnHelper.accessor("personId", {
            header: "Person ID",
            cell: TableCell,
            meta: {
                type: "number"
            },
            enableColumnFilter: false,
            footer: () => { return table.getFilteredRowModel().rows.length + ' / ' + table.getCoreRowModel().rows.length },
        }),
        columnHelper.accessor("lastName", {
            header: "Last Name",
            cell: TableCell,

        }),
        columnHelper.accessor("age", {
            header: "Age",
            cell: TableCell,
            meta: {
                type: "number",
                min: 14,
                max: 120
            },
            enableColumnFilter: false,
            enableSorting: false
        }),
        columnHelper.accessor("lastSaleDate", {
            header: "Date Of last Sale",
            cell: TableCell,
            meta: {
                type: "date",
            },
            enableColumnFilter: false
        }),
        columnHelper.accessor("status", {
            header: "Status",
            cell: TableCell,
            meta: {
                type: "select",
                options: [
                    { value: "Married", label: "Married" },
                    { value: "Single", label: "Single" },
                    { value: "In a Relationship", label: "In a Relationship" }
                ],
            },
        }),
    ];

    const [columnFilters, setColumnFilters] = useState([]);
    const [sorting, setSorting] = useState([]);
    const [data, setData] = useState(() => [...defaultData]);

    const navigate = useNavigate();

    const table = useReactTable({
        data,
        columns,
        state: {
            columnFilters,
            sorting
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        meta: {
            updateData: (rowIndex, columnId, value) => {
                console.log(`updating row ${rowIndex} col ${columnId} with ${value}`);
                setData((oldTableData) =>
                // change one column in one row 
                    oldTableData.map((row, index) => {
                        // select row with index
                        if (index === rowIndex) {
                            return {
                                ...oldTableData[rowIndex],
                                [columnId]: value,
                            };
                        } else {
                            // return unchanged row
                            return row;
                        }
                    })
                );
            },
            deleteRow: (rowIndex) => {
                console.log(`deleting row ${rowIndex}`);
                setData(oldTableData => oldTableData.filter((_row, idx) => idx != rowIndex));
            },
            addRow: (asLastRow) => {
                const newRow = {
                    personId: Math.floor(Math.random() * 9000) + 1000,
                    firstName: "---",
                    lastName: "---",
                    age: "",
                    visits: 0,
                    progress: 0,
                    status: "",
                    lastSaleDate: "2024-01-01"
                };
                if (asLastRow)
                    setData(oldTableData => [...oldTableData, newRow]);
                else
                    setData(oldTableData => [newRow, ...oldTableData]);

                console.log(asLastRow)
            }
        },
        onColumnFiltersChange: setColumnFilters,
    })


    return (
        <div>
            <h2>TanStackTableDemo - just client data</h2>
            <Table striped bordered hover>
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            <th></th>
                            {headerGroup.headers.map((header) => (
                                <th key={header.id}>
                                    {header.column.getCanFilter() ? (
                                        <div>
                                            {/* Filtertextbox */}
                                            <Form.Control
                                                type={header.column.columnDef.meta?.type || "text"}
                                                value={header.column.getFilterValue() || ""}
                                                onChange={e => header.column.setFilterValue(e.target.value)}
                                            />
                                        </div>) : null}
                                    {header.isPlaceholder
                                        ? null
                                        :
                                    //  Headline (Sortable) 
                                        <div
                                            role={header.column.getCanSort() ? 'button' : ''}
                                            className={header.column.getCanSort() ? '' : 'pe-none'}
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                            {{
                                                asc: <i className="bi bi-caret-up-fill"></i>,
                                                desc: <i className="bi bi-caret-down-fill"></i>,
                                            }[header.column.getIsSorted()] ?? null}
                                        </div>
                                    }
                                </th>
                            ))}
                            <th>
                                <Button
                                    className="btn-secondary"
                                    onClick={() => table.options.meta?.addRow(false)}>
                                    <i className="bi bi-plus-square"></i>
                                </Button>
                            </th>
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row, rowIdx) => (
                        <tr key={row.id}>
                            <td><Button className="btn-warning" onClick={() => {
                                console.log(row)
                                navigate(`/tanstack-table-demo/${row.original?.personId}`)
                            }
                            }><i className="bi bi-file-text"></i></Button></td>
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                            <td><Button className="btn-danger" onClick={() => table.options.meta?.deleteRow(rowIdx)}><i className="bi bi-trash3"></i></Button></td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    {table.getFooterGroups().map(footerGroup => (
                        <tr key={footerGroup.id}>
                            <th></th>
                            {footerGroup.headers.map((header) => (
                                <th key={header.id}>
                                    {flexRender(
                                        header.column.columnDef.footer,
                                        header.getContext()
                                    )}
                                </th>))
                            }
                            <th align="right">
                                <Button
                                    className="btn-secondary"
                                    onClick={() => table.options.meta?.addRow(true)}>
                                    <i className="bi bi-plus-square"></i>
                                </Button>
                            </th>
                        </tr>))
                    }
                </tfoot>
            </Table>
        </div>
    )
}

