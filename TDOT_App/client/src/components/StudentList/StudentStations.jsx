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
      <Button className="btn-success" onClick={() => navigate('/studentList')}>Back <i className="bi bi-file-text"></i></Button>
    </div >
  )
}
*/
// https://tanstack.com/table/latest/docs/guide/tables
// https://muhimasri.com/blogs/react-editable-table/
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import { useIsAuthenticated } from "@azure/msal-react";
import { showToast } from "../Toasts/ToastContainer";
import LockedConfirmationModal from "../Modal/LockedConfirmationModal";

import {
    useReactTable,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
} from "@tanstack/react-table";
import Loading from "../Loading";
import { useAuthFetch } from "../../lib/MSAL";

//import { TableDataCell } from './TableDataCell';
//import { showToast } from '../Toasts/ToastContainer';

export default function StudentActivity() {
    const [columnFilters, setColumnFilters] = useState([]);
    const [sorting, setSorting] = useState([]);

    const [stations, setStations] = useState([]);
    const [student, setStudent] = useState([]);
    const [modalEvent, setModalEvent] = useState({
        event: null,
        cell: null,
        function: null,
    });
    const [odLocked, setOdLocked] = useState(false);

    const isAuthenticated = useIsAuthenticated();
    const { id } = useParams();
    const fetch = useAuthFetch();

    const columnHelper = createColumnHelper();
    const columns = [
        columnHelper.accessor("name", {
            header: "Name",
        }),
        columnHelper.accessor("includesStudent", {
            header: "Assigned",
            cell: (c) =>
                c.row.original.loading ? (
                    <Loading size="1.5rem" />
                ) : (
                    <Form.Check
                        checked={c.getValue()}
                        onClick={(e) => modalCheck(e, c, handleAssign)}
                        readOnly
                    ></Form.Check>
                ),
            enableColumnFilter: false,
        }),
        columnHelper.accessor("includesStudentAsLeader", {
            header: "Is Leader",
            cell: (c) =>
                c.row.original.loading ? (
                    <Loading size="1.5rem" />
                ) : (
                    <Form.Check
                        checked={c.getValue()}
                        onClick={(e) => modalCheck(e, c, handleAssignLeader)}
                        readOnly
                    ></Form.Check>
                ),
            enableColumnFilter: false,
        }),
    ];

    function setStationLoading(cell) {
        let newStations = [...stations];
        newStations[
            newStations.findIndex((s) => s._id == cell.row.original._id)
        ].loading = true;
        setStations(newStations);
    }

    function removeStationLoading(cell) {
        let newStations = [...stations];
        newStations[
            newStations.findIndex((s) => s._id == cell.row.original._id)
        ].loading = false;
        setStations(newStations);
    }

    function modalCheck(event, cell, fun) {
        if (odLocked) {
            //i have no reason why i have to do this, for some reason it just flips it around in this case, so i need to flip it back
            event.target.checked = !event.target.checked;
            setModalEvent({ event: event, cell: cell, function: fun });
        } else {
            fun(event, cell);
        }
    }

    async function handleAssign(event, cell) {
        if (event.target.checked) {
            setStationLoading(cell);
            let response = await fetch(
                `/api/students/${student._id}/station/${cell.row.original._id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": `application/json`,
                        "if-match": student.__v,
                    },
                }
            );
            if (response.ok) {
                showToast(
                    "Success",
                    "",
                    "Successfully removed Student from station!",
                    "Success"
                );
                loadData();
            } else {
                showToast(
                    `Error!`,
                    `${response.status} ${response.statusText}`,
                    JSON.parse(await response.text()).message,
                    "Danger"
                );
                removeStationLoading(cell);
            }
        } else {
            setStationLoading(cell);
            let response = await fetch(
                `/api/students/${student._id}/station/${cell.row.original._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": `application/json`,
                        "if-match": student.__v,
                    },
                }
            );
            if (response.ok) {
                showToast(
                    "Success",
                    "",
                    "Successfully added Student to station!",
                    "Success"
                );
                loadData();
            } else {
                showToast(
                    `Error!`,
                    `${response.status} ${response.statusText}`,
                    JSON.parse(await response.text()).message,
                    "Danger"
                );
                removeStationLoading(cell);
            }
        }
    }

    async function handleAssignLeader(event, cell) {
        if (event.target.checked) {
            showToast(
                "Error",
                "",
                "Cannot remove leader role! Assign a new leader to automatically demote the former Leader.",
                "Danger"
            );
        } else {
            setStationLoading(cell);
            let response = await fetch(
                `/api/students/${student._id}/stationLeader/${cell.row.original._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": `application/json`,
                        "if-match": student.__v,
                    },
                }
            );
            if (response.ok) {
                showToast(
                    "Success",
                    "",
                    "Successfully assigned student as station leader!",
                    "Success"
                );
                loadData();
            } else {
                showToast(
                    `Error!`,
                    `${response.status} ${response.statusText}`,
                    JSON.parse(await response.text()).message,
                    "Danger"
                );
                removeStationLoading(cell);
            }
        }
    }

    const loadOd = useCallback(async () => {
        let response = await fetch(`/api/opendays/active`);
        if (!response.ok)
            throw { status: response.status, msg: response.statusText };
        let od = await response.json();
        setOdLocked(od.locked);
    }, [fetch]);

    const loadData = useCallback(async () => {
        let response = await fetch(`/api/stations`);
        if (!response.ok)
            throw { status: response.status, msg: response.statusText };
        let stations = await response.json();

        response = await fetch(`/api/students/${id}`);
        if (!response.ok)
            throw { status: response.status, msg: response.statusText };
        let student = await response.json();

        addStudentInfoToStations(student, stations);
        setStudent(student);
    }, [id, fetch]);

    useEffect(() => {
        loadData();
        loadOd();
    }, [loadData, loadOd, isAuthenticated]);

    function addStudentInfoToStations(student, stations) {
        for (let i in stations) {
            if (
                student.stations.some(
                    (station) => station.stationId == stations[i]._id
                )
            ) {
                stations[i].includesStudent = true;
                stations[i].includesStudentAsLeader = student.stations.some(
                    (station) =>
                        station.stationId == stations[i]._id &&
                        station.isLeader == true
                );
            } else {
                stations[i].includesStudent = false;
                stations[i].includesStudentAsLeader = false;
            }
        }
        setStations(stations);
    }

    const navigate = useNavigate();

    const table = useReactTable({
        data: stations,
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
                setStations((currentData) => {
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
            <LockedConfirmationModal
                show={
                    modalEvent.event && modalEvent.cell && modalEvent.function
                }
                onCancel={() =>
                    setModalEvent({ event: null, cell: null, function: null })
                }
                onConfirm={() =>
                    modalEvent.function(modalEvent.event, modalEvent.cell)
                }
                actionText={"Confirm"}
            />
            {
                <Button
                    className="btn-secondary"
                    title="Return"
                    onClick={() => {
                        navigate(`/students`);
                    }}
                >
                    <i className="bi bi-arrow-return-left"></i>
                </Button>
            }
            <h2>
                Stations of{" "}
                {`${student.firstname} ${student.lastname} (${student.shortform})`}
            </h2>
            <Table striped bordered hover>
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th key={header.id}>
                                    {header.column.getCanFilter() ? (
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
                                    ) : null}
                                    {header.isPlaceholder ? null : (
                                        //  Headline (Sortable)
                                        <div
                                            role={
                                                header.column.getCanSort()
                                                    ? "button"
                                                    : ""
                                            }
                                            className={
                                                header.column.getCanSort()
                                                    ? ""
                                                    : "pe-none"
                                            }
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                            {{
                                                asc: (
                                                    <i className="bi bi-caret-up-fill"></i>
                                                ),
                                                desc: (
                                                    <i className="bi bi-caret-down-fill"></i>
                                                ),
                                            }[header.column.getIsSorted()] ??
                                                null}
                                        </div>
                                    )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id}>
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
                <tfoot>
                    {table.getFooterGroups().map((footerGroup) => (
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
                                </th>
                            ))}
                            <th align="right"></th>
                        </tr>
                    ))}
                </tfoot>
            </Table>
        </div>
    );
}
