import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import { useQuery } from "@tanstack/react-query";
import { useAuthFetch } from "../../lib/MSAL";
import Loading from "../Loading";
import { useState } from "react";
import ActiveTour from "./ActiveTour";
import { useSearchParams } from "react-router-dom";
import { showToast } from "../Toasts/ToastContainer";
import StartTour from "./StartTour";
import ErrorPage from "../Errors/ErrorPage.jsx";
import ClientError from "../Errors/ClientError.jsx";

function CurrentTour() {
    const { instance } = useMsal();
    const activeAccount = instance.getActiveAccount();
    const shortform = activeAccount.username.split("@")[0];
    const fetch = useAuthFetch();
    const [ searchParams ] = useSearchParams();
    const [ toastShown, setToastShown ] = useState(false);
    const level = searchParams.get("level");
    const message = searchParams.get("message");
    const roles = instance.getActiveAccount()?.idTokenClaims.roles;



    /*
    const { data: students, error: studentsError } = useQuery({
        queryKey: ["students"],
        queryFn: async () => {
            const response = await fetch("/api/students");
            const data = await response.json();
            return data;
        },
        staleTime: Infinity,
    });
    */

    const {data: data, error:studentsError} = useQuery({
        queryKey: ["guide-tours",`guide-${shortform}`],
        queryFn: async () => {
            let data = {};
            let response = await fetch("/api/students/?shortform="+shortform);
            data.guide = (await response.json())[0];
            response = await fetch(`/api/students/${data.guide._id}/tours`);
            data.tours = await response.json();
            data.currentTour = data.tours.find(t=> t._id == data.guide.currentTour)

            return data;
        },
        staleTime: Infinity,
    });
    

    if(studentsError){
        return <ClientError title={"Error while fetching current tour data!"} />
    }
    if (!data?.guide) return <Loading />;

    if (studentsError) return (
        <>
            <h2>Error!</h2>
            <p>
                Could not load students!
            </p>
        </>
    )
    

    let tourNo = data?.guide?.activity?.filter(a => a.activity == "tour").length;

    if ( !toastShown && level && message ) {
        let header = "Success!";
        if (level == "Danger") header = "Error!";
        showToast(header, "", message, level);
        setToastShown(true);
    }
    
    const unauthorized = (
        <p>
            You are not allowed to view this page.
            <br />
            <UnauthenticatedTemplate>
                Please{" "}
                <a
                    href=""
                    onClick={(e) => {
                        e.preventDefault();
                        instance.loginPopup();
                    }}
                >
                    log in
                </a>{" "}
                to get access
            </UnauthenticatedTemplate>
        </p>
    );
    const content = (roles?.includes("guide")||roles?.includes("admin")) ? (
        <>
            {data ?( data.currentTour ? 
                <ActiveTour student={data.guide} tour={data.currentTour} tourNumber={tourNo}/> :
                <StartTour guideId={data.guide._id}></StartTour>):<Loading/>
            }
        </>
    ):({unauthorized})

    return (
        <>
            <AuthenticatedTemplate>{content}</AuthenticatedTemplate>
            <UnauthenticatedTemplate>{unauthorized}</UnauthenticatedTemplate>
        </>
    )
}

export default CurrentTour;