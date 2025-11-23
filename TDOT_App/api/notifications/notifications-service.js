import { NotificationPreferences } from "./notifications-model.js";

import { EmailNotificationServiceProvider } from "../../notification-providers/email.js";
import { DiscordNotificationServiceProvider } from "../../notification-providers/discord.js";
import { NtfyNotificationServiceProvider } from "../../notification-providers/ntfy.js";
let transporter = undefined;

/**
 * @type {[key: string]: NotificationService}
 */
export const serviceHandlers = {
    email: new EmailNotificationServiceProvider(),
    discord: new DiscordNotificationServiceProvider(),
    ntfy: new NtfyNotificationServiceProvider(),
};

export class NotificationService {
    /**
     *
     * @param {Notification} notification
     * @param {import("bson").ObjectId[]} recipients
     */
    static async sendNotification(notification, recipients) {
        const prefs = await NotificationPreferences.find({
            studentId: { $in: recipients.map((r) => r._id) },
        });

        await Promise.allSettled(
            prefs.map((pref) => {
                Promise.allSettled(
                    Object.entries(pref.preferences).map(
                        async ([type, data]) => {
                            try {
                                if (data)
                                    await serviceHandlers[type].send(
                                        data,
                                        notification
                                    );
                            } catch {
                                //logger.error(err);
                            }
                        }
                    )
                );
            })
        );
    }
}
