import React, { lazy } from "react";
import ReactDOM from "react-dom/client";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App.jsx";
import "./index.css";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import ErrorPage from "./components/Errors/ErrorPage";

// Eslint warning is a false positive (https://stackoverflow.com/a/77877387)
const StudentActivity = lazy(
    () => import("./components/StudentList/StudentActivity")
);
const StudentDataImportForm = lazy(
    () => import("./components/StudentDataImportForm/StudentDataImportForm")
);
const StationOccupancyOverview = lazy(
    () => import("./components/StationOccupancy/Overview.jsx")
);
const Availability = lazy(
    () => import("./components/Availability/Availability")
);
const StationsManager = lazy(
    () => import("./components/StationsManager/StationsManager.jsx")
);
const StationsDetail = lazy(
    () => import("./components/StationsManager/StationsDetail.jsx")
);
const Opendays = lazy(() => import("./components/pages/Opendays"));
const StudentStations = lazy(
    () => import("./components/StudentList/StudentStations")
);
const StudentGuideTeams = lazy(
    () => import("./components/StudentList/StudentGuideTeams")
);
const GuideTeams = lazy(() => import("./components/GuideTeams/GuideTeams.jsx"));
const StudentListPage = lazy(
    () => import("./components/StudentList/StudentListPage.jsx")
);
const StationFeedback = lazy(
    () => import("./components/Feedback/StationFeedback.jsx")
);

const TourFeedback = lazy(
    () => import("./components/Feedback/TourFeedback.jsx")
);

const FeedbackSuccessPage = lazy(
    () => import("./components/Feedback/FeedbackSuccessPage.jsx")
);

const StationsTableReadonly = lazy(
    () => import("./components/StationsManager/StationsTableReadonly.jsx")
);

const StudentToursPage = lazy(
    () => import("./components/Tours/StudentToursPage.jsx")
);

const StudentTourDetailsPage = lazy(
    () => import("./components/Tours/StudentTourDetailsPage.jsx")
);

const CurrentTour = lazy(
    () => import("./components/CurrentTour/CurrentTour.jsx")
);

const AddStationToTour = lazy(
    () => import("./components/CurrentTour/AddStation.jsx")
);

const ValidateTour = lazy(
    () => import("./components/CurrentTour/ValidateTour.jsx")
);

const Homepage = lazy(() => import("./components/Homepages/Homepage.jsx"));

const AuditLog = lazy(() => import("./components/AuditLog/AuditLog.jsx"));

const NotificationTeacherDashboard = lazy(
    () => import("./components/Notifications/NotificationTeacherDashboard.jsx")
);
const NotificationResponsePage = lazy(
    () => import("./components/NotificationResponses/NotificationResponse.jsx")
)
const TourDetailsPage = lazy(
    () => import("./components/Tours/TourDetailsPage.jsx")
);
const Preferences = lazy(
    () => import("./components/Preferences/Preferences.jsx")
);

const NotVerifiedTours = lazy(
    () => import("./components/NotVerifiedTours/NotVerifiedTours.jsx")
);

const OrderStations = lazy(
    () => import("./components/OrderStations/OrderStations.jsx")
);
const AcceptNotification = lazy(
    () => import("./components/Notifications/AcceptNotification.jsx")
);
const RejectNotification = lazy(
    () => import("./components/Notifications/RejectNotification.jsx")
);

import { MsalProvider } from "@azure/msal-react";
import { createMSALInstance } from "./lib/MSAL";
import RequireAuth from "./components/RequireAuth.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: "",
                element: (
                    <RequireAuth>
                        <Homepage />
                    </RequireAuth>
                ),
            },
            {
                path: "students",
                element: (
                    <RequireAuth>
                        <StudentListPage />
                    </RequireAuth>
                ),
            },
            {
                path: "students/:id/activity",
                element: (
                    <RequireAuth>
                        <StudentActivity />
                    </RequireAuth>
                ),
            },
            {
                path: "students/:id/stations",
                element: (
                    <RequireAuth>
                        <StudentStations />
                    </RequireAuth>
                ),
            },
            {
                path: "students/:id/guide-teams",
                element: (
                    <RequireAuth>
                        <StudentGuideTeams />
                    </RequireAuth>
                ),
            },
            {
                path: "tours/:tourId",
                element: (
                    <RequireAuth>
                        <TourDetailsPage />
                    </RequireAuth>
                ),
            },
            {
                path: "students/:id/tours",
                element: (
                    <RequireAuth>
                        <StudentToursPage />
                    </RequireAuth>
                ),
            },
            {
                path: "students/:id/tours/:tourId",
                element: (
                    <RequireAuth>
                        <StudentTourDetailsPage />
                    </RequireAuth>
                ),
            },
            {
                path: "availability",
                element: (
                    <RequireAuth>
                        <Availability />
                    </RequireAuth>
                ),
            },
            {
                path: "import/students",
                element: (
                    <RequireAuth>
                        <StudentDataImportForm />
                    </RequireAuth>
                ),
            },
            {
                path: "stations",
                element: (
                    <RequireAuth>
                        <StationsManager />
                    </RequireAuth>
                ),
            },
            {
                path: "stations/read",
                element: (
                    <RequireAuth>
                        <StationsTableReadonly />
                    </RequireAuth>
                ),
            },
            {
                path: "stations/:id",
                element: (
                    <RequireAuth>
                        <StationsDetail />
                    </RequireAuth>
                ),
            },
            {
                path: "opendays",
                element: (
                    <RequireAuth>
                        <Opendays />
                    </RequireAuth>
                ),
            },
            {
                path: "notifications/send",
                element: (
                    <RequireAuth>
                        <NotificationTeacherDashboard />
                    </RequireAuth>
                ),
            },
            {
                path: "notifications/accept",
                element: (
                    <RequireAuth>
                        <AcceptNotification />
                    </RequireAuth>
                ),
            },
            {
                path: "notifications/reject",
                element: (
                    <RequireAuth>
                        <RejectNotification />
                    </RequireAuth>
                ),
            },
            {
                path: "notifications/responses",
                element: (
                    <RequireAuth>
                        <NotificationResponsePage />
                    </RequireAuth>
                ),
            },
            {
                path: "preferences",
                element: (
                    <RequireAuth>
                        <Preferences />
                    </RequireAuth>
                ),
            },
            {
                path: "currentTour",
                element: (
                    <RequireAuth>
                        <CurrentTour />
                    </RequireAuth>
                ),
            },
            {
                path: "verifyTours",
                element: (
                    <RequireAuth>
                        <NotVerifiedTours />
                    </RequireAuth>
                ),
            },
            {
                path: "/stations/:stationId/addToTour",
                element: (
                    <RequireAuth>
                        <AddStationToTour />
                    </RequireAuth>
                ),
            },
            {
                path: "/tours/:tourId/validate",
                element: (
                    <RequireAuth>
                        <ValidateTour />
                    </RequireAuth>
                ),
            },
            {
                path: "stations/order",
                element: (
                    <RequireAuth>
                        <OrderStations />
                    </RequireAuth>
                ),
            },
            /*             {
                path: "feedback",
                element: (
                    <RequireAuth>
                        <FeedbackOvervie            {
                path: "feedback",
                element: (
                    <RequireAuth>
                        <FeedbackOverview />
                    </RequireAuth>
                ),
            },w />
                    </RequireAuth>
                ),
            }, */
            {
                path: "feedback/success",
                element: <FeedbackSuccessPage />,
            },
            {
                path: "stations/:id/feedback",
                element: <StationFeedback />,
            },
            {
                path: "tours/:tourId/feedback",
                element: <TourFeedback />,
            },
            {
                path: "guide-teams",
                element: <GuideTeams />,
            },
            {
                path: "audit-log",
                element: (
                    <RequireAuth>
                        <AuditLog />
                    </RequireAuth>
                ),
            },
            /* {
                path: "loading",
                element: <Loading />,
            }, */
            {
                path: "station-occupancies",
                element: <StationOccupancyOverview />,
            },
            {
                path: "order-stations",
                element: <OrderStations />,
            },
        ],
    },
]);

const queryClient = new QueryClient();
const msalInstance = createMSALInstance();

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <MsalProvider instance={msalInstance}>
                {/* https://reactrouter.com/en/main/start/tutorial */}
                <RouterProvider router={router} />
            </MsalProvider>
        </QueryClientProvider>
    </React.StrictMode>
);
