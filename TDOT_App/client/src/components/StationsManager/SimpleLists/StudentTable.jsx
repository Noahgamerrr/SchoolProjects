import PropTypes from "prop-types";
import DataTable from "react-data-table-component";
import Button from "react-bootstrap/Button";
import { useAuthFetch } from "../../../lib/MSAL";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
export default function StudentTable({ station, updateStation, columns }) {

    //const [students, setStudents] = useState([]);

    const navigate = useNavigate();

    const fetch = useAuthFetch();

    const { data } = useQuery({
        initialData: [],
        queryKey: ["students", "all"],
        queryFn: () => fetch("/api/students").then((res) => res.json()),
    });

    function viewIndex(idx) {
        console.log("Row is: " + idx);
        navigate("/students/" + idx._id +"/stations");
    }

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
            setStudents(
                  await get(studentURL)
              );
          } catch (error) {
              setStudents([]);
          }
      })();
  }, [isAuthenticated, fetch, station]);*/

    if(!columns) columns = [
        {
            cell: ((row) => {
                if (row.stations.find((elmnt) => elmnt.stationId == station._id)?.isLeader) return (
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
                <Button
                    className="btn-secondary"
                    onClick={() => viewIndex(row)}
                >
                    <i className="bi bi-eye"></i>
                </Button>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={data.filter((st) => {
                console.log("All ids: "+st.stations?.map((std) => std.stationId)+"\n - This id: "+station._id )

                return st.stations?.map((std) => std.stationId).includes(station._id);
            })}
        />
    );
}

StudentTable.propTypes = {
    station: PropTypes.array,
};
