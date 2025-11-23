import mongoose from "mongoose";
import { Station } from "../stations/stations-model.js";

export const stationFeedbackSchema = new mongoose.Schema(
    {
        station: {
            type: mongoose.Schema.Types.ObjectId,
            ref: function () {
                return Station.modelName;
            },
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        feedback: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

export const replaceModel = (model) => {
    StationFeedback = model;
};

/**
 * @type {mongoose.Model}
 */

export let StationFeedback = null;
