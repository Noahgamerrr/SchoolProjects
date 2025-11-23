export function getLatestActivityFormatted(activities) {
    if (!activities || activities.length === 0) {
        return "No activity recorded";
    }
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const latestActivity = activities[0];

    const time = new Date(latestActivity.time);
    const hours = time.getHours().toString().padStart(2, "0");
    const minutes = time.getMinutes().toString().padStart(2, "0");

    return `${latestActivity.activity} at ${hours}:${minutes}`;
}

export function getLatestActivity(activities) {
    if (!activities || activities.length === 0) {
        return "No activity recorded";
    }
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    return activities[0];
}

export function getBSColorClassOfActivity(activity) {
    let currActivityName = activity.split(" at ")[0];
    let color;
    switch (currActivityName) {
        case "home":
            color = "table-secondary";
            break;
        case "available":
            color = "table-success";
            break;
        case "break":
            color = "table-warning";
            break;
        case "tour":
            color = "table-primary";
            break;
        case "station":
            color = "table-primary";
            break;
        default:
            color = "";
            break;
    }
    return color;
}
