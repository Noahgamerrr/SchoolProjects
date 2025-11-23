import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import List from "../StudentList/List";
import {createColumnHelper} from "@tanstack/react-table";
import {showToast} from "../Toasts/ToastContainer.jsx";
import ConfirmationModal from "../Modal/ConfirmationModal.jsx";
import Papa from "papaparse";
import {useEffect, useMemo, useState} from "react";
import {useAuthFetch} from "../../lib/MSAL.js";

export default function StudentDataImportForm() {
    const [students, setStudents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [validated, setValidated] = useState(false);
    const fetch = useAuthFetch();

    const handleUpload = async () => {
        await fetch("/api/students/fill", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                accept: "application/json",
            },
            body: JSON.stringify(students),
        })
            .catch((e) => showToast("Error", "", e, "Danger"))
            .then((res) => {
                res.json()
                    .catch((e) => showToast("Error", `${res.status} ${res.statusText}`,
                        e.message, "Danger") || setValidated(false))
                    .then((body) => {
                        showToast(
                            "Success",
                            `${res.status} ${res.statusText}`,
                            `import successful, ${body.errors?.length || 0}  errors`,
                            body.errors ? "Warning" : "Success"
                        );
                    });
            });
        // handle response here if you want to be fancy
    };

    const setValidStudents = (parsedCSV) => {
        const parsedStudents = [...parsedCSV.data].map((s, i) => {
            return {...s, index: i};
        });
        for (const s of parsedCSV.errors)
            parsedStudents[s.row].invalid = {
                firstname: true,
                lastname: true,
                shortform: true,
            };

        const scannedData = [];
        const stations = []
        for (const i in parsedStudents) {
            const s = parsedStudents[i];

            // check for semantic errors here
            // check for uniqueness and char limit of shortforms
            if (
                scannedData.includes(s.shortform) ||
                !/^.{2,8}$/.test(s.shortform)
            ) {
                (s.invalid || (s.invalid = {})).shortform = true;
                scannedData
                    .filter(({shortform}) => shortform == s.shortform)
                    .map(({index}) => parsedStudents[index])
                    .forEach((s2) => {
                        (s2.invalid || (s2.invalid = {})).shortform = true;
                    });
            }
            if (!/^.+$/.test(s.firstname))
                (s.invalid || (s.invalid = {})).firstname = true;
            if (!/^.+$/.test(s.lastname))
                (s.invalid || (s.invalid = {})).lastname = true;
            if (!/^.+$/.test(s.station))
                (s.invalid || (s.invalid = {})).station = true;


            scannedData
                .filter(({station, team, isLeader}) => isLeader && station == s.station && team == s.team && s.isLeader)
                .map(({index}) => parsedStudents[index])
                .forEach((s2) => {
                    (s2.invalid || (s2.invalid = {})).station = true;
                    (s2.invalid || (s2.invalid = {})).isLeader = true;
                    (s.invalid || (s.invalid = {})).station = true;
                    (s.invalid || (s.invalid = {})).isLeader = true;
                });

            scannedData.push({shortform: s.shortform, station: s.station, team: s.team, isLeader: s.isLeader, index: i});
        }

        setStudents(parsedStudents);
    };

    // define columns for list
    const getCell = (field) => {
        return (prop) => {
            const [value, setValue] = useState(prop.getValue());
            return (
                <Form.Control
                    className={`${prop.row.original.invalid ? prop.row.original.invalid[field] ? "bg-danger" : "" : ""} d-block`}
                    value={value}
                    onChange={({target}) =>
                        setValue(target.value) || setValidated(false)
                    }
                    onBlur={() =>
                        setStudents(
                            Array.from(
                                Object.values({
                                    ...students,
                                    [prop.row.original.index]: {
                                        ...students[
                                            prop.row.original.index
                                            ],
                                        [field]: value,
                                    },
                                })
                            )
                        )
                    }
                ></Form.Control>
            );
        }
    }


    const columnHelper = createColumnHelper();
    const columns = [
        columnHelper.accessor("firstname", {
            header: "First Name",
            cell: getCell("firstname"),
        }),
        columnHelper.accessor("lastname", {
            header: "Last Name",
            cell: getCell("Nachname"),
        }),
        columnHelper.accessor("shortform", {
            header: "Shortform",
            cell: getCell("shortform"),
        }),
        columnHelper.accessor("station", {
            header: "Station",
            cell: getCell("station"),
        }),
        columnHelper.accessor("team", {
            header: "Team",
            cell: getCell("team"),
        }),
        columnHelper.accessor("isLeader", {
            header: "Leader",
            cell: getCell("isLeader"),
        }),
    ];

    return (
        <>
            <Form>
                <Form.Group className={"mx-lg-0"}>
                    <Form.Control
                        type={"file"}
                        accept=".csv"
                        onChange={async (event) => {
                            const file = event.target.files[0];
                            const parsedCSV = await Papa.parse(
                                new TextDecoder("ISO-8859-15").decode(await file.arrayBuffer()), // decode from iso 8859-15
                                {header: true}
                            );
                            console.log(parsedCSV);
                            const studentMapper = (student) => {
                                return {
                                    firstname: student.Vorname,
                                    lastname: student.Nachname,
                                    shortform: student.Nachname?.substring(0, 7) + student.Vorname?.charAt(0),
                                    station: student.Einteilung1,
                                    team: student.Team,
                                    isLeader: student.Lead
                                }
                            }

                            const trueData = {
                                ...parsedCSV,
                                data: parsedCSV.data.map(studentMapper),
                            }
                            console.log(trueData)
                            setValidStudents(trueData);
                        }}
                    ></Form.Control>
                    <Button
                        type={"button"}
                        variant={"primary"}
                        className={"mt-3 mb-3 btn btn-primary"}
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title={!validated ? "Validate first to upload" : ""}
                        disabled={students.length == 0 || !validated}
                        onClick={() => setShowModal(true)}
                    >
                        Upload
                    </Button>
                    <ConfirmationModal
                        show={showModal}
                        title={"Confirm student import"}
                        message={
                            "Do you want to import the students and update existing ones? " +
                            `There are ${students.filter((s) => s.invalid).length} faulty entries.`
                        }
                        onConfirm={handleUpload}
                        onCancel={() => setShowModal(false)}
                        confirmColor="warning"
                    />
                    <Button
                        type={"button"}
                        variant={"secondary"}
                        className={"mt-3 mb-3 ms-3"}
                        disabled={students.length == 0}
                        onClick={() => {
                            setValidStudents({
                                data: students.map((s) => ({
                                    ...s,
                                    invalid: undefined,
                                })),
                                errors: [],
                            })
                            setValidated(true);
                        }
                        }
                    >
                        Validate
                    </Button>
                    {students.find((s) => s.invalid) && (
                        <List
                            title="Errors"
                            columns={columns}
                            data={students.filter((s) => s.invalid)}
                        />
                    )}
                    <List
                        title="Students"
                        columns={columns}
                        data={students.filter((s) => !s.invalid)}
                    />
                </Form.Group>
            </Form>
        </>
    );
}
