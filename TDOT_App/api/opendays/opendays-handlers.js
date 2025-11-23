import { Openday } from "./opendays-model.js";
import {
    InternalServerError,
    BadRequest,
    NotFound,
} from "../../middlewares/error-handling.js";
import auditLogHandlers from "../audit-log/audit-log-handlers.js";
import { setActiveOpenday } from "./opendays-switcher.js";
import { Station } from "../stations/stations-model.js";

export const getAll = async (req, res, next) => {
    let resultSet = await Openday.find();
    res.status(200).json(resultSet);
};

export const getOne = async (req, res, next) => {
    const id = req.params.id;
    // Check if id is valid
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).send();
        return;
    }
    const od = await Openday.findById(id);
    if (!od) {
        res.status(404).send();
        return;
    }
    res.status(200).json(od);
};

export const update = async (req, res, next) => {
    const id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).send();
    const od = await Openday.findByIdAndUpdate(id, {
        date: req.body.date,
    });
    if (!od) return res.status(404).send();

    await auditLogHandlers.addLog(
        `Openday ${od.date} has been updated to ${req.body.date}`,
        req.authenticatedUser
    );
    res.status(204).send();
};

export const create = async (req, res, next) => {
    const active = await Openday.findOne({ active: true });
    const od = await Openday.create({
        date: req.body.date,
        active: false,
    });
    if (!od) {
        res.sendStatus(500);
    }
    if (!active) {
        await setActiveOpenday(od);
    }
    await auditLogHandlers.addLog(
        `Openday ${od.date} has been created`,
        req.authenticatedUser
    );
    res.status(201).json(od);
};

export const remove = async (req, res, next) => {
    const id = req.params.id;
    const od = await Openday.findById(id);

    if (od.active)
        return next(new BadRequest(new Error("Cannot delete active openday")));

    await Openday.findByIdAndDelete(id);
    await auditLogHandlers.addLog(
        `Openday ${od.date} has been deleted`,
        req.authenticatedUser
    );
    res.status(204).send();
};

export const lock = async (req, res, next) => {
    const id = req.params.id;
    let od = await Openday.findById(id);

    if (!id.match(/^[0-9a-fA-F]{24}$/))
        return next(new BadRequest(new Error("Must use object ID")));

    if (!od) {
        return next(
            new NotFound(new Error("Cannot lock non-existing openday"))
        );
    }

    if (od.locked)
        return next(new BadRequest(new Error("Cannot lock locked openday")));

    od = await Openday.findByIdAndUpdate(id, {
        locked: true,
    });
    await auditLogHandlers.addLog(
        `Openday ${od.date} has been locked`,
        req.authenticatedUser
    );
    res.status(200).json(od);
};

export const setActive = async (req, res, next) => {
    const id = req.params.id;
    const od = await Openday.findById(id);
    if (!od) {
        res.status(404).send();
        return;
    }
    await setActiveOpenday(od);
    await auditLogHandlers.addLog(
        `Openday ${od.date} has been set to active`,
        req.authenticatedUser
    );
    res.status(200).json(od);
};

export const getActive = async (req, res, next) => {
    const od = await Openday.findOne({ active: true });
    if (!od) {
        res.status(404).send();
        return;
    }
    res.status(200).json(od);
};

export const reorderStations = async (req, res, next) => {
    const body = req.body;

    const oldOd = await Openday.findOne({active: true});

    if (!oldOd) return res.status(404).send();

    try {
        // Check if the stations do actually exist
        let stations = await Promise.all(body.map(i => Station.findById(i.id)));
        if (stations.filter(e => !e).length) return res.status(400).send();
    } catch(_) {
        return res.status(400).send();
    }

    await Openday.updateOne({ active: true }, {
        stationOrdering: body
    });

    // Somehow, this is the way station ordering is accepted...
    const od = await Openday.findOne({active: true});


    await auditLogHandlers.addLog(
        "Station ordering has been edited",
        req.authenticatedUser,
        {
            before: oldOd.stationOrdering, 
            after: body,
            changeType: "reorderStations"
        }
    );
    return res.status(200).send(od);

}

export default {
    getAll,
    getOne,
    update,
    create,
    remove,
    lock,
    setActive,
    getActive,
    reorderStations,
};
