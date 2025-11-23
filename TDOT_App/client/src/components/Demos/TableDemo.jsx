import PropTypes from "prop-types";
import DataTable from 'react-data-table-component';

export default function TableDemo() {

    const ExpandedComponent = ({ data }) => <pre>{JSON.stringify(data, null, 2)}</pre>;

    const columns = [
        {
            name: 'Title',
            selector: row => row.title,
            sortable: true,
            filterable: true,
        },
        {
            name: 'Year',
            selector: row => row.year,
            sortable: true,
        },
    ];

    const data = [
        {
            id: 1,
            title: 'Beetlejuice',
            year: '1988',
        },
        {
            id: 2,
            title: 'Ghostbusters',
            year: '1984',
        },
    ]

    return (
        <DataTable
            columns={columns}
            data={data}
            selectableRows
            expandableRows
            expandableRowsComponent={ExpandedComponent}
        />
    )
}

TableDemo.propTypes = {
    data: PropTypes.array
}