/**
 * Dependencies
 */
import express from "express";

import { setExpress, setSecurity, setMongo } from "./config/index.mjs";
import { setApis } from "./controller/index.mjs";

/**
 * Express config
 */
const app = express();
setExpress(app);

/**
 * Security Config
 */
setSecurity(app);

/**
 * MongoDB Config
 */
setMongo();

/**
 * APIs config
 */
setApis(app);

/**
 * Export
 */
export default app;
