import { useEffect, useState } from 'react';
import defaultData from '../../data/TanStackTableDemoData.json';

import Button from 'react-bootstrap/Button';
import { useNavigate, useParams } from "react-router-dom";

export default function TanStackTableDemoDetail() {
    const [detailData, setDetailData] = useState({});
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const data = defaultData.find(item => item.personId == id);
        setDetailData(data);
    }, [id]);

    return (
        <div>
            <h2>TanStackTableDemoDetail</h2>

            <div>{detailData ? JSON.stringify(detailData) : <span>not found</span>}</div>
            <Button className="btn-success" onClick={() => navigate('/tanstack-table-demo')}>Back <i className="bi bi-file-text"></i></Button>
        </div >
    )
}
