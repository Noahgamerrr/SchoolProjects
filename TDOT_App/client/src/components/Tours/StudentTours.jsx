import { useQuery } from "@tanstack/react-query";
import Loading from "../Loading";
import PropTypes from "prop-types";
import { useAuthFetch } from "../../lib/MSAL";
import List from "../StudentList/List";
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import FeedbackAverage from "../Feedback/FeedbackAverage";
import ClientError from "../Errors/ClientError";

function StudentTours({ studentId }) {
    const fetch = useAuthFetch();
    const navigate = useNavigate();
    const { data, error, isFetching } = useQuery({
        queryKey: ["studentTours", studentId],
        queryFn: async () => {
            const response = await fetch(`/api/students/${studentId}/tours`);
            if (!response.ok) {
                const error = new Error(
                    "An error occurred while fetching the data."
                );
                error.info = await response.json();
                error.status = response.status;
                throw error;
            }
            return (await response.json()).sort(
                (a, b) =>
                    new Date(b.startTime).getTime() -
                    new Date(a.startTime).getTime()
            );
        },
    });

    const { data: student, error: studentError } = useQuery({
        queryKey: ["student", studentId],
        queryFn: async () => {
            const response = await fetch(`/api/students/${studentId}`);
            if (!response.ok) {
                const error = new Error(
                    "An error occurred while fetching the data."
                );
                error.info = await response.json();
                error.status = response.status;
                throw error;
            }
            return await response.json();
        },
    });

    const columns = useMemo(() => {
        const columnHelper = createColumnHelper();

        return [
            columnHelper.accessor("startTime", {
                id: "startTime",
                header: "Start Time",
                cell: (c) =>
                    c.getValue() ? new Date(c.getValue()).toLocaleString() : "",
                sortingFn: (a, b) =>
                    new Date(a.getValue("startTime")).getTime() -
                    new Date(b.getValue("startTime")).getTime(),
                enableColumnFilter: false,
                enableSorting: true,
            }),
            columnHelper.accessor("endTime", {
                id: "endTime",
                header: "End Time",
                cell: (c) =>
                    c.getValue() ? new Date(c.getValue()).toLocaleString() : "",
                sortingFn: (a, b) =>
                    new Date(a.getValue("endTime")).getTime() -
                    new Date(b.getValue("endTime")).getTime(),
                enableColumnFilter: false,
                enableSorting: true,
            }),
            columnHelper.accessor("stations", {
                id: "stations",
                header: "Stations",
                cell: (c) => c.getValue().length,
                enableColumnFilter: false,
                enableSorting: true,
                sortingFn: (a, b) =>
                    a.getValue("stations").length -
                    b.getValue("stations").length,
            }),
            columnHelper.accessor("visitors", {
                id: "visitors",
                header: "Visitors",
                cell: (c) => c.getValue().length,
                enableColumnFilter: false,
                enableSorting: true,
                sortingFn: (a, b) =>
                    a.getValue("visitors").length -
                    b.getValue("visitors").length,
            }),
            columnHelper.accessor("feedbacks", {
                id: "feedbacks",
                header: "Rating",
                cell: (c) => (
                    <FeedbackAverage
                        avg={
                            c
                                .getValue()
                                .reduce((sum, curr) => sum + curr.rating, 0.0) /
                            c.getValue().length
                        }
                    />
                ),
            }),
        ];
    }, []);

    if (error)
        return (
            <ClientError title={"Error fetching tours"}>
                {error.message}
            </ClientError>
        );
    if (studentError)
        return (
            <ClientError title={"Error fetching student"}>
                {studentError.message}
            </ClientError>
        );
    if (isFetching) return <Loading />;

    // console.table(data);

    return (
        <List
            title={`Tours of ${student?.firstname} ${student?.lastname}`}
            data={data}
            columns={columns}
            tableRowClassName={() => "pe-auto"}
            onRowClick={(row) => {
                navigate(`/students/${studentId}/tours/${row.id}`);
            }}
        />
    );
}

StudentTours.propTypes = {
    studentId: PropTypes.string.isRequired,
};

export default StudentTours;
