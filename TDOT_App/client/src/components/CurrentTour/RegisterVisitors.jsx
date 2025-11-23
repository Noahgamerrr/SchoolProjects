import { Accordion, Button, Form, Row } from "react-bootstrap";
import ConfirmationModal from "../Modal/ConfirmationModal";
import PropTypes from "prop-types";
import { useState } from "react";
import { showToast } from "../Toasts/ToastContainer";


const DEFAULT_VISITOR = {
    name: "",
    email: "",
    grade: 0,
    address: "",
    phone: "",
    school: "",
    potential: false
}

export default function RegisterVisitors({ sendFormLabel, onSendForm }) {
	const [selectedVisitor, setSelectedVisitor] = useState(-1);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [visitors, setVisitors] = useState([]);
	const [visitor, setVisitor] = useState({...DEFAULT_VISITOR});

	const changeVisitorTextValue = (event) => {
        setVisitor({...visitor, [event.target.name]: event.target.value});
    }

    const changeVisitorGradeValue = (event) => {
        let val = event.target.value
        if (!isNaN(event.target.value)) {
            val = parseInt(val);
            if (val % 10 == visitor.grade) val = Math.floor(val / 10);
            else val = val % 10;
            if (val >= 0 && val <= 4)
                setVisitor({...visitor, [event.target.name]: val});
        } 
    }

    const changeVisitorCheckValue = (event) => {
        setVisitor({...visitor, [event.target.name]: event.target.checked})
    }

	const editVisitor = (index) => {
        setSelectedVisitor(index);
        setVisitor({...visitors[index]});
    }

	const saveVisitor = () => {
        if (selectedVisitor != -1) {
            visitors.splice(selectedVisitor, 1, visitor);
            setVisitors([...visitors]);
        } else setVisitors([...visitors, visitor]);
		setSelectedVisitor(-1);
    }

    const deleteVisitor = () => {
        visitors.splice(selectedVisitor, 1);
		setSelectedVisitor(-1);
        setVisitors([...visitors]);
    }

	return (
		<>
			<Accordion>
				{
					visitors.map((v, idx) => (
						<Accordion.Item eventKey={`${idx}`} key={v.name}>
							<Accordion.Header>
								<div className="d-flex  w-100 me-3 justify-content-between align-items-center">
									<h6 className="mb-0">{v.name}</h6>
									<div>
										<Button
											variant="warning"
											className="mx-2"
											onClick={(e) => {
												e.stopPropagation()
												editVisitor(idx)
											}}
										>
											<i className="bi bi-pencil-square"></i>
										</Button>
										<Button
											variant="danger"
											onClick={(e) => {
												e.stopPropagation();
												setSelectedVisitor(idx);
												setShowDeleteModal(true);
											}}
										>
											<i className="bi bi-trash"></i>
										</Button>
									</div>
								</div>
							</Accordion.Header>
							<Accordion.Body>
								<p className="mb-0">Name: {v.name}</p>
								<p className="mb-0">Email: {v.email}</p>
								<p className="mb-0">Grade: {v.grade}</p>
								<p className="mb-0">Address: {v.address}</p>
								<p className="mb-0">Phone Number: {v.phone}</p>
								<p className="mb-0">School: {v.school}</p>
								<p>Potential first-grader: {v.potential ? "yes" : "no"}</p>
							</Accordion.Body>
						</Accordion.Item>
					))
				}
			</Accordion>
			<h3 className="mt-3">Add Visitor</h3>
			<Form>
				<Row className="justify-content-between">
					<Form.Group className="mb-3 col-md-3">
						<Form.Label>Name:</Form.Label>
						<Form.Control
							name="name"
							value={visitor.name}
							onChange={changeVisitorTextValue}
							placeholder="John Doe"
						/>
					</Form.Group>
					<Form.Group className="mb-3 col-md-3">
						<Form.Label>Email:</Form.Label>
						<Form.Control
							name="email"
							type="email"
							value={visitor.email}
							onChange={changeVisitorTextValue}
							placeholder="john.doe@example.com"
						/>
					</Form.Group>
					<Form.Group className="mb-3 col-md-3">
						<Form.Label>Address:</Form.Label>
						<Form.Control
							name="address"
							value={visitor.address}
							onChange={changeVisitorTextValue}
							placeholder="Tschinowitscher Weg 5, 9500 Villach"
						/>
					</Form.Group>
				</Row>
				<Row className="justify-content-between">
					<Form.Group className="mb-3 col-md-3">
						<Form.Label>Phone Number:</Form.Label>
						<Form.Control
							name="phone"
							type="tel"
							onChange={changeVisitorTextValue}
							value={visitor.phone}
							placeholder={"+431234567890"}
						/>
					</Form.Group>
					<Form.Group className="mb-3 col-md-3">
						<Form.Label>School:</Form.Label>
						<Form.Control
							name="school"
							value={visitor.school}
							onChange={changeVisitorTextValue}
							placeholder={"Peraugymnasium"}
						/>
					</Form.Group>
					<Form.Group className="mb-3 col-md-3">
						<Form.Label>Grade:</Form.Label>
						<Form.Control
							name="grade"
							type="number"
							min={0}
							max={4}
							onChange={changeVisitorGradeValue}
							value={visitor.grade}
						/>
					</Form.Group>
				</Row>
				<Form.Group className="mb-3 col-md-3 d-flex">
					<Form.Label className="me-2">Potential first-grader?</Form.Label>
					<Form.Check
						name="potential"
						checked={visitor.potential}
						onChange={changeVisitorCheckValue}
					/>
				</Form.Group>
				<Button
					className="me-2"
					onClick={ 
						() => {
								if (visitor.email.match(/.+@.+\..+/) || !visitor.email) {
									saveVisitor();
									setVisitor({...DEFAULT_VISITOR});
								} else showToast("Error", "", "Please enter a valid e-mail", "danger");
							}	
						}
				>
					Save Visitor
				</Button>
				<Button onClick={() => { onSendForm(visitors) }} variant="success" disabled={visitors.length == 0}>
					{sendFormLabel}
				</Button>
			</Form>
			<ConfirmationModal
				title="Remove Visitor?"
				message={
					`Are you sure you want to remove the visitor ${visitors[selectedVisitor]?.name} from the tour?`
				}
				show={showDeleteModal}
				onCancel={() => {
					setSelectedVisitor(-1);
					setShowDeleteModal(false);
				}}
				onConfirm={() => {
					deleteVisitor();
					setShowDeleteModal(false);
				}}
				actionText={"Confirm"}
				disableLockedModal={true}
			/>
		</>
	)
}

RegisterVisitors.propTypes = {
	sendFormLabel: PropTypes.string,
	onSendForm: PropTypes.func
}