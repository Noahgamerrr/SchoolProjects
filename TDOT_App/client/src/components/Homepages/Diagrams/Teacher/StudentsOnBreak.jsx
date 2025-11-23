import PropTypes from "prop-types";

export default function StudentsOnBreak({ students }) {
    /*
        students: [
            {name: string, time: date}
        ] 
    */
    return (
        <div>
            <h2>Students on Break</h2>
            {
                students?.slice(0, 4).map((st) => {
                    const now = Date.now();
                    let timeOnBreak = Math.floor((now - Date.parse(st.time)) / 1000);
                    timeOnBreak = Math.floor(timeOnBreak / 60);
                    const [hours, minutes] = [(Math.floor(timeOnBreak / 60) % 24 + 24) % 24, (timeOnBreak % 60 + 60) % 60]
                    
                    return (
                        <div key={st.name} className="mx-5 p-2">
                            <div className="d-flex flex-col flex-nowrap">
                                <i
                                    className="bi bi-cup-hot-fill fs-2"
                                    style={{
                                        marginRight: "20px",
                                    }}
                                />
                                <div>
                                    <div
                                        className="syp-max-content"
                                    >
                                        {st.name}
                                    </div>
                                    <div className="text-body-secondary">On break for: {hours}h {minutes}min</div>
                                </div>
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}

StudentsOnBreak.propTypes = {
    students: PropTypes.array
}
