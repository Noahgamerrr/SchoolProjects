import mongoose from "mongoose";

export const stationsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    roomNr: {
        type: String,
        default: "TEMP",
        required: true,
    },
    interactType: {
        type: String,
        required: true,
        enum: [
            "other",
            "visual",
            "audio-visual",
            "interactive",
            "problem-solving",
        ],
        default: "other",
    },
    tags: [String],
    capacity: { type: Number, min: 1, required: true, default: 1 },
    minWorkers: { type: Number, min: 1, required: true, default: 1 },
    maxWorkers: { type: Number, min: 1, required: false },
    visitorsAtTime: { type: [Object], required: false, default: [] },
});

export const replaceModel = (model) => {
    Station = model;
};

/**
 * @type {mongoose.Model}
 */

export let Station = null;
