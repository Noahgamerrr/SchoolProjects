import mongoose from "mongoose";

export const auditLogSchema = new mongoose.Schema(
    {
        message: {
            type: String,
            required: true,
        },
        responsible: {
            type: String,
            required: true,
            default: "Anonymous"
        },
        changes: {
            before: {
                type: mongoose.Schema.Types.Mixed, default: {}
            },
            after: {type: mongoose.Schema.Types.Mixed, default: {}},
            faulty: {
                type: [mongoose.Schema.Types.Mixed],
                default: undefined
            },
            changeType: {
                type: String,
                required: false
            }
        }
    },
    { timestamps: true }
);

export const replaceModel = (model) => {
    AuditLog = model;
};

/**
 * @type {mongoose.Model}
 */

export let AuditLog = null;
