import mongoose from "mongoose";
import {Student} from "../students/students-model.js";
import {Station} from "../stations/stations-model.js";
import {Visitor} from "../visitors/visitors-model.js";
import {generateNewTourIdentifier} from "./tours-handlers.js";

export const tourSchema = new mongoose.Schema({
    identifier: {
        type: String,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: false,
    },
    verified: {
        type: Boolean,
        required: true,
        default: false,
    },
    guide: {
        type: mongoose.Schema.Types.ObjectId,
        ref: function () {
            return Student.modelName;
        },
        required: true,
    },
    stationQueue: [
        new mongoose.Schema({
            station: {
                type: mongoose.Schema.Types.ObjectId,
                ref: function () {
                    return Station.modelName;
                },
            },
            order: {
                type: Number,
                required: true
            }
        }, {_id: false})
    ],
    stations: [
        new mongoose.Schema(
            {
                // Disable automatic _id

                id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: function () {
                        return Station.modelName;
                    },
                    required: true,
                },
                time: {
                    type: new mongoose.Schema(
                        {
                            start: {
                                type: Date,
                                required: true,
                            },
                            end: {
                                type: Date,
                                required: false,
                            },
                        },
                        {_id: false}
                    ),
                    required: false,
                },
            },
            {_id: false}
        ),
    ],
    visitors: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: function () {
                return Visitor.modelName;
            },
            required: true,
        },
    ],
    feedbacks: [
        {
            _id: {
                type: mongoose.Types.ObjectId,
                required: true,
                default: () => new mongoose.Types.ObjectId(),
            },
            rating: {
                type: Number,
                required: true,
                min: 1,
                max: 5
            },
            favouriteStation: {
                type: mongoose.Schema.Types.ObjectId,
                ref: function () {
                    return Station.modelName;
                },
                required: false,
            },
            leastFavouriteStation: {
                type: mongoose.Schema.Types.ObjectId,
                ref: function () {
                    return Station.modelName;
                },
                required: false,
            },
            additionalFeedback: {
                type: String,
                required: false
            }
        },
    ],
    numberOfVisitors: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    }
});

async function customValidator(tour, next) {
    // console.log("Validating tour: ", tour);

    if (!tour.startTime && tour.endTime)
        return next(
            new mongoose.Error.ValidationError(
                this,
                "Start time must be set if end time is set"
            )
        );

    if (
        tour.endTime &&
        new Date(tour.endTime).getTime() <= new Date(tour.startTime).getTime()
    )
        return next(
            new mongoose.Error.ValidationError(
                this,
                "End time must be after start time"
            )
        );

    next();
}


tourSchema.pre("save", async function (next) {
    if(!this.identifier)
        this.identifier = await generateNewTourIdentifier();
    next()
})
tourSchema.pre("validate", async function (next) {
    await customValidator(this, next);
});
tourSchema.pre("findOneAndUpdate", async function (next) {
    await customValidator(this._update, next);
});

export const replaceModel = (model) => {
    Tour = model;
};

/**
 * @type {mongoose.Model}
 */

export let Tour = null;
