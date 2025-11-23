import FormModal from "../Modal/FormModal.jsx";
import StudentTable from "./SimpleLists/StudentTable.jsx";
import {FormCheck} from "react-bootstrap";
import {showToast} from "../Toasts/ToastContainer.jsx";
import {useAuthFetch} from "../../lib/MSAL.js";

export default ({callWorkerModalInfo, setCallWorkerModalInfo, workersToCall, setWorkersToCall}) => {
    const fetch = useAuthFetch()
    return <FormModal
        show={callWorkerModalInfo.active}
        createBtnText={"Send"}
        onClose={() => setCallWorkerModalInfo({active: false, station: undefined}) || setWorkersToCall({})}
        onSave={async () => {
            const workerIds = Object.keys(workersToCall);
            const response = await fetch("api/notifications", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-allow-response": "allow",
                },
                body: JSON.stringify({
                    title: "You are needed by your station!",
                    recipients: workerIds
                })
            });
            if (response.ok) {
                showToast(
                    "Notification sent",
                    "",
                    `Notification was successfully dispatched.`,
                    "Success"
                );
            } else {
                showToast(
                    "Error",
                    "",
                    `Failed to send notification.`,
                    "Danger"
                );
            }
        }}
    >

        <StudentTable station={callWorkerModalInfo.station} columns={
            [{
                cell: ((row) => {
                    if (row.stations.find((elmnt) => elmnt.stationId == callWorkerModalInfo.station._id)?.isLeader) return (
                        <i className="bi bi-award fs-3"></i>
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
                    name: "Firstname",
                    selector: (row) => row.firstname,
                    sortable: true,
                    filterable: true,
                },
                {
                    name: "Lastname",
                    selector: (row) => row.lastname,
                    sortable: true,
                },
                {
                    cell: (row) => (
                        <FormCheck
                            checked={workersToCall[row._id]}
                            onChange={(e) => {
                                setWorkersToCall({...workersToCall, [row._id]: e.target.checked})
                            }}
                        >
                        </FormCheck>
                    ),
                    ignoreRowClick: true,
                    allowOverflow: true,
                    button: true,
                }]
        }></StudentTable>

    </FormModal>
}