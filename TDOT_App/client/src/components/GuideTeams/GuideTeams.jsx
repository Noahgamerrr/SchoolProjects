import { Button, Table, Form } from 'react-bootstrap'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { showToast } from '../Toasts/ToastContainer';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import { useAuthFetch } from '../../lib/MSAL';
import { useReducer, useState } from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { TableCell } from './GuideTeamsTableCell';
import Loading from '../Loading';
import FormModal from '../Modal/FormModal';
import ConfirmationModal from '../Modal/ConfirmationModal';

export default function GuideTeams() {
    const { instance } = useMsal();
    const fetch = useAuthFetch();
    const queryClient = useQueryClient();
    const [showCreateModal, setShowCreateModal] = useState({
        show: false,
        name: ""
    });
    const [lockedModalState, dispatchLockedModal] = useReducer(lockedModalReducer, {
        show: false,
        onConfirm: () => {},
        title: "",
        message: "",
    });

    function lockedModalReducer(_, action) {
        switch (action.type) {
            case 'set_leader' : {
                return {
                    show: true,
                    title: "Set Leader",
                    message: "Are you sure you want to set the leader of the guide-team?",
                    onConfirm: () => updateLeaderMutation.mutate(action.updateData)
                }
            }
            case 'set_guide_team': {
                return {
                    show: true,
                    title: "Set Guide Team",
                    message: "Are you sure you want to set the student's guide team?",
                    onConfirm: () => updateTeamMutation.mutate(action.updateData)
                }
            }
            case 'create_guide_team': {
                return {
                    show: true,
                    title: "Create Guide Team",
                    message: "Are you sure you want to create a new guide team?",
                    onConfirm: () => addGuideTeamMutation.mutate(action.name)
                }
            }
            case 'cancel': {
                return {
                    show: false,
                    title: "",
                    message: "",
                    onConfirm: () => {}
                }
            }
        }
    }
    

    const { isLoading, data: students} = useQuery({
        queryKey: ["students", "guide-team-students"],
        queryFn: () => fetch("/api/students").then((res) => res.json())
    });

    const { isLoading: teamLoading, data: guideTeams} = useQuery({
        queryKey: ["guide-teams", "all"],
        queryFn: () => fetch("/api/guide-teams").then((res) => res.json())
    });

    const columnHelper = createColumnHelper();
    const columns = [
        columnHelper.accessor("lastname", {
            header: "Lastname",
            cell: TableCell,
            enableSorting: true
        }),
        columnHelper.accessor("firstname", {
            header: "First Name",
            cell: TableCell,
            enableSorting: false,
            enableColumnFilter: false,
        }),
        columnHelper.accessor("shortform", {
            header: "Shortform",
            cell: TableCell,
            enableColumnFilter: true,
            enableSorting: true,
        }),
        columnHelper.accessor(row => guideTeams.find(gt => gt._id == row.guideTeams[0]?.teamId)?.name || "no-team", {
            header: "Guide-Team",
            cell: TableCell,
            meta: {
                type: "select",
                options: guideTeams?.map(gt => {
                    return {
                        value: gt.name
                    }
                })
            },
        }),
        columnHelper.accessor(row => row.guideTeams[0]?.isLeader, {
            header: "Is Leader",
            cell: TableCell,
            enableSorting: false,
            enableColumnFilter: true,
            meta: {
                type: "checkbox"
            }
        })
    ];
    const [columnFilters, setColumnFilters] = useState([]);
    const [sorting, setSorting] = useState([]);

    const updateTeamMutation = useMutation({
        mutationKey: ["guide-teams", "students"],
        mutationFn: async (data) => {
            if (data.newTeam != "no-team") {
                await fetch(`/api/students/${data.student}/guideTeam/${data.newTeam}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": `application/json`,
                        "If-Match": data.verifier
                    },
                });
            } else {
                await fetch(`/api/students/${data.student}/guideTeam/${data.oldTeam}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": `application/json`,
                        "If-Match": data.verifier
                    },
                });
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries(["students"]);

            showToast(
                "Success",
                "Updated Student",
                `Student was successfully updated`,
                "Success"
            );
        },
    });

    const updateLeaderMutation = useMutation({
        mutationKey: ["guide-teams", "students"],
        mutationFn: async (data) => {
            await fetch(`/api/students/${data.student}/guideLeader/${data.team}`, {
                method: "PUT",
                headers: {
                    "Content-Type": `application/json`,
                    "If-Match": data.verifier
                },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["students"]);

            showToast(
                "Success",
                "Updated Student",
                `Student was successfully updated`,
                "Success"
            );
        },
    });

    const table = useReactTable({
        data: students || [],
        columns,
        state: {
            columnFilters,
            sorting
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        meta: {
            guideTeams: guideTeams,
            updateGuideTeam: (rowIndex, columnId, value) => {
                const student = students[rowIndex];
                const mutationData = {
                    student: student._id,
                    verifier: student.__v,
                    oldTeam: student.guideTeams[0]?.teamId,
                    newTeam: value != "no-team" ? guideTeams.find(gt => gt.name == value)?._id : value
                };
                dispatchLockedModal({
                    type: 'set_guide_team',
                    updateData: mutationData
                })
            },
            updateTeamLeader: (rowIndex, columnId, value) => {
                const student = students[rowIndex];
                const mutationData = {
                    student: student._id,
                    verifier: student.__v,
                    team: student.guideTeams[0]?.teamId,
                };
                dispatchLockedModal({
                    type: 'set_leader',
                    updateData: mutationData
                });
            }
        },
        onColumnFiltersChange: setColumnFilters
    });

    const addGuideTeam = async (name) => {
        if (!name)
            throw new Error("Please enter a valid name for the new guideTeam");
        let res = await fetch("/api/guide-teams", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({name})
        });
        if (res.status != 201) throw new Error((await res.text()));
    }

    const addGuideTeamMutation = useMutation({
        mutationFn: addGuideTeam,
        mutationKey: ["guide-teams"],
        onError: (error) =>
            showToast(
                "Error creating guide-team",
                error.name,
                error.message,
                "Danger"
            ),
        onSettled: (data, error, gt) => {
            if (!error) {
                showToast(
                    "Guide-team created",
                    "",
                    `Guide-team ${gt?.name || "successfully"} created`,
                    "Success"
                );
            }
            queryClient.invalidateQueries(["guide-teams"]);
        },
    });

    /*const [formData, setFormData] = useState("");

    const deleteGuideTeam = async (guideTeam) => {
        if (!guideTeam._id)
            throw new Error("Tried to delete guide-team without _id");
        let res = await fetch("/api/guide-teams/" + guideTeam._id, {
            method: "DELETE",
        });
        if (res.status != 204) throw new Error("Failed to delete guide-team");
    };


    const deleteMutation = useMutation({
        mutationFn: deleteGuideTeam,
        mutationKey: ["guide-teams"],
        onError: (error) =>
            showToast(
                "Error deleting guide-team",
                error.name,
                error.message,
                "Danger"
            ),
        onSettled: (data, error, gt) => {
            if (!error) {
                showToast(
                    "Guide-team deleted",
                    "",
                    `Guide-team ${gt?.name || "successfully"} deleted`,
                    "Success"
                );
            }
            queryClient.invalidateQueries(["guide-teams"]);
        },
    });

    const { data: guideTeams } = useQuery({
        queryKey: ["guide-teams", "all"],
        queryFn: async () => {
            const response = await fetch("/api/guide-teams/");
            const data = await response.json();
            return data;
        },
        staleTime: Infinity,
    });

    const guideTeamElems = guideTeams?.map(gt => (
        <tr key={gt._id}>
            <td>{gt.name}</td>
            <td>
                <Button
                    variant="secondary"
                    style={{
                        padding: "0.1rem 0.8rem",
                        fontSize: "1.4rem",
                    }}
                    onClick={() => {
                        queryClient.invalidateQueries(["members", "newStudents"]);
                        navigate("/guide-teams/" +gt._id);
                    }}>
                    <i className="bi bi-gear" />
                </Button>
            </td>
            <td>
                <DeleteButton
                    onDelete={() =>
                        deleteMutation.mutate(gt)
                    }
                    message="Are you sure you want to delete this guide-team?"
                />
            </td>
        </tr>
    ));

    

    */

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

    const content = roles?.includes("admin") ? (
        <div>
            <h2>Guide-Teams:</h2>
            <Table striped bordered hover>
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th key={header.id}>
                                    {header.column.getCanFilter() &&  
                                        header.column.columnDef.meta?.type != "checkbox" ? (
                                        <div>
                                            {/* Filtertextbox */}
                                            <Form.Control
                                                type={
                                                    header.column.columnDef.meta
                                                        ?.type || "text"
                                                }
                                                value={
                                                    header.column.getFilterValue() ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    header.column.setFilterValue(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    ) : null}
                                    {header.column.getCanFilter() &&  
                                        header.column.columnDef.meta?.type == "checkbox" ? (
                                        <div>
                                            {/* Filtertextbox */}
                                            <Form.Check
                                                value={
                                                    header.column.getFilterValue()
                                                }
                                                onChange={(e) =>
                                                    header.column.setFilterValue(
                                                        e.target.checked ? e.target.checked : undefined
                                                    )
                                                }
                                            />
                                        </div>
                                    ) : null}
                                    {header.isPlaceholder ? null : (
                                        //  Headline (Sortable)
                                        <div
                                            role={
                                                header.column.getCanSort()
                                                    ? "button"
                                                    : ""
                                            }
                                            className={
                                                header.column.getCanSort()
                                                    ? ""
                                                    : "pe-none"
                                            }
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                            {{
                                                asc: (
                                                    <i className="bi bi-caret-up-fill"></i>
                                                ),
                                                desc: (
                                                    <i className="bi bi-caret-down-fill"></i>
                                                ),
                                            }[header.column.getIsSorted()] ??
                                                null}
                                        </div>
                                    )}
                                </th>
                            ))}
                            <th>
                                <Button
                                    className="btn-secondary"
                                    onClick={() =>
                                        {setShowCreateModal({...showCreateModal, show: true})}
                                    }
                                >
                                    <i className="bi bi-plus-square"></i>
                                </Button>
                            </th>
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row, rowIdx) => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id}>
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </td>
                            ))}
                            <td></td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <FormModal
                title={"Create Team"}
                show={showCreateModal.show}
                onSave={() => {
                    dispatchLockedModal({
                        type: 'create_guide_team',
                        name: showCreateModal.name
                    })
                }}
                onClose={() => {
                    setShowCreateModal({
                        show: false,
                        name: ""
                    });
                }}
            >
                <Form
                    onSubmit={(e) => {
                        e.preventDefault();
                    }}
                >
                    <Form.Group className="mb-3" controlId="formGuideTeamName">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter name"
                            value={showCreateModal.name}
                            onChange={(e) => setShowCreateModal({...showCreateModal, name: e.target.value})}
                        />
                    </Form.Group>
                </Form>
            </FormModal>
            <ConfirmationModal
                show={lockedModalState.show}
                title={lockedModalState.title}
                message={lockedModalState.message}
                onConfirm={lockedModalState.onConfirm}
                onCancel={() => dispatchLockedModal({type: 'cancel'})}
            />
        </div>
    ) : ({unauthorized})

    if (isLoading || teamLoading) return <Loading/>

    return (
        <>
            <AuthenticatedTemplate>{content}</AuthenticatedTemplate>
            <UnauthenticatedTemplate>{unauthorized}</UnauthenticatedTemplate>
        </>
    )
}
