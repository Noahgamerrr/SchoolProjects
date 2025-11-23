import "./App.css";
import "./common.css";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useMediaQueries } from "./hooks/useMediaQueries";
import { Outlet } from "react-router-dom";

import TopNavBar from "./components/TopNav/TopNavBar";
import SideNavBar from "./components/SideNav/SideNavBar";
import ToastContainer from "./components/Toasts/ToastContainer";
import Loading from "./components/Loading";
import { AuthenticatedTemplate } from "@azure/msal-react";
import { useQuery } from "@tanstack/react-query";
import RequireAuth from "./components/RequireAuth";
import Opendays from "./components/pages/Opendays";
import { useAuthFetch } from "./lib/MSAL";

export default function App() {
    const fetch = useAuthFetch();

    const {
        data: activeOpenday,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["openday", "active"],
        queryFn: async () => {
            const response = await fetch("/api/opendays/active");
            if (!response.ok) return null;
            const data = await response.json();
            const [year, month, day] = data.date.split("-");
            return `${day}.${month}.${year}`;
        },
        staleTime: Infinity,
        refetchInterval: (query) => (query.state.data === null ? 3000 : 60000),
        retry: 2,
    });

    const [sideBarCollapsed, _setSideBarCollapsed] = useState(
        localStorage.getItem("sidebarCollapsed") !== "false"
    );
    const { md, sm, xs } = useMediaQueries();
    const [manualCollapseState, setManualCollapseState] = useState(undefined);

    const setSideBarCollapsed = useCallback((sideBarCollapsed) => {
        localStorage.setItem(
            "sidebarCollapsed",
            sideBarCollapsed ? "true" : "false"
        );
        _setSideBarCollapsed(sideBarCollapsed);
    }, []);

    const sidebarMobileClickHandler = useCallback(() => {
        if ((sm || xs) && !sideBarCollapsed) setSideBarCollapsed(true);
    }, [xs, sm, sideBarCollapsed, setSideBarCollapsed]);

    function handleToggle(collapsed) {
        setManualCollapseState(collapsed);
        setSideBarCollapsed(collapsed);
    }

    const getClasses = useCallback(() => {
        return sideBarCollapsed ?
                "sidebar-collapsed h-auto p-2 p-sm-0"
            :   "sidebar-expanded h-100";
    }, [sideBarCollapsed]);

    if (md && !sideBarCollapsed && manualCollapseState === undefined)
        setSideBarCollapsed(true);
    else if (
        !(md || sm || xs) &&
        sideBarCollapsed &&
        manualCollapseState !== true
    )
        setSideBarCollapsed(false);

    return (
        <div className="wmc4-app d-flex flex-column flex-nowrap">
            <header>{!isLoading && activeOpenday && <TopNavBar />}</header>
            <main className="flex-grow overflow-hidden">
                <ToastContainer></ToastContainer>
                <div className="d-flex flex-column-reverse flex-sm-row flex-nowrap h-100">
                    {!isLoading && activeOpenday && (
                        <AuthenticatedTemplate>
                            <div
                                className={
                                    getClasses() +
                                    " sidebar bg-body-tertiary col-scrollable h-sm-100 border-end pe-0"
                                }
                                onClick={sidebarMobileClickHandler}
                            >
                                <SideNavBar
                                    onToggle={handleToggle}
                                    collapsed={sideBarCollapsed}
                                    showCollapseButton={!md}
                                />
                            </div>
                        </AuthenticatedTemplate>
                    )}
                    <div className="col col-scrollable border-end p-3 h-100">
                        {isLoading ?
                            <Loading />
                        : !activeOpenday ?
                            <RequireAuth>
                                <Opendays />
                            </RequireAuth>
                        :   <Suspense fallback={<Loading />}>
                                <Outlet />
                            </Suspense>
                        }
                    </div>
                </div>
            </main>
            {/*
            <footer>
                &copy; 2024 HTL Villach - Informatik. Alle Rechte vorbehalten.
            </footer>
            */}
        </div>
    );
}
