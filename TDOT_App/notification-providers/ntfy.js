import { logger } from "../logging/log.js";

/**
 * @implements NotificationServiceProvider
 */
export class NtfyNotificationServiceProvider {
    async send(data, notification) {
        try {
            const res = await fetch("https://ntfy.sh", {
                method: "POST",
                body: JSON.stringify({
                    topic: data,
                    title: notification.title,
                    message: notification.body,
                    // TODO: Provide correct link
                    click: "https://kendlbat.dev/",
                }),
            });
            return res.ok;
        } catch (e) {
            logger.error(e);
        }
    }

    validate(data) {
        return true;
    }
}
