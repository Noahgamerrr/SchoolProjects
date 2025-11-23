import { Button, Form, Table } from "react-bootstrap";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    AuthenticatedTemplate,
    UnauthenticatedTemplate,
    useMsal,
} from "@azure/msal-react";
import { useAuthFetch } from "../../lib/MSAL";
import { useState } from "react";
import { showToast } from "../Toasts/ToastContainer";
import DeleteButton from "../Util/DeleteButton";
import ModalCheckbox from "../Util/ModalCheckbox";
import ClientError from "../Errors/ClientError";
import Loading from "../Loading";
import LockButton from "../Util/LockButton";

/**
 * @type {React.FC}
 */
const Opendays = () => {
    const { instance } = useMsal();
    const fetch = useAuthFetch();
    const queryClient = useQueryClient();

    const { data, error } = useQuery({
        queryKey: ["opendays", "all"],
        queryFn: async () =>
            await fetch("/api/opendays").then((res) => res.json()),
        refetchInterval: (query) => (query.state.error ? 3000 : 60000),
        retry: false,
    });

    const createOpenday = async (openday) => {
        if (data?.find((od) => od.date == openday.date))
            throw new Error("Openday already exists");
        let res = await fetch("/api/opendays", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(openday),
        });
        if (res.status != 201)
            throw new Error("Failed to create openday, status: " + res.status);
        queryClient.invalidateQueries();
    };

    const deleteOpenday = async (openday) => {
        if (!openday._id)
            throw new Error("Tried to delete openday without _id");
        let res = await fetch("/api/opendays/" + openday._id, {
            method: "DELETE",
        });
        if (res.status != 204) throw new Error("Failed to delete openday");
    };

    const setActiveOpenday = async (openday) => {
        if (!openday._id) throw new Error();
        let res = await fetch("/api/opendays/" + openday._id, {
            method: "PATCH",
        });
        if (res.status != 200) throw new Error();
    };

    const lockOpenday = async (openday) => {
        if (!openday._id) throw new Error();
        let res = await fetch("/api/opendays/lock/" + openday._id, {
            method: "PATCH",
        });
        if (res.status != 200) throw new Error();
    };

    const mutation = useMutation({
        mutationFn: createOpenday,
        mutationKey: ["opendays", "all"],
        onError: (error) =>
            showToast(
                "Error creating openday",
                error.name,
                error.message,
                "Danger"
            ),
        onSettled: (data, error, od) => {
            if (!error)
                showToast(
                    "Openday created",
                    "",
                    `Openday ${od?.date || "successfully"} created`,
                    "Success"
                );
        },
    });
    const base = {
        date: new Date().toISOString().split("T")[0],
    };

    const deleteMutation = useMutation({
        mutationFn: deleteOpenday,
        mutationKey: ["opendays"],
        onError: (error) =>
            showToast(
                "Error deleting openday",
                error.name,
                error.message,
                "Danger"
            ),
        onSettled: (data, error, od) => {
            if (!error)
                showToast(
                    "Openday deleted",
                    "",
                    `Openday ${od?.date || "successfully"} deleted`,
                    "Success"
                );
            queryClient.invalidateQueries(["opendays"]);
        },
    });

    const activeMutation = useMutation({
        mutationFn: setActiveOpenday,
        mutationKey: ["opendays", "active"],
        onError: (error) =>
            showToast(
                "Error setting active openday",
                error.name,
                error.message,
                "Danger"
            ),
        onSettled: (data, error, od) => {
            if (!error)
                showToast(
                    "Openday set active",
                    "",
                    `Openday ${od?.date || "successfully"} set active`,
                    "Success"
                );
            queryClient.invalidateQueries();
        },
    });

    const lockMutation = useMutation({
        mutationFn: lockOpenday,
        mutationKey: ["opendays", "lock"],
        onError: (error) =>
            showToast(
                "Error setting locked openday",
                error.name,
                error.message,
                "Danger"
            ),
        onSettled: (data, error, od) => {
            if (!error)
                showToast(
                    "Openday Locked!",
                    "",
                    `Openday ${od?.date || "successfully"} set as locked`,
                    "Success"
                );
            queryClient.invalidateQueries(["opendays"]);
        },
    });

    const [formData, setFormData] = useState(base);

    const roles = instance.getActiveAccount()?.idTokenClaims.roles;

    const unauthorized = (
        <p>
            You are not allowed to view this page.
            <br />
            <UnauthenticatedTemplate>
                Please{" "}
                <a
                    href=""
                    onClick={(e) => {
                        e.preventDefault();
                        instance.loginPopup();
                    }}
                >
                    log in
                </a>{" "}
                to get access
            </UnauthenticatedTemplate>
        </p>
    );

    if (error)
        return (
            <ClientError title="Error">
                <p>Failed to load application. Please try again later.</p>
            </ClientError>
        );
    if (data == undefined) return <Loading />;

    const content =
        roles && roles.includes("admin") ?
            <div className="col-12 col-md-8 p-3" style={{ maxWidth: "800px" }}>
                <h1>Openday Management</h1>
                <Table striped hover>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th className="col-1">Active</th>
                            <th className="col-1">Delete</th>
                            <th className="col-1">Lock</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.map((od) => {
                            let textStyle = { verticalAlign: "middle" };

                            return (
                                <tr key={od._id}>
                                    <td
                                        className={
                                            od.locked ? "text-warning" : ""
                                        }
                                        style={textStyle}
                                    >
                                        {od.date}
                                    </td>
                                    <td style={{ verticalAlign: "middle" }}>
                                        <ModalCheckbox
                                            onCheck={() =>
                                                activeMutation.mutate(od)
                                            }
                                            checked={od.active}
                                            title={"Change active openday"}
                                            modalText={
                                                "Are you sure you want to set this openday as active?"
                                            }
                                        />
                                    </td>
                                    <td style={{ verticalAlign: "middle" }}>
                                        <DeleteButton
                                            onDelete={() =>
                                                deleteMutation.mutate(od)
                                            }
                                            message="Are you sure you want to delete this openday"
                                        />
                                    </td>
                                    <td style={{ verticalAlign: "middle" }}>
                                        <LockButton
                                            openDayLocked={od.locked}
                                            onInput={() =>
                                                lockMutation.mutate(od)
                                            }
                                            message="Are you sure you want to lock this openday"
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
                <Form
                    onSubmit={(e) => {
                        e.preventDefault();
                        mutation.mutate(formData);
                        setFormData(base);
                    }}
                >
                    {/* Simple form with date input */}
                    <Form.Group className="mb-3" controlId="formBasicDate">
                        <Form.Label>Date</Form.Label>
                        <Form.Control
                            type="date"
                            placeholder="Enter date"
                            value={formData.date}
                            className={
                                data?.find((od) => od.date == formData.date) ?
                                    "bg-warning text-black"
                                :   ""
                            }
                            onChange={(e) => {
                                const date = e.target.value;

                                setFormData({
                                    ...formData,
                                    date,
                                });
                            }}
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>
            </div>
        :   { unauthorized };

    return (
        <>
            <AuthenticatedTemplate>{content}</AuthenticatedTemplate>
            <UnauthenticatedTemplate>{unauthorized}</UnauthenticatedTemplate>
        </>
    );
};

export default Opendays;
