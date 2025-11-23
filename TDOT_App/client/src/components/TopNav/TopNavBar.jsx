import "./TopNavBar.css";

import { AuthenticatedTemplate } from "@azure/msal-react";

import htlLogo from "../../assets/htl_logo.png";

import { NavLink } from "react-router-dom";

import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { useAuthFetch } from "../../lib/MSAL";
import { useQuery } from "@tanstack/react-query";
import TopNavButtonBar from "./TopNavButtonBar";

export default function TopNavBar() {
    const fetch = useAuthFetch();

    const { data: activeOpenday } = useQuery({
        queryKey: ["openday", "active"],
        queryFn: async () => {
            const response = await fetch("/api/opendays/active");
            if (!response.ok) return null;
            const data = await response.json();
            const [year, month, day] = data.date.split("-");
            return `${day}.${month}.${year}`;
        },
        staleTime: Infinity,
    });

    return (
        <Navbar
            id="topNav"
            collapseOnSelect
            expand="sm"
            className="bg-body-tertiary ps-3 pe-3 d-none d-sm-flex"
        >
            <NavLink to="/">
                <Navbar.Brand className="h-100 fs-2 d-flex flex-row flex-nowrap">
                    <span
                        className="d-inline-block align-middle"
                        style={{
                            height: "1.5em",
                            width: "auto",
                        }}
                    >
                        <img
                            alt="HTL Logo"
                            src={htlLogo}
                            className="d-inline-block align-top navbar-logo rounded h-100 w-100"
                        />
                    </span>
                    <span className="align-middle">
                        &nbsp; TdoT App - Team A
                    </span>
                </Navbar.Brand>
            </NavLink>
            {activeOpenday && (
                <AuthenticatedTemplate>
                    <div className="h-100 fs-2 d-flex flex-row flex-nowrap text-muted">
                        <span className="align-middle">{activeOpenday}</span>
                    </div>
                </AuthenticatedTemplate>
            )}

            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="me-auto"></Nav>
                <Nav>
                    <TopNavButtonBar />
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}
