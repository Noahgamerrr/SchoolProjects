import { Station } from "../stations/stations-model.js";
import { StationFeedback } from "./station-feedback-model.js";
import auditLogHandlers from "../audit-log/audit-log-handlers.js";
import { getCollectionName } from "../opendays/opendays-switcher.js";
import { logger } from "../../logging/log.js";

// POST /api/stations/:id/feedback
export const create = async (req, res) => {
    const feedback = new StationFeedback({
        station: req.params.id,
        rating: req.body.rating,
        feedback: req.body.feedback,
    });

    if (!feedback.station) return res.status(400).send();

    const station = await Station.findById(feedback.station);

    if (!station) return res.status(400).send("Station not found");

    feedback
        .save()
        .then(async () => {
            await auditLogHandlers.addLog(
                `Feedback was added to station: ${station.name}`,
                undefined,
                {
                    after: {
                        rating: feedback.rating,
                        feedback: feedback.feedback
                    },
                    changeType: "add"
                }
            );
            res.status(201).send(feedback);
        })
        .catch((err) => {
            logger.error(err);
            res.status(500).send();
        });
};

// GET /api/stations/:id/feedback
export const getAllForStation = async (req, res) => {
    StationFeedback.find({ station: req.params.id })
        .populate("station")
        .then((feedback) => {
            if (!feedback) return res.status(404).send();
            res.status(200).json(feedback);
        })
        .catch((err) => {
            res.status(500).send();
        });
};

// GET /api/stations/:id/feedback/average
export const getAverageForStation = async (req, res) => {
    StationFeedback.find({ station: req.params.id })
        .then((feedback) => {
            if (!feedback) return res.status(404).send();
            const average =
                feedback.reduce((acc, f) => acc + f.rating, 0) /
                feedback.length;
            res.status(200).json({ average });
        })
        .catch((err) => {
            res.status(500).send();
        });
};

// DELETE /api/stations/:station_id/feedback/:feedback_id
export const remove = async (req, res) => {
    StationFeedback.findOneAndDelete({
        station: req.params.station_id,
        _id: req.params.feedback_id,
    })
        .then(async (feedback) => {
            if (!feedback) return res.status(404).send();
            const station = await Station.findById(req.params.station_id);
            await auditLogHandlers.addLog(
                `Feedback was deleted from station: ${station.name}`,
                req.authenticatedUser,
                {
                    before: {
                        rating: feedback.rating,
                        feedback: feedback.feedback
                    },
                    changeType: "delete"
                }
            );
            res.status(200).send();
        })
        .catch((err) => {
            res.status(500).send();
        });
};

// No PUT, as feedback should not be updated (also anonymous endpoint, so no way of authorizing the user to update feedback)

export default {
    create,
    getAllForStation,
    getAverageForStation,
    remove,
};
