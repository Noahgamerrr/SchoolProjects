import PropTypes from "prop-types";
import { useState } from "react";
import { Table } from "react-bootstrap";

export default function StationVisits({ stationVisits }) {
    const [sortTable, setSortTable] = useState(0);

    const stations = stationVisits ? Object.keys(stationVisits) : [];

    const sortAverageTimeSpent = (a, b) => {
        const minsA = parseInt(stationVisits[a].averageTimeSpent.split("min")[0]);
        const secsA = parseInt(stationVisits[a].averageTimeSpent.split("min")[1].split("sec")[0]);
        const minsB = parseInt(stationVisits[b].averageTimeSpent.split("min")[0]);
        const secsB = parseInt(stationVisits[b].averageTimeSpent.split("min")[1].split("sec")[0]);
        return minsA - minsB || secsA - secsB;
    }
 

    switch (sortTable) {
        case 'nameDesc': stations.sort((a,b) => stationVisits[b].name.localeCompare(stationVisits[a].name))
            break;
        case 'nameAsc': stations.sort((a,b) => stationVisits[a].name.localeCompare(stationVisits[b].name))
            break;
        case 'visitsDesc': stations.sort((a, b) => stationVisits[b].timesVisited - stationVisits[a].timesVisited);
            break;
        case 'visitsAsc': stations.sort((a, b) => stationVisits[a].timesVisited - stationVisits[b].timesVisited);
            break;
        case 'timeDesc': stations.sort((a, b) => sortAverageTimeSpent(b, a));
            break;
        case 'timeAsc': stations.sort(sortAverageTimeSpent);
            break;
    }

    const totalVisits = stations
        .reduce((acc, curr) => acc + stationVisits[curr].timesVisited, 0);

    return (
        <>
            <h2>Stations</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th className="w-25" onClick={() => setSortTable(sortTable == 'nameDesc'  ? 'nameAsc': 'nameDesc')}>
                            Station
                            {sortTable == 'nameDesc' && <i className="bi bi-caret-up-fill float-end"></i>}
                            {sortTable == 'nameAsc' && <i className="bi bi-caret-down-fill float-end"></i>}
                    
                        </th>
                        <th className="w-25" onClick={() => setSortTable(sortTable == 'visitsDesc' ? 'visitsAsc': 'visitsDesc')}>
                            Times visited
                            {sortTable =='visitsDesc' && <i className="bi bi-caret-up-fill float-end"></i>}
                            {sortTable == 'visitsAsc' && <i className="bi bi-caret-down-fill float-end"></i>}
                        </th>
                        <th className="w-25" onClick={() => setSortTable(sortTable == 'timeDesc' ? 'timeAsc': 'timeDesc')}>
                            Average time spent
                            {sortTable == 'timeDesc' && <i className="bi bi-caret-up-fill float-end"></i>}
                            {sortTable == 'timeAsc' && <i className="bi bi-caret-down-fill float-end"></i>}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {stations.map(st => (
                        <tr key={st}>
                            <td>{stationVisits[st].name}</td>
                            <td>{stationVisits[st].timesVisited}</td>
                            <td>{stationVisits[st].averageTimeSpent}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className="fw-bold">
                    <tr>
                        <td></td>
                        <td>Total: {totalVisits}</td>
                    </tr>
                </tfoot>
            </Table>
        </>
    )
}

StationVisits.propTypes = {
    stationVisits: PropTypes.object
}
