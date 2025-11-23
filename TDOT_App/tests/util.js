import { dropCurrentDB } from "../db/database.js";

import DEFAULTS from "../config/defaults.json" with { type: "json" };

const MONGODB_CONNECTION_STRING =
    process.env.MONGODB_CONNECTION_STRING || DEFAULTS.MONGODB_CONNECTION_STRING;

export const dropDatabase = () => dropCurrentDB(MONGODB_CONNECTION_STRING);
