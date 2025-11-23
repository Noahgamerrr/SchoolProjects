import { useMsal } from "@azure/msal-react";

export default function UnauthorizedTemplate() {
    const { instance } = useMsal();
    const activeAccount = instance.getActiveAccount();
    const roles = activeAccount?.idTokenClaims?.roles;

    return (
        <>
            {!roles && <div>
                <h2>Hello there, stranger!</h2>
                <p>
                    You are not registered in our application. Please ask an admin to 
                    provide you with the required permissions in order to proceed.
                </p>
            </div>}
        </>
    )
}