interface NotificationServiceProvider {
    send(data: any, notification: Notification): Promise<boolean>;
    validate(data: any): boolean;
}

interface Notification {
    title: string;
    body?: string;
}
