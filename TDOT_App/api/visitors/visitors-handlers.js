import { Visitor } from "./visitors-model.js";
import auditLogHandlers from "../audit-log/audit-log-handlers.js";

// GET /api/visitors
export const getAll = async (req, res, next) => {
    const visitors = await Visitor.find();
    res.json(visitors);
};

// GET /api/visitors/:id
export const getOne = async (req, res, next) => {
    try {
        const visitor = await Visitor.findById(req.params.id);
        if (!visitor) {
            res.status(404).send();
            return;
        }
        res.json(visitor);
    } catch (err) {
        return res.status(400).send();
    }
};

// POST /api/visitors
export const create = async (req, res, next) => {
    try {
        const visitor = await Visitor.create(req.body);
        await auditLogHandlers.addLog(
            `Visitor ${visitor.name} has been added`, 
            req.authenticatedUser,
            {
                after: visitor,
                changeType: "add"
            }
        );
        res.status(201).json(visitor);
    } catch (err) {
        return res.status(400).send();
    }
};

// PUT /api/visitors/:id
export const update = async (req, res, next) => {
    try {
        // Correctly sanitize the input
        const old = await Visitor.findById(req.params.id);
        const visitor = await Visitor.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!visitor) {
            res.status(404).send();
            return;
        }

        await auditLogHandlers.addLog(
            `Visitor ${visitor.name} has been updated`,
            req.authenticatedUser,
            {
                before: old,
                after: visitor
            }
        );
        res.status(204).send();
    } catch (err) {
        res.sendStatus(400);
    }
};

// DELETE /api/visitors/:id
export const remove = async (req, res, next) => {
    try {
        const visitor = await Visitor.findByIdAndDelete(req.params.id);
        if (!visitor) {
            res.status(404).send();
            return;
        }
        await auditLogHandlers.addLog(
            `Visitor ${visitor.name} has been removed`,
            req.authenticatedUser,
            {
                before: visitor,
                changeType: "delete"
            }
        );
        res.status(204).send();
    } catch (err) {
        res.status(400).send();
    }
};

export default {
    getAll,
    getOne,
    create,
    update,
    remove,
};
