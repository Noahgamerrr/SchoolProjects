import { logger } from "../../logging/log.js";
import { Student } from "../students/students-model.js";
import { createGuideRequest } from "./guide-request.js";
import { NotificationPreferences } from "./notifications-model.js";
import {
    NotificationService,
    serviceHandlers,
} from "./notifications-service.js";

const RESPONSE_ENTITLEMENTS = {};

// GET /api/notifications/responses/pending
export const getPendingResponses = async (req, res) => {
    logger.debug("Sending response response");
    logger.debug("returning: " + JSON.stringify(RESPONSE_ENTITLEMENTS));
    if (!req.authenticatedUser) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const userShortform = req.authenticatedUser.split("@")[0];
    const user = await Student.findOne({ shortform: userShortform });
    return res
        .status(200)
        .json(Object.keys(RESPONSE_ENTITLEMENTS[user._id] || {}));
};

// POST /api/notifications/responses
export const sendResponse = async (req, res, next) => {
    const target = req.header("x-response-target");
    const accept = req.header("x-accept-calling");
    logger.debug("accept: " + JSON.stringify(req.body));
    if (!req.authenticatedUser) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const userShortform = req.authenticatedUser.split("@")[0];
    const user = await Student.findOne({ shortform: userShortform });

    if (target) {
        // respond to individual
        // check for validity of target
        if (
            !RESPONSE_ENTITLEMENTS ||
            !RESPONSE_ENTITLEMENTS[user._id][target]
        ) {
            return res.status(401).json({ error: "Invalid target" });
        }
        const title = "Call to Station - Response";
        const body = `I ${accept === "accept" ? "accept" : "decline"} the call to my station.`;
        delete RESPONSE_ENTITLEMENTS[user._id][target];
        req.body = { title, body, recipients: [target] };
        return sendNotification(req, res, next);
    } else {
        const title = "Call to Station - Response";
        const body = `I ${accept === "accept" ? "accept" : "decline"} the call to my station.`;
        delete RESPONSE_ENTITLEMENTS[user._id];
        req.body = {
            title,
            body,
            recipients: Object.keys(RESPONSE_ENTITLEMENTS[user._id]),
        };
        return sendNotification(req, res, next);
    }
};

// POST /api/notifications
export const sendNotification = async (req, res) => {
    let { title, body, recipients, recipientsGroups } = req.body;
    const allowResponse = req?.header("x-allow-response");
    logger.debug("response: " + allowResponse);
    logger.debug("response truthy: " + (allowResponse === "allow"));

    if (!recipients) recipients = [];
    if (!recipientsGroups) recipientsGroups = {};

    if (
        !title ||
        !(recipients.length || Object.values(recipientsGroups).some(Boolean))
    ) {
        return res.status(400).json({
            error: "Title and recipients are required",
        });
    }

    let recs = new Set(
        await Promise.all(recipients.map((r) => Student.findById(r)))
    );

    if (Object.values(recipientsGroups).some(Boolean)) {
        if (recipientsGroups.all) {
            const students = await Student.find({});
            students.forEach((student) => recs.add(student));
        } else {
            if (recipientsGroups.workers) {
                const students = await Student.find({
                    "stations.0": { $exists: true },
                });
                students.forEach((student) => recs.add(student));
            }
            if (recipientsGroups.guides) {
                const students = await Student.find({
                    "guideTeams.0": { $exists: true },
                });
                students.forEach((student) => recs.add(student));
            }
            if (recipientsGroups.guideTeamLeads) {
                const students = await Student.find({
                    "guideTeams.isLeader": true,
                });
                students.forEach((student) => recs.add(student));
            }
        }
    }

    NotificationService.sendNotification(
        {
            title,
            body,
        },
        Array.from(recs)
    );
    if (allowResponse === "allow") {
        logger.debug("Registering notification response");
        const user = req.authenticatedUser.split("@")[0];
        const studentId = (await Student.findOne({ shortform: user }))._id;
        const ids = [...recs].map((s) => s._id);
        ids.forEach((id) => {
            if (!RESPONSE_ENTITLEMENTS[id]) RESPONSE_ENTITLEMENTS[id] = {};
            RESPONSE_ENTITLEMENTS[id][studentId] = true;

            // set timeout for response allowance destruction
            setTimeout(() => {
                logger.debug(`removing id ${studentId} for ${id}`);
                delete RESPONSE_ENTITLEMENTS[id][studentId];
            }, 30_000); // due to this timeout I really do not want to test this
        });
        logger.debug(JSON.stringify(RESPONSE_ENTITLEMENTS));
    }

    res.status(200).json(Array.from(recs).map((r) => r.shortform));
};

// PUT /api/notifications/providers/:provider
export const subscribeToProvider = async (req, res) => {
    const { provider } = req.params;
    const { data } = req.body;

    // console.log(provider, data);

    if (!provider || !data) {
        return res.status(400).send("Provider and data are required");
    }

    if (!serviceHandlers[provider].validate(data)) {
        return res.status(400).send("Invalid data for provider");
    }

    const user = req.authenticatedUser.split("@")[0];

    const student = await Student.findOne({ shortform: user });

    if (!student) {
        return res.status(412).json({
            error: "Student not found",
        });
    }
    let prefs = await NotificationPreferences.findOne({
        studentId: student._id,
    });

    if (!prefs) {
        prefs = new NotificationPreferences({
            studentId: student._id,
            preferences: {},
        });
    }

    await NotificationPreferences.updateOne(
        { studentId: student._id },
        {
            preferences: {
                ...prefs.preferences,
                [provider]: data,
            },
        },
        { upsert: true }
    );

    res.status(200).json({ message: "Subscribed to provider" });
};

// DELETE /api/notifications/providers/:provider
export const unsubscribeFromProvider = async (req, res) => {
    const { provider } = req.params;

    const user = req.authenticatedUser.split("@")[0];

    const student = await Student.findOne({ shortform: user });

    if (!student) {
        return res.status(412).json({
            error: "Student not found",
        });
    }

    const prefs =
        (await NotificationPreferences.findOne({
            studentId: student._id,
        })) || new NotificationPreferences({ studentId: student._id });

    await NotificationPreferences.updateOne(
        { studentId: student._id },
        {
            preferences: {
                ...prefs.preferences,
                [provider]: undefined,
            },
        },
        { upsert: true }
    );

    res.status(200).json({ message: "Unsubscribed from provider" });
};

// POST /api/notifications/providers/:provider/test
export const testNotificationProvider = async (req, res) => {
    if (!req.authenticatedUser)
        return res.status(401).json({ error: "Unauthorized" });

    const user = req.authenticatedUser.split("@")[0];

    const student = await Student.findOne({ shortform: user });

    if (!student) {
        return res.status(412).json({
            error: "Student not found",
        });
    }

    const prefs = await NotificationPreferences.findOne({
        studentId: student._id,
    });

    if (!prefs || !serviceHandlers[req.params.provider]) {
        return res.status(412).json({
            error: "No preferences found",
        });
    }

    const { provider } = req.params;

    const data = prefs.preferences[provider];

    if (!data) {
        return res.status(412).json({
            error: "Provider not subscribed",
        });
    }

    await serviceHandlers[provider].send(data, {
        title: "Test Notification",
        body: "This is a test notification",
    });
    res.status(200).json({ message: "Notification sent" });
};

// GET /api/notifications/providers
export const getProviderSettings = async (req, res) => {
    if (!req.authenticatedUser)
        return res.status(401).json({ error: "Unauthorized" });

    const user = req.authenticatedUser.split("@")[0];

    const student = await Student.findOne({ shortform: user });

    if (!student) {
        return res.status(412).json({
            error: "Student not found",
        });
    }

    const prefs = await NotificationPreferences.findOne({
        studentId: student._id,
    });

    if (!prefs) return res.status(200).json({});

    res.status(200).json(prefs.preferences);
};

export const requestGuides = async (req, res) => {
    if (!req.body.amount) return res.status(400).json({ error: "No amount" });
    if (!req.body.location) return res.status(400).json({ error: "No count" });

    let amount = parseInt(req.body.amount);
    let location = req.body.location;

    if (isNaN(amount)) return res.status(400).json({ error: "Invalid amount" });
    if (amount < 1)
        return res.status(400).json({ error: "Amount must be > 0" });

    logger.info(
        `${req.authenticatedUser} requesting ${amount} guides to ${location}`
    );

    try {
        if (!(await createGuideRequest(amount, location, req.get("origin"))))
            return res.status(400).json({ error: "Some error occurred" });
    } catch (availableGuides) {
        return res.status(412).json({
            error: `Only ${availableGuides} guides available`,
            availableGuides,
        });
    }

    res.sendStatus(200);
};
