import {
    PublicClientApplication,
    EventType,
    InteractionRequiredAuthError,
} from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
import { msalConfig } from "../config/authConfig.jsx";

export const createMSALInstance = () => {
    const msalInstance = new PublicClientApplication(msalConfig);

    // Default to using the first account if no account is active on page load
    if (
        !msalInstance.getActiveAccount() &&
        msalInstance.getAllAccounts().length > 0
    ) {
        // Account selection logic is app dependent. Adjust as needed for different use cases.
        msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
    }

    // Listen for sign-in event and set active account
    msalInstance.addEventCallback((event) => {
        if (
            event.eventType === EventType.LOGIN_SUCCESS &&
            event.payload.account
        ) {
            const account = event.payload.account;
            msalInstance.setActiveAccount(account);
        }
    });

    // Listen for sign-in event and set active account
    msalInstance.addEventCallback(async (event) => {
        if (
            event.eventType === EventType.LOGIN_SUCCESS &&
            event.payload.account
        ) {
            const account = event.payload.account;
            msalInstance.setActiveAccount(account);
        }
    });

    return msalInstance;
};

export const acquireAccessToken = async (msalInstance, account) => {
    const accessTokenRequest = {
        scopes: ["a1658179-9772-4ce1-9f31-1a181f5ecc70/.default"],
        account: account,
    };

    if (!accessTokenRequest.account) {
        console.log(
            "can not retrieve access token, no active account set for msalInstance"
        );
        return null;
    }

    try {
        if (!msalInstance.initialized) {
            await msalInstance.initialize();
            console.log("msalInstance initialized");
        }

        const accessTokenResponse =
            await msalInstance.acquireTokenSilent(accessTokenRequest);
        return accessTokenResponse.accessToken;
    } catch (err) {
        if (err instanceof InteractionRequiredAuthError) {
            const accessTokenResponse =
                await msalInstance.acquireTokenPopup(accessTokenRequest);
            return accessTokenResponse.accessToken;
        } else {
            throw err;
        }
    }
};

/**
 * @description Fetch wrapper that adds an Authorization header with the access token
 * @returns {(input: RequestInfo | URL, init: RequestInit | undefined) => Promise<any>}
 */
export const useAuthFetch = () => {
    const { instance } = useMsal();
    return async (input, init) => {
        if (!init) init = {};
        if (!init.headers) init.headers = {};

        return await fetch(input, {
            ...init,
            headers: {
                ...init.headers,
                Authorization:
                    "Bearer " +
                    (await acquireAccessToken(
                        instance,
                        instance.getActiveAccount()
                    )),
            },
        });
    };
};

export const useGraphFetch = () => {
    const { instance } = useMsal();
    const tokenRequest = {
        scopes: ["User.ReadBasic.All"],
        account: instance.getActiveAccount(),
    };

    return async (input, init) => {
        if (!init) init = {};
        if (!init.headers) init.headers = {};

        let graphToken;
        try {
            graphToken = (await instance.acquireTokenSilent(tokenRequest))
                .accessToken;
        } catch (e) {
            if (e instanceof InteractionRequiredAuthError) {
                instance
                    .acquireTokenPopup(tokenRequest)
                    .then(function (accessTokenResponse) {
                        graphToken = accessTokenResponse.accessToken;
                    });
            }
            console.log(e);
        }

        return await fetch(input, {
            ...init,
            headers: {
                ...init.headers,
                Authorization: "Bearer " + graphToken,
            },
        });
    };
};
