import PropTypes from "prop-types";
import DataTable from "react-data-table-component";
import Button from "react-bootstrap/Button";
import { useAuthFetch } from "../../../lib/MSAL";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ConfirmationModal from "../../Modal/ConfirmationModal";
export default function TDOTTable({ station, updateStation }) {
    const [deleteConfirmation, setDeleteConfirmation] = useState({active: false, idx: 0});
    function removeIndex(idx) {
        console.log("REMOVING");
        return;
        let newSt = { ...station };
        newSt.assignedOpenDays.splice(idx, 1);
        console.log("Removed index: " + idx);
        updateStation(newSt);
    }

    const fetch = useAuthFetch();

    const { data } = useQuery({
        initialData: [],
        queryKey: ["opendays", "all"],
        queryFn: () => fetch("/api/opendays").then((res) => res.json()),
    });

    /*useEffect(() => {
        async function get(url) {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": `application/json`,
                },
            });

            if (!response.ok)
                throw { status: response.status, msg: response.statusText };

            const data = await response.json();

            return data;
        }

        (async () => {
            try {
                setOpendays(
                    (await get(openDayURL)).filter((day) =>
                        station.assignedOpenDays.includes(day._id)
                    )
                );
            } catch (error) {
                setOpendays([]);
            }
        })();
    }, [isAuthenticated, fetch, station]);*/

    const columns = [
        {
            cell: ((row) => {
                if (row.active) return (
                    <i className="bi bi-bookmark-fill fs-5"></i>
                )
                else 
                return (
                    <div/>
                )
            }),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
        {
            name: "Date",
            selector: (row) => (row.date),
            sortable: true,
            filterable: true,
        },
        {
            cell: (row) => (
                <Button
                    className="btn-danger"
                    onClick={() => setDeleteConfirmation({active: true, idx: row.id})}
                >
                    <i className="bi bi-trash3"></i>
                </Button>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];

    return (
        <div>
            <ConfirmationModal
                show={deleteConfirmation.active}
                onCancel={() => setDeleteConfirmation({active: false, idx: 0})}
                title="Delete Openday"
                message={'Are you sure that you want to delete this openday?'}
                onConfirm={() => {
                    removeIndex(deleteConfirmation.idx);
                    setDeleteConfirmation({active: false, idx: 0});
                }}
            />
            <DataTable
                columns={columns}
                data={data.filter((tdot) =>
                    station.assignedOpenDays?.includes(tdot._id)
                )}
            />
        </div>
        
    );
}

TDOTTable.propTypes = {
    station: PropTypes.object,
    updateStation: PropTypes.func,
};
