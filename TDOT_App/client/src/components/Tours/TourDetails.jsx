import PropTypes from "prop-types";
import { useAuthFetch } from "../../lib/MSAL";
import { useQuery } from "@tanstack/react-query";
import ClientError from "../Errors/ClientError";
import TourFeedbackOverview from "./TourFeedbackOverview";
import Loading from "../Loading";
import { Spinner, Table } from "react-bootstrap";
import { useMemo } from "react";
import List from "../StudentList/List";
import { createColumnHelper } from "@tanstack/react-table";
import { Link } from "react-router-dom";

function GuideInfo({ guideId }) {
    const fetch = useAuthFetch();

    const { data: guide, isFetching: guideIsFetching } = useQuery({
        queryKey: ["guide", guideId],
        queryFn: async () => {
            const resp = await fetch(`/api/students/${guideId}`);

            if (!resp.ok) {
                const error = new Error(
                    "An error occurred while fetching the data."
                );
                error.info = await resp.json();
                error.status = resp.status;
                throw error;
            }

            return await resp.json();
        },
    });

    return (
        <div>
            {guideIsFetching ? (
                <Spinner variant="secondary" />
            ) : !guide ? (
                "Not available"
            ) : (
                <p>
                    {guide.firstname} {guide.lastname} ({guide.shortform})
                </p>
            )}
        </div>
    );
}

GuideInfo.propTypes = {
    guideId: PropTypes.string.isRequired,
};

function StationLink({ stationId }) {
    const fetch = useAuthFetch();
    const { data: station, isFetching } = useQuery({
        queryKey: ["station", stationId],
        queryFn: async () => {
            const resp = await fetch(`/api/stations/${stationId}`);

            if (!resp.ok) {
                const error = new Error(
                    "An error occurred while fetching the data."
                );
                error.info = await resp.json();
                error.status = resp.status;
                throw error;
            }

            return await resp.json();
        },
    });

    if (isFetching) return <Spinner variant="secondary" />;
    return <Link to={`/stations/${stationId}`}>{station.name}</Link>;
}

StationLink.propTypes = {
    stationId: PropTypes.string.isRequired,
};

function VisitorInfo({ visitorId }) {
    const fetch = useAuthFetch();
    const { data: visitor, isFetching } = useQuery({
        queryKey: ["visitor", visitorId],
        queryFn: async () => {
            const resp = await fetch(`/api/visitors/${visitorId}`);

            if (!resp.ok) {
                const error = new Error(
                    "An error occurred while fetching the data."
                );
                error.info = await resp.json();
                error.status = resp.status;
                throw error;
            }

            return await resp.json();
        },
    });

    if (isFetching) return <Spinner variant="secondary" />;
    return (
        <>
            <td>{visitor.name}</td>
            <td>{visitor.age}</td>
            <td>{visitor.email}</td>
            <td>{visitor.address}</td>
            <td>{visitor.phone}</td>
        </>
    );
}

VisitorInfo.propTypes = {
    visitorId: PropTypes.string.isRequired,
};

function TourDetails({ url, privileged }) {
    const fetch = useAuthFetch();
    const { data, error, isFetching } = useQuery({
        queryKey: ["tour", url],
        queryFn: async () => {
            const resp = await fetch(url);

            if (!resp.ok) {
                const error = new Error(
                    "An error occurred while fetching the data."
                );
                error.info = await resp.json();
                error.status = resp.status;
                throw error;
            }

            return await resp.json();
        },
    });

    const stationsTableColumns = useMemo(() => {
        const columnHelper = createColumnHelper();

        return [
            columnHelper.accessor("id", {
                id: "station",
                header: "Station",
                enableColumnFilter: false,
                cell: (c) => <StationLink stationId={c.getValue()} />,
            }),
            columnHelper.accessor("time.start", {
                id: "time.start",
                header: "Start Time",
                cell: (c) =>
                    c.getValue() ? new Date(c.getValue()).toLocaleString() : "",
                enableColumnFilter: false,
            }),
            columnHelper.accessor("time.end", {
                id: "endTime",
                header: "End Time",
                cell: (c) =>
                    c.getValue() ? new Date(c.getValue()).toLocaleString() : "",
                enableColumnFilter: false,
            }),
        ];
    }, []);

    if (isFetching) return <Loading />;

    if (error)
        return (
            <ClientError title="Error fetching tour">
                {error.message}
            </ClientError>
        );

    console.log(data);

    return (
        <div>
            <h1>Tour Details</h1>
            <h2 className="fs-5 text-secondary">
                {new Date(data.startTime).toLocaleDateString()}
                <br />
                {new Date(data.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                })}
                {" - "}
                {new Date(data.endTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                })}
            </h2>
            <h2>Guide</h2>
            <GuideInfo guideId={data.guide} />
            <div>
                <h2>Visitors</h2>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Age</th>
                            <th>E-Mail</th>
                            <th>Address</th>
                            <th>Phone</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.visitors.map((visitor) => (
                            <tr key={visitor}>
                                <VisitorInfo visitorId={visitor} />
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
            <div>
                <List
                    title="Stations"
                    columns={stationsTableColumns}
                    data={data.stations}
                />
            </div>
            <TourFeedbackOverview
                feedbacks={data.feedbacks}
                getDeleteUrl={
                    privileged
                        ? (id) => `/api/tours/${data._id}/feedback/${id}`
                        : undefined
                }
            />
        </div>
    );
}

TourDetails.propTypes = {
    url: PropTypes.string.isRequired,
    privileged: PropTypes.bool,
};

export default TourDetails;
