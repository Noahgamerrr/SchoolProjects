import Button from "react-bootstrap/esm/Button";
import { useAuthFetch } from "../../lib/MSAL";

export const StudentListDownloadButton = () => {
    const fetch = useAuthFetch();

    const downloadStudents = async () => {
        const response = await fetch("/api/students/export");
        if (!response.ok) return;
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "students.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return <Button onClick={downloadStudents}>Download</Button>;
};
