import { useMutation, useQueryClient } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { Button, Table } from "react-bootstrap";
import { useAuthFetch } from "../../lib/MSAL";
import { showToast } from "../Toasts/ToastContainer";
import { useReducer, useState } from "react";
import ConfirmationModal from "../Modal/ConfirmationModal";
import VisitorEditor from "./VisitorEditor";

const DEFAULT_MODAL_STATE = {
	show: false,
	title: null,
	message: null,
	onConfirm: null,
	onCancel: null
};

export default function VerifyTour({tour, openDay, onSettled}) {
	const fetch = useAuthFetch();
	const queryClient = useQueryClient();
	const [selectedVisitor, setSelectedVisitor] = useState(null);
	const [showModal, showModalDispatch] = useReducer(modalReducer, {...DEFAULT_MODAL_STATE})

	function formatTime(rawTime) {
		const time = new Date(rawTime);
		const hours = time.getHours().toString().padStart(2, "0");
		const minutes = time.getMinutes().toString().padStart(2, "0");
	
		return `${hours}:${minutes}`;
	}

	function modalReducer(_, action) {
		switch (action.type) {
			case 'showModal': {
				return {
					show: true,
					title: action.title,
					message: action.message,
					onConfirm: action.onConfirm,
					onCancel: action.onCancel
				};
			}
			case 'hideModal': {
				return {...DEFAULT_MODAL_STATE};
			}
		}
	}

	const verifyMutation = useMutation({
        mutationKey: "verify-tour",
        mutationFn: async () => {
            return await fetch(`/api/tours/${tour._id}/verify`, {
                method: "PUT"
            }).then((res) => res.json());
        },
        onSettled: () => {
            queryClient.invalidateQueries(["tour"]);
            showToast(
                "Success!",
                "",
                `Tour successfully verified`,
                "success"
            );
			onSettled();
        },
    });

	const deleteMutation = useMutation({
        mutationKey: "delete-tour",
        mutationFn: async () => {
            return await fetch(`/api/tours/${tour._id}`, {
                method: "DELETE"
            }).then((res) => res.json());
        },
        onSettled: () => {
            queryClient.invalidateQueries(["tour"]);
            showToast(
                "Success!",
                "",
                `Tour successfully deleted`,
                "success"
            );
			onSettled();
        },
    });

	const editVisitor = useMutation({
		mutationKey: "edit-visitor",
        mutationFn: async (visitor) => {
            return await fetch(`/api/visitors/${visitor._id}`, {
                method: "PUT",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(visitor)
            }).then((res) => res.json());
        },
        onSettled: () => {
            queryClient.invalidateQueries(["tour"]);
            showToast(
                "Success!",
                "",
                `Visitor successfully updated!`,
                "success"
            );
			setSelectedVisitor(null);
        },
	});

	const createVisitor = useMutation({
		mutationKey: "save-visitor",
        mutationFn: async (visitor) => {
			visitor.openday = openDay._id;
            const dbVisitor = await fetch(`/api/visitors`, {
                method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(visitor)
            }).then((res) => res.json());
			return await fetch(`/api/tours/${tour._id}/visitors`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					"visitor": dbVisitor._id
				})
			}).then((res) => res.json());
        },
        onSettled: () => {
            queryClient.invalidateQueries(["tour"]);
            showToast(
                "Success!",
                "",
                `Visitor successfully added to tour!`,
                "success"
            );
			setSelectedVisitor(null);
        },
	});

	const deleteVisitor = useMutation({
		mutationKey: "delete-visitor",
        mutationFn: async (visitor) => {
			await fetch(`/api/tours/${tour._id}/visitors/${visitor._id}`, {
                method: "DELETE"
            }).then((res) => res.json());
            return await fetch(`/api/visitors/${visitor._id}`, {
                method: "DELETE"
            }).then((res) => res.json());
        },
        onSettled: () => {
            queryClient.invalidateQueries(["tour"]);
            showToast(
                "Success!",
                "",
                `Visitor successfully updated!`,
                "success"
            );
        },
	});

	function StationsTable() {
		return (
			<Table striped bordered hover>
				<thead>
					<tr>
						<th>Station name</th>
						<th>Visited at:</th>
					</tr>
				</thead>
				<tbody>
					{ 
						tour.stations.map(s => {
							let time = new Date(s.time.start);
							return (
								<tr key={s.id._id}>
									<td>{s.id.name}</td>
									<td>{`${time.getHours() < 10 ? "0" : ""}${time.getHours()}:${time.getMinutes() < 10 ? "0" : ""}${time.getMinutes()}`}</td>
								</tr>
							)
						})
					}
				</tbody>
			</Table>
		)
	}

	function VisitorsTable() {
		return (
			<Table striped bordered hover>
				<thead>
					<tr>
						<th>Name</th>
						<th>Email</th>
						<th>Address</th>
						<th>Phone Number</th>
						<th>School</th>
						<th>Grade</th>
						<th>Potential first-grader</th>
						<th className="fit"></th>
					</tr>
				</thead>
				<tbody>
					{ 
						tour.visitors.map(v => {
							return (
								<tr key={v._id}>
									<td>{v.name}</td>
									<td>{v.email}</td>
									<td>{v.address}</td>
									<td>{v.phone}</td>
									<td>{v.school}</td>
									<td>{v.grade}</td>
									<td>{v.potential ? "yes" : "no"}</td>
									<td className="fit">
										<Button 
											variant="warning" 
											className="me-2" 
											onClick={() => {setSelectedVisitor(v)}}
										>
											<i className="bi bi-pencil-square"></i>
										</Button>
										<Button 
											variant="danger"
											onClick={() => {
												showModalDispatch({
													type: "showModal",
													title: "Remove Visitor!",
													message: "Are you sure you want to remove this visitor from the tour?",
													onConfirm: () => {deleteVisitor.mutate(v)},
													onCancel: () => {}
												})
											}}
										>
											<i className="bi bi-trash"></i>
										</Button>
									</td>
								</tr>
							)
						})
					}
				</tbody>
			</Table>
		)
	}

	return (
		<>
			<h2>Verify tour</h2>
			<p className="mb-1">Guide: {tour.guide.firstname} {tour.guide.lastname}</p>
			<p className="mb-1">Started at: {formatTime(tour.startTime)}</p>
			<p>Ended at: {formatTime(tour.endTime)}</p>
			<h3>Stations:</h3>
			{
				tour.stations.length != 0 ?
				<StationsTable/> :
				<p>No stations were visited!</p>
			}
			<h3>Visitors:</h3>
			<VisitorsTable/>
			<Button 
				variant="success" 
				className="d-block mb-2"
				onClick={() => setSelectedVisitor({
					name: "",
					email: "",
					grade: 0,
					address: "",
					phone: "",
					school: "",
					potential: false
				})}
			>
				Add Visitor
			</Button>
			<Button variant="success" className="me-2" onClick={() => {verifyMutation.mutate()}}>Verify</Button>
			<Button 
				variant="danger" 
				onClick={() => {
					showModalDispatch(
						{
							type: "showModal",
							title: "Delete Tour!",
							message: "Are you sure you want to delete this tour?",
							onConfirm: () => {deleteMutation.mutate()},
							onCancel: () => {}
						}
					)
				}}
			>Delete</Button>
			<ConfirmationModal
				title={showModal.title}
				message={showModal.message}
				show={showModal.show}
				onCancel={() => {
					showModal.onCancel();
					showModalDispatch({type: "hideModal"});
				}}
				onConfirm={() => {
					showModal.onConfirm();
					showModalDispatch({type: "hideModal"});
				}}
				actionText={"Confirm"}
				disableLockedModal={true}
			/>
			{
				selectedVisitor &&
				<>
					<VisitorEditor 
						visitor={selectedVisitor} 
						onEdit={visitor => {
							visitor._id ?
							editVisitor.mutate(visitor) :
							createVisitor.mutate(visitor);
						}}
						onCancel={() => setSelectedVisitor(null)}
					/>
				</>
			}
		</>
	)
}

VerifyTour.propTypes = {
	tour: PropTypes.object,
	openDay: PropTypes.object,
	onSettled: PropTypes.func,
}