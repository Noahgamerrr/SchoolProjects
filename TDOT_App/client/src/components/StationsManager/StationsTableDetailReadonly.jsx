import { useState } from "react";
import React from "react";
import Form from "react-bootstrap/Form";
import { CodeBlock } from "react-code-blocks";
import StudentTable from "./SimpleLists/StudentTable";
import TDOTTable from "./SimpleLists/TDOTTable";
import Button from "react-bootstrap/Button";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuthFetch } from "../../lib/MSAL";

export default function StationsTableDetailReadonly() {
    const navigate = useNavigate();
    const { id } = useParams();
    const queryClient = useQueryClient();
    const fetch = useAuthFetch();


    const [station, setStation] = useState({});

    useQuery({
        queryKey: ["stations", id],
        queryFn: async () => {
            const response = await fetch("/api/stations/" + id);
            const data = await response.json();
            setStation(data);
            return data;
        },
        staleTime: Infinity,
    });

    return (
        <div>
            <h2>Detailed View (Readonly)</h2>

            <React.Fragment>
                <Form.Group>
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        readonly
                        type="text"
                        name="skipper"
                        value={station.name}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        readonly
                        type="text"
                        name="length"
                        value={station.description}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Capacity</Form.Label>
                    <Form.Control
                        readonly
                        type="number"
                        name="length"
                        value={station.capacity}
                    />
                </Form.Group>
                <Form.Group className="mt-3">
                    <Form.Label>
                        Assigned Students Aus Datenschutzgründen nicht
                        verfügbar.
                    </Form.Label>
                </Form.Group>
                <div className="d-flex flex-column align-items-left">
                    <Button
                        className="btn-success my-1"
                        onClick={() => navigate("/stations")}
                    >
                        Back <i className="bi bi-arrow-return-left"></i>
                    </Button>
                </div>
            </React.Fragment>
        </div>
    );
}
