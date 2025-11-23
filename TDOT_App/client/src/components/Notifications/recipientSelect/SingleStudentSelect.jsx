import React from "react";
import { useQuery } from "@tanstack/react-query";
import Select from "react-select";
import { useAuthFetch } from "../../../lib/MSAL";
import reactSelectStyles from "./react-select-styles";

function SingleStudentSelect({ recipients, setRecipients }) {
    const fetch = useAuthFetch();

    const { data, isLoading, error } = useQuery({
        queryKey: "users",
        queryFn: async () => {
            const response = await fetch("/api/students");
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            return data.map((student) => ({
                value: student._id,
                label: `${student.firstname} ${student.lastname}`,
            }));
        },
    });

    return (
        <Select
            isMulti
            name="students"
            options={data}
            className="basic-multi-select"
            classNamePrefix="select"
            styles={reactSelectStyles}
            value={recipients}
            onChange={(selected) => setRecipients(selected)}
        />
    );
}

export default SingleStudentSelect;
