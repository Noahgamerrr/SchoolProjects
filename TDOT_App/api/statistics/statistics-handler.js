import { Student } from "../students/students-model.js";
import { Tour } from "../tours/tours-model.js";
import { Station } from "../stations/stations-model.js";

async function breakStatistics() {
    let studentsTakingBreak = await Student.find().lean();
    studentsTakingBreak = studentsTakingBreak.reduce((acc, curr) => {
        if (!curr.activity.length) return acc;
        const latestTime = Math.max(...curr.activity.map((ac) => ac.time));
        const latestActivity = curr.activity.find(
            (ac) => ac.time.getTime() == latestTime
        );
        if (latestActivity.activity.toLowerCase() === "break")
            acc.push({
                name: `${curr.lastname} ${curr.firstname}`,
                time: latestActivity.time,
            });
        return acc;
    }, []);
    studentsTakingBreak.sort((a, b) => a.time - b.time);
    return studentsTakingBreak;
}

async function toursStatistics() {
    const tours = await Tour.find().lean();
    const allHours = tours.map((t) => t.startTime.getHours());
    const minHour = Math.min(...allHours);
    const maxHour = Math.max(...allHours);
    const array = [];
    for (let i = minHour; i <= maxHour; i++)
        array.push({
            hour: `${i < 10 ? "0" + i : i}:00`,
            amount: 0,
            visitors: 0,
        });
    return tours.reduce((acc, curr) => {
        const startingHour = curr.startTime.getHours();
        const hourlyAmount = acc.find(
            (h) => parseInt(h.hour.split(":")[0]) == startingHour
        );
        hourlyAmount.amount++;
        hourlyAmount.visitors += curr.visitors.length;
        return acc;
    }, array);
}

const stationStatistics = async (req, res) => {
    const tours = await Tour.find().lean();
    const stations = await Station.find().lean();
    const stationData = tours.reduce((acc, curr) => {
        for (let station of curr.stations) {
            const [start, end] = [station.time?.start, station.time?.end];
            if (!start || !end) continue;
            if (!acc[station.id])
                acc[station.id] = {
                    name: stations.find((st) => st._id.equals(station.id)).name,
                    timesVisited: 1,
                    averageTimeSpent: end - start,
                };
            else {
                acc[station.id].timesVisited++;
                acc[station.id].averageTimeSpent += end - start;
            }
        }
        return acc;
    }, {});
    for (let station in stationData) {
        let avgTimeMillis = Math.floor(
            stationData[station].averageTimeSpent /
                stationData[station].timesVisited
        );
        let avgTimeSeconds = Math.floor(avgTimeMillis / 1000);
        let avgTimeStr = `${Math.floor(avgTimeSeconds / 60)}min ${avgTimeSeconds % 60}s`;
        stationData[station].averageTimeSpent = avgTimeStr;
    }
    return stationData;
};

export const getTeacherStatistics = async (req, res) => {
    const stats = {
        studentsOnBreak: await breakStatistics(),
        toursStarted: await toursStatistics(),
        stations: await stationStatistics(),
    };
    res.status(200).json(stats);
};

export default {
    breakStatistics,
    toursStatistics,
    stationStatistics,
    getTeacherStatistics,
};
