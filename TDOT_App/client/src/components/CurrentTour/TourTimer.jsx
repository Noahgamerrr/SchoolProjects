import { useEffect, useState } from "react";

export default function TourTimer({ tour }) {
	const startDate = new Date(tour.startTime);
	const [passedTimeString, setPassedTimeString] = useState("-");

	function getFormattedStartTime(){
        return `${startDate.getHours() < 10 ? "0" : ""}${startDate.getHours()}:${startDate.getMinutes() < 10 ? "0" : ""}${startDate.getMinutes()}`;
    }

	function formatTimeToString(time){
		const seconds = Math.floor((time / 1000) % 60);
		const minutes = Math.floor((time / (1000 * 60)) % 60);
		const hours = Math.floor((time / (1000 * 60 * 60)) % 24);
		let timeStr = "";
		if(hours > 0){
			timeStr += `${hours}h `
			if(minutes < 10) timeStr += '0';
		}
		if(hours > 0 || minutes > 0){
			timeStr += `${minutes}m `
			if(seconds < 10) timeStr += '0';
		}
		timeStr += `${seconds}s`
		return timeStr;
	}

	useEffect(() => {
		if(startDate){
			const interval = setInterval(()=> {
				let passedTime = new Date().getTime() - startDate.getTime()
				setPassedTimeString(formatTimeToString(passedTime));
			}, 1000)
			return () => clearInterval(interval);
		}
	}, []);
	

	return (
		<p>Tour started <span className="text-info">{passedTimeString}</span> ago, at: {getFormattedStartTime()}</p>
	)
}