import mongoose from "mongoose";

export const guideTeamsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
});

export const replaceModel = (model) => {
    GuideTeam = model;
};

/**
 * @type {mongoose.Model}
 */

export let GuideTeam = null;

guideTeamsSchema
    .path("name")
    .validate(
        async (val) => (await GuideTeam.findOne({ name: val })) === null,
        "Guide-Team with this name already exists",
        "Guide-Team name not unique"
    );
