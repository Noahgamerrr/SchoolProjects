import "./SideNavBar.css";
import PropTypes from "prop-types";
import { AuthenticatedTemplate } from "@azure/msal-react";
import SideBarButton from "./SideBarButton";
import ROLES from "../../lib/roles.json";
import RoleTemplate from "../Util/RoleTemplate";
import TopNavButtonBar from "../TopNav/TopNavButtonBar";
import htlLogo from "../../assets/htl_logo.png";
import { useQuery } from "@tanstack/react-query";
import { useAuthFetch } from "../../lib/MSAL";
import SideNavCategoryLabel from "./SideNavCategoryLabel";

export default function SideNavBar({ onToggle, collapsed }) {
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
        <div
            className={
                "px-2 gap-3 d-flex flex-column flex-nowrap" +
                (collapsed ? " align-items-center" : "")
            }
        >
            {!collapsed && (
                <>
                    <span className="d-flex w-100 fs-2 align-items-center justify-content-center gap-4 mt-3 d-inline d-sm-none">
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
                        <span>TdoT App</span>
                        {activeOpenday && (
                            <AuthenticatedTemplate>
                                <div className="h-100 d-flex flex-row flex-nowrap text-muted">
                                    <span className="align-middle">
                                        {activeOpenday}
                                    </span>
                                </div>
                            </AuthenticatedTemplate>
                        )}
                    </span>
                    <span
                        className="d-inline d-sm-none d-block"
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        <TopNavButtonBar
                            beforeNavigate={() => onToggle(true)}
                        />
                    </span>
                </>
            )}
            <div
                className={
                    "d-flex justify-content-center pt-sm-2 w-100" +
                    (collapsed ? "" : " pt-0")
                }
            >
                <button
                    className="btn w-100"
                    type="button"
                    id="sidebarToggleCollapseButton"
                    onClick={() => {
                        onToggle(!collapsed);
                    }}
                >
                    {!collapsed ?
                        <>
                            <span className="d-flex flex-row align-items-center justify-content-center">
                                <i
                                    className="bi bi-list d-inline-block d-sm-none fs-1"
                                    style={{
                                        marginTop: "-0.3em",
                                        marginBottom: "-0.3em",
                                    }}
                                ></i>
                                <i className="bi bi-arrows-collapse-vertical d-none d-sm-inline-block" />
                                <span className="d-sm-none ps-2">
                                    Close menu
                                </span>
                            </span>
                        </>
                    :   <span className="d-flex flex-row align-items-center justify-content-center">
                            <i
                                className="bi bi-list d-inline-block d-sm-none fs-1"
                                style={{
                                    marginTop: "-0.3em",
                                    marginBottom: "-0.3em",
                                }}
                            ></i>
                            <i className="bi bi-arrows-expand-vertical d-none d-sm-inline-block" />
                            <span className="d-sm-none ps-2">Menu</span>
                        </span>
                    }
                </button>
            </div>

            <AuthenticatedTemplate>
                <RoleTemplate
                    requiredRoles={[
                        ROLES.APPOWNER,
                        ROLES.ADMIN,
                        ROLES.PUPIL,
                        ROLES.TEACHER,
                        ROLES.GUIDE,
                        ROLES.STATIONWORKER,
                    ]}
                >
                    <SideBarButton
                        collapsed={collapsed}
                        text="Homepage"
                        href=""
                        icon="bi bi-house-fill"
                        customActiveUrlChecker={(actual) => actual == "/"}
                    />
                    <SideBarButton
                        collapsed={collapsed}
                        text="Stations"
                        href="stations"
                        icon="bi bi-map-fill"
                    ></SideBarButton>
                    <SideBarButton
                        collapsed={collapsed}
                        text="Station Occupancy"
                        href="station-occupancies"
                        icon="bi bi-map"
                    />
                </RoleTemplate>

                <RoleTemplate
                    requiredRoles={[
                        ROLES.APPOWNER,
                        ROLES.ADMIN,
                        ROLES.TEACHER,
                        ROLES.TEAMLEAD,
                        ROLES.GUIDE,
                    ]}
                >
                    <SideNavCategoryLabel text="Guide" collapsed={collapsed} />
                    <RoleTemplate requiredRoles={[ROLES.GUIDE]}>
                        <SideBarButton
                            collapsed={collapsed}
                            text="Current Tour"
                            href="currentTour"
                            icon="bi bi-compass-fill"
                        />
                    </RoleTemplate>
                    <RoleTemplate
                        requiredRoles={[
                            ROLES.APPOWNER,
                            ROLES.ADMIN,
                            ROLES.TEACHER,
                            ROLES.TEAMLEAD,
                        ]}
                    >
                        <SideBarButton
                            collapsed={collapsed}
                            text="Availability"
                            href="availability"
                            icon="bi bi-person-walking"
                        ></SideBarButton>
                    </RoleTemplate>
                </RoleTemplate>

                <RoleTemplate
                    requiredRoles={[
                        ROLES.ADMIN,
                        ROLES.TEACHER,
                        ROLES.TRUSTED_STUDENT,
                    ]}
                >
                    <SideNavCategoryLabel
                        text="Verifier"
                        collapsed={collapsed}
                    />
                    <SideBarButton
                        collapsed={collapsed}
                        text="Verify Tours"
                        href="verifyTours"
                        icon="bi bi-patch-check-fill"
                    />
                </RoleTemplate>

                <RoleTemplate
                    requiredRoles={[ROLES.APPOWNER, ROLES.ADMIN, ROLES.TEACHER]}
                >
                    <SideNavCategoryLabel
                        text="Teacher"
                        collapsed={collapsed}
                    />

                    <SideBarButton
                        collapsed={collapsed}
                        text="Students"
                        href="students"
                        icon="bi bi-people-fill"
                    ></SideBarButton>
                    <SideBarButton
                        collapsed={collapsed}
                        text="Guide-Teams"
                        href="guide-teams"
                        icon="bi bi-signpost-split-fill"
                    />
                    <SideBarButton
                        collapsed={collapsed}
                        text="Send Notifications"
                        href="notifications/send"
                        icon="bi bi-send-fill"
                    />
                </RoleTemplate>

                <RoleTemplate requiredRoles={[ROLES.APPOWNER, ROLES.ADMIN]}>
                    <SideNavCategoryLabel text="Admin" collapsed={collapsed} />
                    <SideBarButton
                        collapsed={collapsed}
                        text="Opendays"
                        href="opendays"
                        icon="bi bi-calendar-plus-fill"
                    />
                    <SideBarButton
                        collapsed={collapsed}
                        text="Import&nbsp;students"
                        href="import/students"
                        icon="bi bi-cloud-arrow-up-fill"
                    />
                    <SideBarButton
                        collapsed={collapsed}
                        text="Log"
                        href="audit-log"
                        icon="bi bi-terminal-fill"
                    />
                    <SideBarButton
                        collapsed={collapsed}
                        text="Order Stations"
                        href="order-stations"
                        icon="bi bi-list-ol"
                    />
                </RoleTemplate>
            </AuthenticatedTemplate>
            <RoleTemplate
                requiredRoles={[ROLES.APPOWNER, ROLES.ADMIN, ROLES.TEACHER, ROLES.STATIONWORKER]}
            >
                <SideBarButton
                    collapsed={collapsed}
                    text="Station Calls"
                    href="notifications/responses"
                    icon="bi bi-calendar-plus-fill"
                />
            </RoleTemplate>
        </div>
    );
}

SideNavBar.propTypes = {
    collapsed: PropTypes.bool,
    onToggle: PropTypes.func,
};
