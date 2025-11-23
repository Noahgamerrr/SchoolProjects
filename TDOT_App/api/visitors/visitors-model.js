import mongoose from "mongoose";

export const visitorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: false,
    },
    address: {
        type: String,
        required: false,
    },
    phone: {
        type: String,
        required: false,
    },
    grade: {
        type: Number,
        required: false,
    },
    school: {
        type: String,
        required: false,
    },
    potential: {
        type: Boolean,
        required: false
    }
});

export const replaceModel = (model) => {
    Visitor = model;
};

/**
 * @type {mongoose.Model}
 */

export let Visitor = null;
