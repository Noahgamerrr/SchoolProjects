import mongoose from "mongoose";
import { Tour } from "../tours/tours-model.js";

export const studentSchema = new mongoose.Schema(
    {
        shortform: {
            type: String,
            required: true,
        },
        firstname: {
            type: String,
            required: true,
        },
        lastname: {
            type: String,
            required: true,
        },
        stations: [
            {
                stationId: String,
                isLeader: Boolean,
            },
        ],
        guideTeams: [
            {
                teamId: String,
                isLeader: Boolean,
            },
        ],
        activity: [
            {
                time: Date,
                activity: String,
            },
        ],
        currentTour: {
            type: mongoose.Schema.Types.ObjectId,
            ref: function () {
                return Tour.modelName;
            },
        },
    },
    { optimisticConcurrency: true }
);

export const replaceModel = (model) => {
    Student = model;
};

/**
 * @type {mongoose.Model}
 */
export let Student = null;
