import { createColumnHelper } from "@tanstack/react-table";
import { useState, useEffect } from "react";
import List from "./List";
import { useMsal } from "@azure/msal-react";
import { useIsAuthenticated } from "@azure/msal-react";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
import {
    getBSColorClassOfActivity,
    getLatestActivityFormatted,
} from "./StudentListUtil.jsx";
import Loading from "../Loading";
import { useAuthFetch } from "../../lib/MSAL.js";
import StudentRating from "./StudentRating.jsx";
import { StudentListDownloadButton } from "./StudentListDownloadButton.jsx";

export default function StudentListPage() {
    const [data, setData] = useState();
    const { instance } = useMsal();
    const isAuthenticated = useIsAuthenticated();
    const fetch = useAuthFetch();

    const navigate = useNavigate();
    useEffect(
        () => {
            (async () => {
                const response = await fetch("/api/students");
                if (!response.ok)
                    throw { status: response.status, msg: response.statusText };
                setData(await response.json());
            })();
            // This dependency array that is commented out made the page loop endlessly.
            // I decided to just comment the array out, so that it can be easily reimplemented
            // if at any point its inital use-case has been found again.
        },
        [
            /*instance, isAuthenticated, fetch*/
        ]
    );

    if (!data) {
        return <Loading />;
    }

    function getLatestActivity(activity) {
        if (!activity || activity.length === 0) {
            return "No activity recorded";
        }
        activity.sort((a, b) => new Date(b.time) - new Date(a.time));
        const latestActivity = activity[0];

        const time = new Date(latestActivity.time);
        const hours = time.getHours().toString().padStart(2, "0");
        const minutes = time.getMinutes().toString().padStart(2, "0");

        return `${latestActivity.activity} at ${hours}:${minutes}`;
    }

    const handleTableCellChange = (rowId, columnId, value) => {
        // update cell in client data
        setData((currentData) => {
            const newData = [...currentData];
            const rowIdx = newData.findIndex((r) => r._id == rowId);
            newData[rowIdx][columnId] = value;
            return newData;
        });
    };
    const evalClassName = (row) => {
        return getBSColorClassOfActivity(
            getLatestActivityFormatted(row.getAllCells().at(4).getValue())
        );
    };

    const columnHelper = createColumnHelper();
    const columns = [
        columnHelper.display({
            id: "actions",
            cell: (context) => (
                <td className="d-flex justify-content-between">
                    {
                        <Button
                            className="btn-secondary"
                            title="View Student's Activity"
                            onClick={() => {
                                navigate(
                                    `/students/${context.row.id}/activity`
                                );
                            }}
                        >
                            <i className="bi bi-activity"></i>
                        </Button>
                    }
                    {
                        <Button
                            className="btn-secondary"
                            title="View & Manage Student's Stations"
                            onClick={() => {
                                navigate(
                                    `/students/${context.row.id}/stations`
                                );
                            }}
                        >
                            <i className="bi bi-pc-display-horizontal"></i>
                        </Button>
                    }
                    {
                        <Button
                            className="btn-secondary"
                            title="View & Manage Student's Guide-Teams"
                            onClick={() => {
                                navigate(
                                    `/students/${context.row.id}/guide-teams`
                                );
                            }}
                        >
                            <i className="bi bi-people"></i>
                        </Button>
                    }
                    {
                        <Button
                            className="btn-secondary"
                            title="View Students Tours"
                            onClick={() => {
                                navigate(`/students/${context.row.id}/tours`);
                            }}
                        >
                            <i className="bi bi-compass"></i>
                        </Button>
                    }
                </td>
            ),
        }),
        columnHelper.accessor("firstname", {
            header: "First Name",
        }),
        columnHelper.accessor("lastname", {
            header: "Last Name",
        }),
        columnHelper.accessor("shortform", {
            header: "Shortform",
        }),
        columnHelper.accessor("activity", {
            header: "Latest Activity",
            cell: (activity) => getLatestActivity(activity.getValue()),
            enableColumnFilter: false,
            sortingFn: "activitySorting",
        }),
        columnHelper.accessor("_id", {
            header: "Rating",
            cell: (id) => <StudentRating studentId={id.getValue()} />,
            enableColumnFilter: false,
        }),
    ];

    return (
        <>
            <div className="d-flex justify-content-between align-items-center">
                <h2>Student List</h2>
                <StudentListDownloadButton />
            </div>
            <List
                data={data}
                columns={columns}
                onTableCellChange={handleTableCellChange}
                tableRowClassName={evalClassName}
                showDownloadButton={true}
            ></List>
        </>
    );
}
