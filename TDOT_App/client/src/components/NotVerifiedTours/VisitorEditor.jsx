import PropTypes from "prop-types";
import { useState } from "react";
import { Button, Form, Row } from "react-bootstrap";
import { showToast } from "../Toasts/ToastContainer";

export default function VisitorEditor({ visitor, onEdit, onCancel}) {
	const [editedVisitor, setEditedVisitor] = useState({...visitor});

	const changeVisitorTextValue = (event) => {
        setEditedVisitor({...editedVisitor, [event.target.name]: event.target.value});
    }

    const changeVisitorGradeValue = (event) => {
        let val = event.target.value
        if (!isNaN(event.target.value)) {
            val = parseInt(val);
            if (val % 10 == editedVisitor.grade) val = Math.floor(val / 10);
            else val = val % 10;
            if (val >= 0 && val <= 4)
                setEditedVisitor({...editedVisitor, [event.target.name]: val});
        } 
    }

    const changeVisitorCheckValue = (event) => {
        setEditedVisitor({...editedVisitor, [event.target.name]: event.target.checked})
    }

	return (
		<>
			<h3 className="mt-3">Edit Visitor</h3>
			<Form>
				<Row className="justify-content-between">
					<Form.Group className="mb-3 col-md-3">
						<Form.Label>Name:</Form.Label>
						<Form.Control
							name="name"
							value={editedVisitor.name}
							onChange={changeVisitorTextValue}
							placeholder="John Doe"
						/>
					</Form.Group>
					<Form.Group className="mb-3 col-md-3">
						<Form.Label>Email:</Form.Label>
						<Form.Control
							name="email"
							type="email"
							value={editedVisitor.email}
							onChange={changeVisitorTextValue}
							placeholder="john.doe@example.com"
						/>
					</Form.Group>
					<Form.Group className="mb-3 col-md-3">
						<Form.Label>Address:</Form.Label>
						<Form.Control
							name="address"
							value={editedVisitor.address}
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
							value={editedVisitor.phone}
							placeholder={"+431234567890"}
						/>
					</Form.Group>
					<Form.Group className="mb-3 col-md-3">
						<Form.Label>School:</Form.Label>
						<Form.Control
							name="school"
							value={editedVisitor.school}
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
							value={editedVisitor.grade}
						/>
					</Form.Group>
				</Row>
				<Form.Group className="mb-3 col-md-3 d-flex">
					<Form.Label className="me-2">Potential first-grader?</Form.Label>
					<Form.Check
						name="potential"
						checked={editedVisitor.potential}
						onChange={changeVisitorCheckValue}
					/>
				</Form.Group>
				<Button
					className="me-2"
					onClick={() => { 
						if (editedVisitor.email.match(/.+@.+\..+/) || !editedVisitor.email) onEdit(editedVisitor);
						else showToast("Error", "", "Please enter a valid e-mail", "danger");
					}}
				>
					Edit
				</Button>
				<Button onClick={() => { onCancel() }} variant="danger">
					Cancel
				</Button>
			</Form>
		</>
	)
}

VisitorEditor.propTypes = {
	visitor: PropTypes.object,
	onEdit: PropTypes.func,
	onCancel: PropTypes.func
}