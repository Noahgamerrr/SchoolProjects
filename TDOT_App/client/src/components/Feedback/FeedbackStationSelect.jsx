import PropTypes from "prop-types"
import { Form } from "react-bootstrap"

export default function FeedbackStationSelect({ stations, selectedStation, onStationSelect }) {
	return (
		<Form.Select value={selectedStation} onChange={e => onStationSelect(e.target.value)}>
			<option value={""}>I don't know</option>
			{stations.map(s => (
				<option key={s._id} value={s._id}>{s.name}</option>
			))}
		</Form.Select>
	)
}

FeedbackStationSelect.propTypes = {
	stations: PropTypes.array,
	selectedStation: PropTypes.string,
	onStationSelect: PropTypes.func
}