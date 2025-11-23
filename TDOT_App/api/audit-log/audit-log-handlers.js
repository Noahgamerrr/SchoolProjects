import { AuditLog } from "./audit-log-model.js";
import { logger } from "../../logging/log.js";

export const getAll = async (_req, res) => {
    // logger.debug(`Audit log - Fetching Audit-logs`);
    let resultSet = (await AuditLog.find().lean()).reverse();
    res.status(200).json(resultSet);
};

export const addLog = async (message, responsible, changes) => {
    await AuditLog.create({ message, responsible, changes });
};

export default {
    getAll,
    addLog,
};
