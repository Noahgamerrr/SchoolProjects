import PropTypes from "prop-types";
import { useAuthFetch } from "../../lib/MSAL";
import { useQuery } from "@tanstack/react-query";
import Loading from "../Loading";

export default function StationName({ stationId }) {
    const fetch = useAuthFetch();

    const { data: station } = useQuery({
        queryKey: ["station-name", stationId],
        queryFn: async () => {
            const response = await fetch(`/api/stations/${stationId}`);
            const data = await response.json();
            return data;
        }
    });

    if (!station) return <Loading/>
    
    return (
        <p>{station.name}</p>
    )
}

StationName.propTypes = {
    stationId: PropTypes.string
}