// https://tanstack.com/table/latest/docs/guide/tables
// https://muhimasri.com/blogs/react-editable-table/

import { useNavigate } from "react-router-dom";

import { useAuthFetch } from "../../lib/MSAL";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Form from "react-bootstrap/Form";

import Loading from "../Loading";
import ClientError from "../Errors/ClientError";
import StationRow from "./Modules/StationRow";
import { Button } from "react-bootstrap";

export default function StationsTable() {
    const fetch = useAuthFetch();
    const [filterType, setFilterType] = useState("none");
    const [tagFilter, setTagFilter] = useState("");
    const { data, error } = useQuery({
        queryKey: ["stations", "all"],
        queryFn: () => fetch("/api/stations").then((res) => res.json()),
    });

    const { data: openDay, error: openDayError} = useQuery({
        queryKey: ["openday"],
        queryFn: () => fetch("/api/opendays/active").then(res => res.json())
    });

    function onInput(evt) {
        const val = evt.target.value;

        setTagFilter(val);
    }

    if (error)
        return (
            <ClientError title="Error">
                <p>Failed to load stations</p>
            </ClientError>
        );
    if (!data) return <Loading />;

    if (openDayError)
        return (
            <ClientError title="Error">
                <p>Failed to load openDay</p>
            </ClientError>
        );
    if (!openDay) return <Loading />;

    function changeSortingRating() {
        if (filterType == "ratingAsc") setFilterType("ratingDesc");
        else if (filterType == "ratingDesc") {
            setFilterType("none");
        } else {
            setFilterType("ratingAsc");
        }
    }

    function changeSortingCap() {
        if (filterType == "capacityAsc") setFilterType("capacityDesc");
        else if (filterType == "capacityDesc") {
            setFilterType("none");
        } else {
            setFilterType("capacityAsc");
        }
    }
    let modData;

    if (tagFilter == "") {
        modData = data;
    } else {
        modData = data.filter((dte) =>
            dte.tags
                .map((tg) => tg.toLowerCase())
                .includes(tagFilter.toLowerCase())
        );
    }

    switch (filterType) {
        case "none":
            modData = modData.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case "ratingAsc":
            modData = modData.sort((a, b) => a.rating - b.rating);
            break;
        case "ratingDesc":
            modData = modData.sort((a, b) => a.rating - b.rating).reverse();
            break;
        case "capacityAsc":
            modData = modData.sort((a, b) => a.capacity - b.capacity);
            break;
        case "capacityDesc":
            modData = modData.sort((a, b) => a.capacity - b.capacity).reverse();
            break;
    }

    return (
        <div>
            <h2>Stations</h2>
            <div className="gap-2 d-flex">
                <h2> Tag: </h2>
                <Form.Control
                    style={{ width: "25%", marginRight: "10%" }}
                    type="text"
                    name="name"
                    value={tagFilter}
                    onChange={(evt) => onInput(evt)}
                />
            </div>
            <div className="gap-2 d-flex mt-2">
                <Button onClick={changeSortingRating} title="Sort by Rating">
                    <i className="bi bi-award"></i>
                    {filterType == "ratingAsc" ? (
                        <i className="bi bi-caret-up-fill"></i>
                    ) : filterType == "ratingDesc" ? (
                        <i className="bi bi-caret-down-fill"></i>
                    ) : (
                        <></>
                    )}
                </Button>
                <Button onClick={changeSortingCap} title="Sort by Person Count">
                    <i className="bi bi-person-plus-fill"></i>
                    {filterType == "capacityAsc" ? (
                        <i className="bi bi-caret-up-fill"></i>
                    ) : filterType == "capacityDesc" ? (
                        <i className="bi bi-caret-down-fill"></i>
                    ) : (
                        <></>
                    )}
                </Button>
            </div>

            {modData.length > 0 ? (
                modData.map((station) => <StationRow key={station} station={station} openday={openDay.date}/>)
            ) : (
                <div className="d-flex justify-content-center align-items-center h-100">
                    <h1 className="text-muted">No Stations found.</h1>
                </div>
            )}
        </div>
    );
}
