import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { logger } from "../logging/log.js";
dotenv.config();

/**
 * @implements NotificationServiceProvider
 */
export class EmailNotificationServiceProvider {
    #transporter;

    constructor() {
        if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
            this.#transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GMAIL_PASS,
                },
            });
            logger.info("Email notification service online");
        } else {
            logger.info(
                "Email notification service not activated, provide gmail credentials in .env"
            );
        }
    }

    async send(data, notification) {
        try {
            const mailOptions = {
                from: "SYP Team A",
                to: data,
                subject: notification.title,
                text: notification.body,
            };
            this.#transporter?.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error(error);
                } else {
                    // console.log("Email sent: " + info.response);
                }
            });
        } catch (e) {
            logger.warn(e);
        }
    }

    validate(data) {
        return data.includes("@");
    }
}
