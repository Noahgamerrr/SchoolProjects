import mongoose from "mongoose";
import { Student } from "../students/students-model.js";

export const notificationPrefsSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: function () {
                return Student.modelName;
            },
            required: true,
        },
        preferences: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
    },
    { optimisticConcurrency: true }
);

export const replaceModel = (model) => {
    NotificationPreferences = model;
};

/**
 * @type {mongoose.Model}
 */

export let NotificationPreferences = null;
