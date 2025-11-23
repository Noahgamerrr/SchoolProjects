import { useEffect, useState } from 'react';

import Button from 'react-bootstrap/Button';
import { useNavigate, useParams } from "react-router-dom";

export default function EditableTableDemoDetail() {
    const [detailData, setDetailData] = useState({});
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        fetch(`/api/entities/${id}`)
            .then(response => response.json())
            .then(jsonData => setDetailData(jsonData))
    }, [id]);

    return (
        <div>
            <h2>TanStackTableDemoDetail</h2>

            <div>{detailData ? JSON.stringify(detailData) : <span>not found</span>}</div>
            <Button className="btn-success" onClick={() => navigate('/editable-table')}>Back <i className="bi bi-file-text"></i></Button>
        </div >
    )
}
