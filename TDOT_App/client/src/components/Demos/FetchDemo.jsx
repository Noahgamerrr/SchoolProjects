import { useEffect, useState } from 'react';


export default function FetchDemo() {
    const [userData, setUserData] = useState(false);
    const [errData, setErrData] = useState(false);

    useEffect(() => {
    // first hardcoded call and output in console to test the client-backend-connection
        fetch('api/info', {
            method: 'GET',
            headers: {
                'Content-Type': `application/json`,
            }
        })
            .then(response => {
                if (response.ok)
                    return response.json();
                else
                    throw { status: response.status, msg: response.statusText };
            })
            .then(data => {
                console.log(data);
                setUserData(data);
            })
            .catch(error => {
                console.error(error);
                setErrData(error);
            });
    }, []);

    return (
        <div className="card mt-3">
            <div className="card-header">
        Demo fetching user-data from backend endpoint /api/info
            </div>
            {userData &&
        <div className="card-body">
            <h5 className="card-title">DATA: {userData.user?.firstname} {userData.user?.lastname}</h5>
            <p className="card-text">{userData.text}</p>
            <a href="/api/info" className="btn btn-primary">Go to endpoint</a>
        </div>
            }
            {errData &&
        <div className="card-body">
            <h5 className="card-title text-danger">ERROR FETCHING DATA</h5>
            <p className="card-text">{JSON.stringify(errData)}</p>
            <a href="/api/info" className="btn btn-primary">Go to endpoint</a>
        </div>
            }
        </div>
    )
}
