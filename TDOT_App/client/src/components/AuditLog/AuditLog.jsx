import { useQuery } from "@tanstack/react-query";
import { useAuthFetch } from "../../lib/MSAL";
import {useState} from "react";
import Loading from "../Loading";
import { Table } from "react-bootstrap"
import "./AuditLog.css";

export default function AuditLog() {
    const fetch = useAuthFetch();
    const [searchTerm, setSearchTerm] = useState("");

    const { data: entries, loading: logLoading } = useQuery({
        queryKey: ["audit-log", "entries"],
        queryFn: async () => {
            const response = await fetch("/api/audit-log/");
            const data = await response.json();
            return data;
        },
        refetchInterval: 5000,
    });

    const { data: stations, loading: stationsLoading } = useQuery({
        queryKey: ["audit-log", "stations"],
        queryFn: async () => {
            const response = await fetch("/api/stations/");
            const data = await response.json();
            return data;
        },
        refetchInterval: 5000
    })

    if (logLoading || stationsLoading) return <Loading/>;

    function getDateString(dateStr) {
        const date = new Date(Date.parse(dateStr));
        let hours = date.getHours();
        if (hours < 10) hours = "0" + hours;
        let minutes = date.getMinutes();
        if (minutes < 10) minutes = "0" + minutes;
        let seconds = date.getSeconds();
        if (seconds < 10) seconds = "0" + seconds;
        return `${hours}:${minutes}.${seconds}`;
    }

    const filteredEntries = entries?.filter(e => 
        e.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    function LogChanges({changes}) {
        const fieldsToExclude = ["_id", "__v", "visitorsAtTime"]
        switch (changes.changeType) {
            case "reorderStations":
                const before = changes.before.reduce((acc, curr) => {
                    if (acc[curr.order - 1]) acc[curr.order - 1].push(stations.find(s => s._id == curr.id).name);
                    else acc[curr.order - 1] = [stations.find(s => s._id == curr.id).name]
                    return acc;
                }, []);
                const after = changes.after.reduce((acc, curr) => {
                    if (acc[curr.order - 1]) acc[curr.order - 1].push(stations.find(s => s._id == curr.id).name);
                    else acc[curr.order - 1] = [stations.find(s => s._id == curr.id).name]
                    return acc;
                }, []);
                const len = Math.max(before.length, after.length);
                const rows = [];
                for (let i = 0; i < len; i++) {
                    rows.push(
                        <tr>
                            <td>{i + 1}</td>
                            <td>{before[i]?.map(e => <div>{e}</div>)}</td>
                            <td>{after[i]?.map(e => <div>{e}</div>)}</td>
                        </tr>
                    )
                }
                return <Table striped bordered>
                    <thead>
                        <tr>
                            <th>Order</th>
                            <th>Before</th>
                            <th>After</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>
                </Table>
            case "add":
                return <div>
                    {Object.keys(changes.after).filter(k => !fieldsToExclude.includes(k)).map(e => 
                        <div>
                            <span className="fw-bold">{e}: </span>
                            <span className="text-success">{
                                typeof changes.after[e] != "boolean" ?
                                changes.after[e] :
                                changes.after[e] ? "yes" : "no"
                            }</span>
                        </div>
                    )}
                </div>
            case "delete":
                return <div>
                    {Object.keys(changes.before).filter(k => !fieldsToExclude.includes(k)).map(e => 
                        <div>
                            <span className="fw-bold">{e}: </span>
                            <span className="text-danger text-decoration-line-through">
                                {
                                    typeof changes.before[e] != "boolean" ?
                                    changes.before[e] :
                                    changes.before[e] ? "yes" : "no"
                                }
                            </span>
                        </div>
                    )}
                </div>
            case "addTourFeedback":
                return <div>
                    {Object.keys(changes.after).map(e =>
                        <div>
                            <span className="fw-bold">{e}: </span>
                            <span className="text-success">{
                                e == "favouriteStation" ?
                                stations.find(s => s._id == changes.after[e]).name :
                                changes.after[e]
                            }</span>
                        </div>
                    )}
                </div>
            case "deleteTourFeedback":
                return <div>
                    {Object.keys(changes.before).map(e =>
                        <div>
                            <span className="fw-bold">{e}: </span>
                            <span className="text-danger text-decoration-line-through">{
                                e == "favouriteStation" ?
                                stations.find(s => s._id == changes.before[e]).name :
                                changes.before[e]
                            }</span>
                        </div>
                    )}
                </div>
            case "import":
                return <>
                    <h3>Faulty imports:</h3>
                    <Table striped bordered>
                        <thead>
                            <tr>
                                <th>Firstname</th>
                                <th>Lastname</th>
                                <th>Shortform</th>
                            </tr>
                        </thead>
                        <tbody>
                            {changes.faulty.map(f => <tr>
                                <td>{f.firstname}</td>
                                <td>{f.lastname}</td>
                                <td>{f.shortform}</td>
                            </tr>)}
                        </tbody>
                    </Table>
                </>
            case "addVisitors":
                return <Table striped bordered>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Address</th>
                                <th>School</th>
                                <th>Grade</th>
                                <th>Potential first-grader?</th>
                            </tr>
                        </thead>
                        <tbody>
                            {changes.after.map(v => <tr>
                                <td>{v.name}</td>
                                <td>{v.email}</td>
                                <td>{v.phone}</td>
                                <td>{v.address}</td>
                                <td>{v.school}</td>
                                <td>{v.grade}</td>
                                <td>{v.potential ? "yes" : "no"}</td>
                            </tr>)}
                        </tbody>
                    </Table>
            default: 
                const defaultRows = [];
                const beforeKeys = Object.keys(changes.before).filter(k => !fieldsToExclude.includes(k));
                const afterKeys = Object.keys(changes.before).filter(k => !fieldsToExclude.includes(k));
                for (let key of beforeKeys) {
                    let isEqual = changes.before[key] == changes.after[key];
                    defaultRows.push(
                        <tr>
                            <td className="fw-bold">{key}</td>
                            <td 
                                className={!isEqual && "text-danger text-decoration-line-through"}
                            >
                                {   
                                    Array.isArray(changes.before[key]) ?
                                    changes.before[key].map(e => <div>{e}</div>) :
                                    changes.before[key]
                                }
                            </td>
                            <td className={!isEqual && "text-success"}>
                                {
                                    Array.isArray(changes.after[key]) ?
                                    changes.after[key].map(e => <div>{e}</div>) :
                                    changes.after[key]
                                }
                            </td>
                        </tr>
                    )
                }
                for (let key of afterKeys.filter(k => !beforeKeys.includes(k))) {
                    defaultRows.push(
                        <tr>
                            <td className="fw-bold">{key}</td>
                            <td></td>
                            <td className="text-success">{changes.after[key]}</td>
                        </tr>
                    )
                }
                return <Table striped bordered>
                    <thead>
                        <tr>
                            <th>Order</th>
                            <th>Before</th>
                            <th>After</th>
                        </tr>
                    </thead>
                    <tbody>
                        {defaultRows}
                    </tbody>
                </Table>
        }
    }

    function LogEntry({entry}) {
        const [expanded, setExpanded] = useState(false);
        return <div key={entry._id} className="border-3 rounded-3 mx-4 p-3 mb-3 mt-3 shadow">
            <small className="text-muted">{getDateString(entry.createdAt)}, {entry.responsible}</small>
            <p className="mb-0 fw-bold">{entry.message}</p>
            {
                entry.changes &&
                <div className="w-100">
                    <i 
                        className={`bi ${expanded ? "bi-chevron-double-up" : "bi-chevron-double-down"} d-block text-center mb-2`}
                        onClick={() => setExpanded(!expanded)}
                    ></i>
                    {
                        expanded && 
                        <LogChanges changes={entry.changes}/>
                    }  
                </div>
            }
        </div>
    }

    return (
        <div className="h-100 p-4">
            <h1 className="text-center mb-4">Audit Log</h1>
            <input 
                type="text" 
                className="form-control" 
                placeholder="Search audit messages..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="d-flex flex-column-reverse overflow-auto custom-scroll" style={{ maxHeight: "80vh" }}>
                {filteredEntries?.map((e) => (
                    <LogEntry entry={e}/>
                ))}
            </div>
        </div>
    );
}
