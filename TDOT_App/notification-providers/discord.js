import dotenv from "dotenv";
dotenv.config();

/**
 * @implements NotificationServiceProvider
 */
export class DiscordNotificationServiceProvider {
    async send(data, notification) {
        const res = await fetch(data, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content: `**${notification.title}**${notification.body ? "\n" + notification.body : ""}`,
                username: "TdoT App",
            }),
        });
        return res.ok;
    }

    validate(data) {
        return data.startsWith("https://discord.com/api/webhooks/");
    }
}
