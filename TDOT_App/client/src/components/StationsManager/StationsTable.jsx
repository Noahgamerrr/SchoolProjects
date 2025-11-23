// https://tanstack.com/table/latest/docs/guide/tables
// https://muhimasri.com/blogs/react-editable-table/
import { useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import { showToast } from "../Toasts/ToastContainer";
import { useAuthFetch } from "../../lib/MSAL";
import { TableCell } from "./StationTableCell";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ConfirmationModal from "../Modal/ConfirmationModal";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import {
    useReactTable,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
} from "@tanstack/react-table";
import Loading from "../Loading";
import ClientError from "../Errors/ClientError";
import FeedbackAverage from "../Feedback/FeedbackAverage";
import { TableCellRoomNr } from "./StationTableCellRoomNr";
import { TableCellTag } from "./StationTableCellTag";
import { TableCellPersonCount } from "./StationTableCellPersonCount";
import { StationTableCellActivityType } from "./StationTableCellActivityType";
import { useReactToPrint } from "react-to-print";
import QRCode from "../QRCode";
import confirmationModal from "../Modal/ConfirmationModal";
import {FormCheck, FormText, Modal} from "react-bootstrap";
import FormModal from "../Modal/FormModal.jsx";
import PopupModal from "../Modal/PopupModal.jsx";
import {Input} from "react-select/animated";
import StudentTable from "./SimpleLists/StudentTable.jsx";
import CallWorkersModal from "./CallWorkersModal.jsx";

export default function StationsTable() {
    const columnHelper = createColumnHelper();
    const columns = [
        columnHelper.accessor("name", {
            header: "Name",
            cell: TableCell,
            enableColumnFilter: true,
            footer: () => {
                return (
                    table.getFilteredRowModel().rows.length +
                    " / " +
                    table.getCoreRowModel().rows.length
                );
            },
        }),
        columnHelper.accessor("interactType", {
            header: "Interact Type",
            cell: StationTableCellActivityType,
            enableSorting: true,
        }),
        columnHelper.accessor("roomNr", {
            header: "Room",
            cell: TableCellRoomNr,
            enableSorting: true,
        }),
        columnHelper.accessor("tags", {
            header: "Tags",
            cell: TableCellTag,
            enableColumnFilter: false,
        }),
        columnHelper.accessor("capacity", {
            header: "Capacity",
            cell: TableCellPersonCount,
            enableSorting: true,
            enableColumnFilter: false,
        }),
        columnHelper.accessor("rating", {
            header: "Rating",
            cell: (rating) => {
                return <FeedbackAverage avg={rating.getValue()} />;
            },
            enableSorting: true,
            sortingFn: (a, b) => {
                return a.original.rating - b.original.rating;
            },
            enableColumnFilter: false,
        }),
    ];

    const [columnFilters, setColumnFilters] = useState([]);
    const [sorting, setSorting] = useState([]);

    const [deleteConfirmation, setDeleteConfirmation] = useState({
        active: false,
        idx: 0,
    });

    const [callWorkerModalInfo, setCallWorkerModalInfo] = useState({
        active: false,
        station: undefined
    })
    const [workersToCall, setWorkersToCall] = useState({})

    const fetch = useAuthFetch();
    const navigate = useNavigate();
    const printRef = useRef();

    const handlePrint = useReactToPrint({
        contentRef: printRef,
    });

    const queryClient = useQueryClient();

    const { data, error } = useQuery({
        queryKey: ["stations", "all"],
        queryFn: () => fetch("/api/stations").then((res) => res.json()),
    });

    const { data: openDay, error: openDayError } = useQuery({
        queryKey: ["openday"],
        queryFn: () => fetch("/api/opendays/active").then((res) => res.json()),
    });

    const postMutation = useMutation({
        mutationKey: ["stations", "all"],
        mutationFn: async (newData) => {
            const response = await fetch("/api/stations", {
                method: "POST",
                headers: {
                    "Content-Type": `application/json`,
                },
                body: JSON.stringify(newData),
            });

            return response.json();
        },
        onSettled: (resp) => {
            queryClient.invalidateQueries(["stations"]);
            navigate("/stations/" + resp._id);
        },
    });

    const putMutation = useMutation({
        mutationKey: ["stations", "all"],
        mutationFn: async (newData) => {
            await fetch("/api/stations/" + newData._id, {
                method: "PUT",
                headers: {
                    "Content-Type": `application/json`,
                },
                body: JSON.stringify(newData),
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries(["stations"]);

            showToast(
                "Success",
                "Inserted Station",
                `New station added successfully`,
                "Success"
            );
        },
    });

    const deleteMutation = useMutation({
        mutationKey: ["stations", "all"],
        mutationFn: async (id) => {
            await fetch("/api/stations/" + id, {
                method: "DELETE",
            });
        },
        onSettled: (data, error, st) => {
            queryClient.invalidateQueries(["stations"]);

            showToast(
                "Success",
                "Deleted Station",
                `Station ${st?.name || "successfully"} deleted`,
                "Success"
            );
        },
    });

    const table = useReactTable({
        data: data || [],
        columns,
        state: {
            columnFilters,
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        meta: {
            updateData: (rowIndex, columnId, value) => {
                console.log(
                    `updating row ${rowIndex} col ${columnId} with ${value}`
                );

                putMutation.mutate({
                    ...data[rowIndex],
                    [columnId]: value,
                });
            },
            deleteRow: async (rowIndex) => {
                deleteMutation.mutate(data[rowIndex]._id);
            },
            addRow: async () => {
                const newRow = {
                    name: "---",
                    description: "---",
                    capacity: 1,
                    minWorkers: 1,
                    interactType: "other",
                    roomNr: "101",
                };
                postMutation.mutate(newRow);
            },
        },
        onColumnFiltersChange: setColumnFilters,
    });

    if (error)
        return (
            <ClientError title="Error">
                <p>Failed to load stations</p>
            </ClientError>
        );
    if (data == undefined) return <Loading />;

    if (openDayError)
        return (
            <ClientError title="Error">
                <p>Failed to load openDay</p>
            </ClientError>
        );
    if (!openDay) return <Loading />;

    return (
        <div>
            <ConfirmationModal
                show={deleteConfirmation.active}
                onCancel={() =>
                    setDeleteConfirmation({ active: false, idx: 0 })
                }
                title="Delete Station"
                message={
                    'Are you sure that you want to delete "' +
                    (data[deleteConfirmation.idx]?.name || "N/A") +
                    '"'
                }
                onConfirm={() => {
                    table.options.meta?.deleteRow(deleteConfirmation.idx);
                    setDeleteConfirmation({ active: false, idx: 0 });
                }}
            />
            <CallWorkersModal
                callWorkerModalInfo={callWorkerModalInfo}
                setCallWorkerModalInfo={setCallWorkerModalInfo}
                workersToCall={workersToCall}
                setWorkersToCall={setWorkersToCall}
            />
            <div className="d-flex justify-content-between">
                <Button
                    variant="secondary"
                    title="User View"
                    onClick={() => {
                        navigate(`/stations/read`);
                    }}
                >
                    <i className="bi bi-eye-slash"></i>
                </Button>
                <Button variant="info" title="User View" onClick={handlePrint}>
                    <i className="bi bi-printer-fill"></i>
                </Button>
            </div>
            <h2>Stations</h2>
            <Table striped bordered hover>
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            <th></th>
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
                            <th>
                                <Button
                                    className="btn-secondary"
                                    onClick={() =>
                                        table.options.meta?.addRow(false)
                                    }
                                >
                                    <i className="bi bi-plus-square"></i>
                                </Button>
                            </th>
                        </tr>
                    ))}
                </thead>
                <tbody>
                {table.getRowModel().rows.map((row, rowIdx) => (
                    <tr key={row.id}>
                        <td>
                            <div className="d-flex flex-row flex-nowrap gap-1">
                                <Button
                                    variant="secondary"
                                    title="View Station Details"
                                    onClick={() => {
                                        console.log(row);
                                        navigate(
                                            `/stations/${row.original?._id}`
                                        );
                                    }}
                                >
                                    <i className="bi bi-file-text"></i>
                                </Button>
                                <Button
                                    variant="info"
                                    title="Feedback page"
                                    onClick={() => {
                                        navigate(
                                            `/stations/${row.original?._id}/feedback`
                                        );
                                    }}
                                >
                                    <i className="bi bi-chat-left-heart"></i>
                                </Button>
                                <Button
                                    variant="danger"
                                    title="call station workers"
                                    onClick={() => {
                                        const station = data[row.id]
                                        console.log(station)
                                        setCallWorkerModalInfo({active: true, station})
                                    }
                                    }
                                >
                                    <i className="bi bi-chat-left-quote"></i>
                                </Button>
                            </div>
                        </td>
                        {row.getVisibleCells().map((cell) => (
                            <td key={cell.id}>
                                {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                )}
                            </td>
                        ))}
                        <td>
                            <Button
                                className="btn-danger"
                                onClick={() => {
                                    setDeleteConfirmation({
                                        active: true,
                                        idx: rowIdx,
                                    });
                                }}
                            >
                                <i className="bi bi-trash3"></i>
                            </Button>
                        </td>
                    </tr>
                ))}
                </tbody>
                <tfoot>
                {table.getFooterGroups().map((footerGroup) => (
                    <tr key={footerGroup.id}>
                        <th></th>
                        {footerGroup.headers.map((header) => (
                            <th key={header.id}>
                                {flexRender(
                                    header.column.columnDef.footer,
                                    header.getContext()
                                )}
                            </th>
                        ))}
                        <th align="right">
                            <Button
                                className="btn-secondary"
                                onClick={() =>
                                    table.options.meta?.addRow(true)
                                }
                            >
                                <i className="bi bi-plus-square"></i>
                            </Button>
                        </th>
                    </tr>
                ))}
                </tfoot>
            </Table>
            <div className="d-none">
                <div ref={printRef}>
                    {data.map((station) => (
                        <div key={station._id} ref={printRef} className="m-5">
                            <div
                                className="d-flex justify-content-between align-items-center"
                                style={{ height: "100px" }}
                            >
                                <img
                                    src="/images/htl-villach.png"
                                    style={{ height: "100px" }}
                                />
                                <h1 className="fs-3">
                                    Tag der offenen T&uuml;r
                                </h1>
                                <p className="fs-3">{openDay.date}</p>
                            </div>
                            <div
                                className="mx-auto"
                                style={{
                                    width: "fit-content",
                                    marginTop: "50px",
                                }}
                            >
                                <h2 className="text-center">{station.name}</h2>
                                <div
                                    className="mx-auto"
                                    style={{ width: "fit-content" }}
                                >
                                    <QRCode
                                        value={`${window.origin.toString()}/stations/${station._id}/addToTour`}
                                    />
                                </div>
                            </div>
                            <div className="page-break" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
