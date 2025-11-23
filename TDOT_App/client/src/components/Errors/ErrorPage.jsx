import Button from 'react-bootstrap/Button';

import { useRouteError, useNavigate } from "react-router-dom";
//import { NavLink } from "react-router-dom";



export default function ErrorPage() {
    const navigate = useNavigate();
    const error = useRouteError();
    console.error(error);

    return (
        <div id="error-page" className="position-absolute top-50 start-50 translate-middle bg-warning p-3">
            <h1>Oops!</h1>
            <p>Sorry, an unexpected error has occurred.</p>
            <p>
                <i>{error.statusText || error.message}</i>
            </p>

            <Button className="btn-light w-100" onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left"></i><span className="ps-2">Back ...</span>
            </Button>
        </div>
    );
}