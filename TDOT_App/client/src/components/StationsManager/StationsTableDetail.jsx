import { useState } from "react";
import React from "react";
import Form from "react-bootstrap/Form";
import StudentTable from "./SimpleLists/StudentTable";
import TDOTTable from "./SimpleLists/TDOTTable";
import Button from "react-bootstrap/Button";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ConfirmationModal from "../Modal/ConfirmationModal";

import { useAuthFetch } from "../../lib/MSAL";
import InteractionDropdown from "./UtilityComponents/InteractionDropdown";
import Loading from "../Loading";
import FeedbackOverview from "../Feedback/FeedbackOverview";
import { showToast } from "../Toasts/ToastContainer";

export default function StationsTableDetail() {
    const [stationCopy, setStationCopy] = useState(null);
    const [savedTag, setSavedTag] = useState("");
    const [deleteConfirmation, setDeleteConfirmation] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();
    const queryClient = useQueryClient();
    const fetch = useAuthFetch();

    function changeAttribute(attr, value) {
        let newObj = { ...stationCopy };
        newObj[attr] = value;

        setStationCopy(newObj);
    }

    function onInput(evt) {
        const val = evt.target.value;

        let newObj = { ...stationCopy };

        newObj[evt.target.name] = val;

        if (newObj.maxWorkers) {
            if (newObj.minWorkers > newObj.maxWorkers)
                newObj.maxWorkers = newObj.minWorkers;
        }

        setStationCopy(newObj);
    }

    function onInputTag(evt) {
        const val = evt.target.value;

        setSavedTag(val);
    }


    function onAddTag(value) {
        let station = { ...stationCopy };

        if (!station.tags.includes(value)) {
            station.tags.push(value);
        } else {
            showToast(
                "Failure",
                "Failed to add tag",
                `Tag "` + savedTag + '" is already present.',
                "Danger"
            );
        }

        setStationCopy(station);
    }

    function onRemoveTag(idx) {
        let station = { ...stationCopy };
        showToast(
            "Success",
            "Removed tag",
            `Tag "` + station.tags[idx] + '" has been removed.',
            "Success"
        );
        station.tags.splice(idx, 1);

        setStationCopy(station);
    }

    function updateStation(stt) {
        setStationCopy(stt);
    }

    async function onSave() {
        let savedst = stationCopy;
        if (stationCopy.capacity < 1) {
            savedst = { ...stationCopy };
            savedst.capacity = 1;
            setStationCopy(savedst);
        }

        const response = await fetch("/api/stations/" + id, {
            method: "PUT",
            headers: {
                "Content-Type": `application/json`,
            },
            body: JSON.stringify(savedst),
        });

        await queryClient.invalidateQueries(["stations"]);
        if (response.ok) {
            showToast(
                "Success",
                "Openday Saved",
                'Saved openday "' + stationCopy?.name + '"',
                "Success"
            );
            navigate("/stations");
        }
    }

    async function addCurrentOpenday() {
        console.log("Adding current openday");
        const response = await fetch("/api/opendays/active", {
            method: "GET",
        });

        if (response.ok) {
            let res = await response.json();
            let newStation = { ...stationCopy };
            showToast(
                "Success",
                "Linked Openday",
                'Linked "' + stationCopy?.name + '" with current openday',
                "Success"
            );
            if (!newStation.assignedOpenDays.find((e) => e._id == res._id)) {
                newStation.assignedOpenDays.push(res._id);
                setStationCopy(newStation);
            }
        }
    }

    function onPressDelete() {
        setDeleteConfirmation(true);
    }

    async function onDelete() {
        const response = await fetch("/api/stations/" + id, {
            method: "DELETE",
        });

        if (response.ok) {
            showToast(
                "Success",
                "Station Deleted",
                `Deleted "` + stationCopy?.name + '"',
                "Success"
            );
            navigate("/stations");
        }
    }

    const { data: station } = useQuery({
        queryKey: ["stations", id],
        queryFn: async () => {
            const response = await fetch("/api/stations/" + id);
            const data = await response.json();
            return data;
        },
        staleTime: Infinity,
    });

    if (!station) return <Loading />;
    if (!stationCopy) setStationCopy(station);
    console.log("Selected should be: " + station.interactType);

    return (
        <div>
            <h2>Detailed View</h2>
            <ConfirmationModal
                show={deleteConfirmation}
                onCancel={() => setDeleteConfirmation(false)}
                title="Delete Station"
                message={
                    'Are you sure that you want to delete "' +
                    stationCopy?.name +
                    '"'
                }
                onConfirm={() => {
                    onDelete();
                    setDeleteConfirmation(false);
                }}
            />
            <React.Fragment>
                <Button
                    className="d-inline btn-secondary my-1"
                    onClick={() => navigate("/stations")}
                >
                    Back <i className="bi bi-arrow-return-left"></i>
                </Button>
                <Form.Group>
                    <Form.Control
                        readonly
                        type="hidden"
                        name="id"
                        value={stationCopy?._id}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        type="text"
                        name="name"
                        value={stationCopy?.name}
                        onChange={(evt) => onInput(evt)}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        name="description"
                        value={stationCopy?.description}
                        onChange={(evt) => onInput(evt)}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Capacity</Form.Label>
                    <Form.Control
                        type="number"
                        name="capacity"
                        value={stationCopy?.capacity}
                        onChange={(evt) => onInput(evt, "capacity")}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label style={{ width: "100%" }}>
                        Min / Max Workers
                    </Form.Label>
                    <Form.Control
                        className="d-inline"
                        style={{ width: "45%", marginRight: "10%" }}
                        type="number"
                        name="minWorkers"
                        value={stationCopy?.minWorkers}
                        onChange={(evt) => onInput(evt)}
                    />
                    <Form.Control
                        className="d-inline"
                        style={{ width: "45%" }}
                        type="number"
                        name="maxWorkers"
                        value={stationCopy?.maxWorkers}
                        onChange={(evt) => onInput(evt)}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Room</Form.Label>
                    <Form.Control
                        type="text"
                        name="roomNr"
                        value={stationCopy?.roomNr}
                        onChange={(evt) => onInput(evt)}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Interaction Type</Form.Label>
                    <InteractionDropdown
                        selectedValue={stationCopy?.interactType}
                        onChangedHandler={changeAttribute}
                    />
                </Form.Group>
                <Form.Group>
                    <hr />
                    <Form.Label>Tags</Form.Label>
                    <div className="gap-1 d-flex">
                        {stationCopy?.tags.map((elmt, idx) => {
                            return (
                                <Button
                                    key={elmt}
                                    className="btn-secondary my-1 text-small"
                                >
                                    {elmt}{" "}
                                    <Button
                                        onClick={() => onRemoveTag(idx)}
                                        className="btn-danger ml-2, p-0 px-1"
                                    >
                                        <i className="bi bi-x-lg"></i>
                                    </Button>
                                </Button>
                            );
                        })}
                    </div>

                    <hr />
                    <Form.Label>Add Tag</Form.Label>
                    <Form.Control
                        className="d-inline"
                        style={{ width: "45%" }}
                        type="text"
                        name="addTag"
                        value={savedTag}
                        onChange={(evt) => onInputTag(evt)}
                    />
                    <Button
                        onClick={() => onAddTag(savedTag)}
                        className="d-inline"
                        style={{ marginRight: "10%" }}
                    >
                        <i className="bi bi-plus-lg"></i>
                    </Button>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Assigned Opendays</Form.Label>
                    <TDOTTable
                        station={stationCopy}
                        updateStation={updateStation}
                    ></TDOTTable>
                    <Button
                        className="btn-success my-1"
                        title="Add Active Openday"
                        onClick={addCurrentOpenday}
                    >
                        Add Current
                    </Button>
                </Form.Group>
                <Form.Group className="mt-3">
                    <Form.Label>Assigned Students</Form.Label>
                    <StudentTable station={stationCopy}></StudentTable>
                </Form.Group>
                <div className="d-flex flex-column align-items-left">
                    <Button className="btn-danger my-1" onClick={onPressDelete}>
                        Delete <i className="bi bi-trash"></i>
                    </Button>
                    <Button className="btn-success my-1" onClick={onSave}>
                        Save <i className="bi bi-file-text"></i>
                    </Button>
                </div>
                <div className="mt-2">
                    <FeedbackOverview stationId={id} showDeleteButtons={true} />
                </div>
            </React.Fragment>
        </div>
    );
}
