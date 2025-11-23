import React from "react";
import Button from "react-bootstrap/esm/Button";
import AvailabilitySingle from "./AvailabilitySingle";
import Form from "react-bootstrap/esm/Form";
import PropTypes from "prop-types";

function AvailabilityAll({ students, aftersearchbox }) {
    const states = ["Available", "Tour", "Break", "Home"];
    const [activityFilter, setActivityFilter] = React.useState("");
    const [customFilter, setCustomFilter] = React.useState("");
    
    const sortByDate = (a, b) => Date.parse(b.time) - Date.parse(a.time);

    const filteredStudents = students
        .filter(student => student.activity?.length)
        .map(st => {
            st.activity.sort(sortByDate);
            return st;
        })
        .filter(
            (student) =>
                !activityFilter ||
                student.activity[0].activity === activityFilter
        )
        .filter((student) => {
            let fullname = `${student.lastname} ${student.firstname}`;
            return !customFilter || fullname.startsWith(customFilter);
        })
        .sort(
            (a, b) =>
                a.lastname.localeCompare(b.lastname) ||
                a.firstname.localeCompare(b.firstname)
        );
    const studentElements = filteredStudents.map((student) => (
        <AvailabilitySingle
            key={`${student.firstname} ${student.lastname}`}
            id={student._id}
            lastname={student.lastname}
            firstname={student.firstname}
            state={student.activity[0].activity}
        />
    ));

    const availabilityAmount = students
        .filter(student => student.activity?.length)
        .reduce(
            (acc, curr) => {
                curr.activity.sort(sortByDate);
                const state = curr.activity[0].activity.toLowerCase();
                if (acc[state] === undefined)
                    throw new Error("Unknown property '" + state + "'");
                acc[state]++;
                return acc;
            },
            {
                available: 0,
                tour: 0,
                break: 0,
                home: 0,
            }
        );

    const stateButtons = states.map((state) => {
        let icon = "";
        switch (state) {
            case "Available":
                icon = "bi bi-person-raised-hand";
                break;
            case "Tour":
                icon = "bi bi-person-walking";
                break;
            case "Break":
                icon = "bi bi-cup-hot-fill";
                break;
            case "Home":
                icon = "bi bi-house-fill";
                break;
            default:
                break;
        }
        return (
            <Button
                key={state}
                onClick={() => {
                    setActivityFilter(
                        activityFilter !== state.toLowerCase() &&
                            state.toLowerCase()
                    );
                }}
                variant={activityFilter === state.toLowerCase() ? "success" : "primary"}
            >
                <div>
                    <i
                        className={icon}
                        style={{
                            fontSize: "1.5em",
                        }}
                    />
                    <div className="text-sm">{state}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {availabilityAmount[state.toLowerCase()]}
                    </div>
                </div>
            </Button>
        );
    });

    return (
        <div className="h-100 d-flex flex-column flex-nowrap">
            <div className="bg-light-subtle p-2 rounded z-1">
                <div className="d-flex justify-content-center syp-w-c-6 syp-mx-c-1 mb-2">
                    {stateButtons}
                </div>
                <Form.Group className="fit-content m-auto d-flex align-items-center syp-mx-c-1">
                    <Form.Label>Search: </Form.Label>
                    <Form.Control
                        value={customFilter}
                        className={"ms-1"}
                        onChange={(event) =>
                            setCustomFilter(event.target.value)
                        }
                    />
                    {aftersearchbox}
                </Form.Group>
            </div>
            <div className="position-relative overflow-y-scroll">
                <div className="pt-2">{studentElements}</div>
            </div>
        </div>
    );
}

AvailabilityAll.propTypes = {
    students: PropTypes.array.isRequired,
    aftersearchbox: PropTypes.element,
};

export default AvailabilityAll;
