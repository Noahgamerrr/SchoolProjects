import { useEffect, useState } from "react";

import { useMsal } from "@azure/msal-react";
import { useIsAuthenticated } from "@azure/msal-react";

import { AuthDemoCard } from "./AuthDemoCard";
import { useAuthFetch } from "../../lib/MSAL";

export default function FetchDemo() {
    const [userDataAuth, setUserDataAuth] = useState({});
    const [userDataAuthWorker, setUserDataAuthWorker] = useState({});
    const [userDataAuthAdmin, setUserDataAuthAdmin] = useState({});
    const fetch = useAuthFetch();

    const { instance } = useMsal();

    const url1 = "api/secretinfo";
    const url2 = "api/secretinfo/worker";
    const url3 = "api/secretinfo/admin";

    const isAuthenticated = useIsAuthenticated();

    useEffect(() => {
        (async () => {
            async function get(url) {
                const response = await fetch(url);

                if (!response.ok)
                    throw { status: response.status, msg: response.statusText };

                const data = await response.json();
                return data;
            }

            try {
                const secretInfoWorker = await get(url1);
                setUserDataAuth(secretInfoWorker);
            } catch (error) {
                console.error(error);
                setUserDataAuth({ err: error });
            }

            try {
                setUserDataAuthWorker(await get(url2));
            } catch (error) {
                setUserDataAuthWorker({ err: error });
            }

            try {
                setUserDataAuthAdmin(await get(url3));
            } catch (error) {
                setUserDataAuthAdmin({ err: error });
            }
        })();
    }, [instance, fetch, isAuthenticated]);

    return (
        <>
            <AuthDemoCard url={url1} data={userDataAuth}></AuthDemoCard>
            <AuthDemoCard url={url2} data={userDataAuthWorker}></AuthDemoCard>
            <AuthDemoCard url={url3} data={userDataAuthAdmin}></AuthDemoCard>
        </>
    );
}
