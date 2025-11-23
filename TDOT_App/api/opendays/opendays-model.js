import mongoose from "mongoose";
import { Station } from "../stations/stations-model.js";

const OpendaySchema = new mongoose.Schema({
    date: {
        type: String,
        required: true,
        unique: true,
        validate: (d) => {
            return d.match(/^\d{4}-\d{2}-\d{2}$/);
        },
    },
    active: {
        type: Boolean,
        required: true,
        default: false,
    },
    locked: {
        type: Boolean,
        required: true,
        default: false,
    },
    stationOrdering: [
        new mongoose.Schema({
            id: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
            },
            order: {
                type: Number,
                required: true
            }
        }, {_id: false})
    ]
});

export const Openday = mongoose.model("Openday", OpendaySchema);
