// https://tanstack.com/table/latest/docs/guide/tables
// https://muhimasri.com/blogs/react-editable-table/
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import {
    useReactTable, createColumnHelper, flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel
} from '@tanstack/react-table';


import { TableDataCell } from './TableDataCell';
import { showToast } from '../Toasts/ToastContainer';

export default function TanStackTableDemo() {
    const columnHelper = createColumnHelper();
    const columns = [
        columnHelper.accessor("nr", {
            header: "Nr",
            cell: TableDataCell,
            meta: {
                type: "number",
            },
            enableColumnFilter: true,
            footer: () => { return table.getFilteredRowModel().rows.length + ' / ' + table.getCoreRowModel().rows.length },
        }),
        columnHelper.accessor("title", {
            header: "Title",
            cell: TableDataCell
        }),
        columnHelper.accessor("xDate", {
            header: "Just a date",
            cell: TableDataCell,
            meta: {
                type: "date",
            },
            enableColumnFilter: true
        }),
        columnHelper.accessor("category", {
            header: "Category",
            cell: TableDataCell,
            meta: {
                type: "select",
                options: [
                    { value: "cat1", label: "C1" },
                    { value: "cat2", label: "C2" },
                    { value: "cat3", label: "C3" }
                ],
            },
        }),
        columnHelper.accessor("switch", {
            header: "Switch",
            cell: TableDataCell,
            meta: {
                type: "boolean"
            },
        }),
    ];

    const [columnFilters, setColumnFilters] = useState([]);
    const [sorting, setSorting] = useState([]);

    const [data, setData] = useState([]);
    const [inSyncData, setInSyncData] = useState([]);
    const [rowSpinners, setRowSpinners] = useState({});

    const refresh = () => {
        fetch('/api/entities')
            .then(response => response.json())
            .then(jsonData => {
                // clientData to manipulate (optimistic strat.)        
                setData(jsonData);
                // store (a deep copy) of synchronized server-data 
                setInSyncData(jsonData.map(e => ({ ...e })));
            })
    }

    useEffect(() => refresh(), []);

    const updateRowSpinner = (rowId, value) => {
        setRowSpinners(currentSpinners => {
            const newSpinners = { ...currentSpinners };
            if (!value)
                delete newSpinners[rowId];
            else
                newSpinners[rowId] = value;
            return newSpinners;
        });
    }

    const updateClientData = (rowId, obj) => {
        setData(currentData => {
            const newData = [...currentData];
            const rowIdx = newData.findIndex(r => r._id == rowId);
            // demo bug ... no deep copy
            // newData[rowIdx] = obj;
            newData[rowIdx] = { ...obj };

            return newData;
        });
    }

    const restoreClientData = (rowId) => {
        setData(currentData => {
            const newData = [...currentData];
            const rowIdx = newData.findIndex(r => r._id == rowId);
            const rowIdxInSync = inSyncData.findIndex(r => r._id == rowId);
            // same demo bug here ... no deep copy
            // newData[rowIdx] = serverData[rowIdx];
            newData[rowIdx] = { ...inSyncData[rowIdxInSync] };
            return newData;
        });
    }

    const updateServerData = (rowId, obj) => {
        setInSyncData(currentData => {
            const newData = [...currentData];
            const rowIdx = newData.findIndex(r => r._id == rowId);
            // same demo bug here ... no deep copy
            // newData[rowIdx] = obj;
            newData[rowIdx] = { ...obj };

            return newData;
        });
    }

    const revertChanges = (rowId) => {
        console.log('revert', rowId);
        restoreClientData(rowId);
        updateRowSpinner(rowId, 0);
    }

    const revertAllChanges = () => {
        for (const rowId of Object.keys(rowSpinners))
            revertChanges(rowId)
    }

    const commitChanges = async (rowId) => {
        console.log('try to commit changes in row', rowId);
        try {
            updateRowSpinner(rowId, 2);

            const rowIdx = data.findIndex(r => r._id == rowId);
            const updatedClientObj = data[rowIdx];
            //const id = updatedClientObj._id;
            const id = rowId;
            const version = updatedClientObj['__v'];

            const response = await fetch(`/api/entities/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'if-match': version
                },
                body: JSON.stringify(updatedClientObj),
            });

            if (!response.ok) {
                const e = await response.json();
                throw e;
            }

            const updatedServerObj = await response.json();
            updateClientData(rowId, updatedServerObj);
            updateServerData(rowId, updatedServerObj);

        } catch (e) {
            restoreClientData(rowId);
            showToast("Update didn't work", e.message, e.details);
        } finally {
            updateRowSpinner(rowId, 0);
        }
    }

    const commitAllChanges = () => {
        for (const rowId of Object.keys(rowSpinners))
            commitChanges(rowId)
    }

    const addRow = async () => {
        console.log('try to add new record');

        const newClientRecord = {
            nr: Math.floor(Math.random() * 10000) + 1000,
            title: "---",
            xDate: "2024-01-01",
            category: "cat3",
            switch: true
        };

        try {
            setData(currentData => [newClientRecord, ...currentData]);
            updateRowSpinner(0, 2);

            const response = await fetch(`/api/entities`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newClientRecord),
            });

            if (!response.ok) {
                const e = await response.json();
                throw e;
            }

            const newServerRecord = await response.json();
            // replace the client-record with the server-record
            setData(currentData => [newServerRecord, ...(currentData.filter(r => r.nr != newClientRecord.nr))]);

            // add new record into the "synced" data
            setInSyncData(currentData => [newServerRecord, ...currentData])
        } catch (e) {
            // remove invalid client-record (because server rejected the creation)
            setData(currentData => currentData.filter(r => r.nr != newClientRecord.nr));
            showToast("Create-Problem", e.message, e.details);
        } finally {
            updateRowSpinner(0, 0);
        }
    }

    const deleteRow = async (rowId) => {
        console.log(`try to delete row ${rowId}`);

        try {
            setData(currentData => currentData.filter((row) => row._id != rowId));
            const response = await fetch(`/api/entities/${rowId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const e = await response.json();
                throw e;
            }

        } catch (e) {
            showToast("Delete-Problem", e.message, e.details);
            refresh();
        }
    }

    const navigate = useNavigate();

    const table = useReactTable({
        data: data,
        columns,
        // important: row-id is objectId from server!
        getRowId: (originalRow) => originalRow._id,
        state: {
            columnFilters,
            sorting
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        meta: {
            onCellChange: (rowId, columnId, value) => {
                // update cell in client data 
                setData(currentData => {
                    const newData = [...currentData];
                    const rowIdx = newData.findIndex(r => r._id == rowId);
                    newData[rowIdx][columnId] = value;
                    return newData;
                });

                // show Commit and Revert Button  
                updateRowSpinner(rowId, 1);
            }
        },
        onColumnFiltersChange: setColumnFilters,
    })


    return (
        <div>
            <h2>Editable DataTable connected with Backend</h2>
            <Table striped bordered hover>
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            <th className="align-top">
                                <Button
                                    className="btn-secondary"
                                    onClick={() => addRow(false)}>
                                    <i className="bi bi-plus-square"></i>
                                </Button>
                            </th>
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
                            <th className="align-top" >
                                {Object.keys(rowSpinners).length > 0 &&
                  <span>
                      <Button className="btn btn-success me-2 "
                          onClick={() => commitAllChanges()}>
                          <i className="bi bi-check-square"></i>
                      </Button>
                      <Button className="btn btn-danger "
                          onClick={() => revertAllChanges()}>
                          <i className="bi bi-x-square"></i>
                      </Button>
                  </span>
                                }

                            </th>
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id}>
                            <td>
                                {<Button className="btn-warning" onClick={() => {
                                    navigate(`/editable-table/${row.id}`)
                                }
                                }><i className="bi bi-file-text"></i>
                                </Button>}
                            </td>
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                            <td>

                                {!rowSpinners[row.id] &&
                  <span>
                      <Button className="btn btn-warning me-2" disabled>
                          <i className="bi bi-check2-circle"></i>
                      </Button>
                      <Button className="btn-danger " onClick={() => deleteRow(row.id)}><i className="bi bi-trash3"></i></Button>

                  </span>
                                }
                                {rowSpinners[row.id] == 1 &&
                  <span>
                      <Button className="btn btn-success me-2"
                          onClick={() => commitChanges(row.id)}>
                          <i className="bi bi-check-square"></i>
                      </Button>
                      <Button className="btn btn-danger"
                          onClick={() => revertChanges(row.id)}>
                          <i className="bi bi-x-square"></i>
                      </Button>
                  </span>
                                }
                                {rowSpinners[row.id] == 2 &&
                  <Button className="btn btn-warning" disabled>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  </Button>
                                }
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    {table.getFooterGroups().map(footerGroup => (
                        <tr key={footerGroup.id}>
                            <th>
                                {/* <Button
                  className="btn-secondary"
                  onClick={() => table.options.meta?.addRow(true)}>
                  <i className="bi bi-plus-square"></i>
                </Button> */}
                            </th>
                            {footerGroup.headers.map((header) => (
                                <th key={header.id}>
                                    {flexRender(
                                        header.column.columnDef.footer,
                                        header.getContext()
                                    )}
                                </th>))
                            }
                            <th align="right">

                            </th>
                        </tr>))
                    }
                </tfoot>
            </Table>
        </div>
    )
}

