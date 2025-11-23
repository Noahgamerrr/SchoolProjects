/*
import { useEffect, useState } from 'react';

import Button from 'react-bootstrap/Button';
import { useNavigate, useParams } from "react-router-dom";

import { useMsal } from "@azure/msal-react";
import { useIsAuthenticated } from "@azure/msal-react";
import { acquireAccessToken } from '../../lib/MSAL';

export default function StudentActivity() {
  const [detailData, setDetailData] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();

  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();


  useEffect(() => {(async () => {
    const accessToken = await acquireAccessToken(instance, instance.getActiveAccount());
    const response = await fetch(`/api/students/${id}`,{
      method: 'GET',
      headers: {
        'Content-Type': `application/json`,
        'Authorization': 'Bearer ' + accessToken
      }
    });
    if (!response.ok)
      throw { status: response.status, msg: response.statusText };
    setDetailData(await response.json());
  })();}, [id, instance, isAuthenticated]);
  
  return (
    <div>
      <h2>TanStackTableDemoDetail</h2>

      <div>{detailData ? JSON.stringify(detailData) : <span>not found</span>}</div>
      <Button className="btn-success" onClick={() => navigate('/students')}>Back <i className="bi bi-file-text"></i></Button>
    </div >
  )
}
*/
// https://tanstack.com/table/latest/docs/guide/tables
// https://muhimasri.com/blogs/react-editable-table/
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import { getBSColorClassOfActivity } from "./StudentListUtil";

import {
    useReactTable,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
} from "@tanstack/react-table";
import { useAuthFetch } from "../../lib/MSAL";

//import { TableDataCell } from './TableDataCell';
//import { showToast } from '../Toasts/ToastContainer';

export default function StudentActivity() {
    const columnHelper = createColumnHelper();
    const columns = [
        columnHelper.accessor("time", {
            header: "Time",
            cell: (time) => formatTime(time.getValue()),
            enableColumnFilter: false,
        }),
        columnHelper.accessor("activity", {
            header: "Activity",
        }),
    ];

    function formatTime(rawTime) {
        const time = new Date(rawTime);
        const hours = time.getHours().toString().padStart(2, "0");
        const minutes = time.getMinutes().toString().padStart(2, "0");

        return `${hours}:${minutes}`;
    }

    const [columnFilters, setColumnFilters] = useState([]);
    const [sorting, setSorting] = useState([]);

    const [data, setData] = useState([]);

    const { id } = useParams();

    const fetch = useAuthFetch();

    useEffect(() => {
        (async () => {
            const response = await fetch(`/api/students/${id}`);
            if (!response.ok)
                throw { status: response.status, msg: response.statusText };
            setData(await response.json());
        })();
    }, [id, fetch]);

    const navigate = useNavigate();

    const table = useReactTable({
        data:
            data.activity ?
                data.activity.sort(
                    (a, b) => new Date(b.time) - new Date(a.time)
                )
                :   [],
        columns,
        // important: row-id is objectId from server!
        getRowId: (originalRow) => originalRow.time,
        state: {
            columnFilters,
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        meta: {
            onCellChange: (rowId, columnId, value) => {
                // update cell in client data
                setData((currentData) => {
                    const newData = [...currentData];
                    const rowIdx = newData.findIndex((r) => r._id == rowId);
                    newData[rowIdx][columnId] = value;
                    return newData;
                });

                // show Commit and Revert Button
            },
        },
        onColumnFiltersChange: setColumnFilters,
    });

    return (
        <div>
            {
                <Button
                    className="btn-secondary"
                    title="Return"
                    onClick={() => {
                        navigate(-1);
                    }}
                >
                    <i className="bi bi-arrow-return-left"></i>
                </Button>
            }
            <h2>
                {`Activity of ${data.firstname} ${data.lastname} (${data.shortform})`}
            </h2>
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
                    {table.getRowModel().rows.map((row) => (
                        <tr
                            key={row.id}
                            className={getBSColorClassOfActivity(
                                row.getAllCells().at(1).getValue()
                            )}
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
        </div>
    );
}
