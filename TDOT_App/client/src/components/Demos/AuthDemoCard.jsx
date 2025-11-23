import PropTypes from "prop-types";

export function AuthDemoCard({ url, data }) {
    return (
        <div className="card mt-3 bg-warning">
            <div className="card-header">
        Demo - Fetching data from {url}
            </div>
            {!data.err &&
        <div className="card-body">
            <h5 className="card-title">{data.user?.firstname} {data.user?.lastname}</h5>
            <p className="card-text">{data.text}</p>
        </div>}
            {data.err &&
        <div className="card-body">
            <h5 className="card-title text-danger">ERROR FETCHING DATA</h5>
            <p className="card-text">{JSON.stringify(data.err)}</p>
        </div>}
        </div>
    );
}
AuthDemoCard.propTypes = {
    url: PropTypes.string,
    data: PropTypes.object
};
