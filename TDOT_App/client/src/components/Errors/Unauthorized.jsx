import { useMsal } from "@azure/msal-react";
import ClientError from "./ClientError";

function Unauthorized() {
    const { instance } = useMsal();
    function handleClick(event) {
        event.preventDefault();
        instance.loginPopup();
    }
    return (
        <ClientError title={"Unauthorized Access!"}>
            Whoops! Seems like we could not verify your identity! 
            Please <a href="/" onClick={handleClick}>log in</a> in order to proceed!
        </ClientError>
    );
}

export default Unauthorized;
