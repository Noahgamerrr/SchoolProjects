import Button from 'react-bootstrap/Button';
import { showToast } from './ToastContainer';

export default function ToastDemo() {
    return (
        <div>
            <h2>Toast-Demo</h2>
            <Button className="btn-warning" onClick={() => showToast()}>Click to create a Demo-Toast-Message</Button>
        </div>
    )
}
