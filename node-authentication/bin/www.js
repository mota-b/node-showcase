#!/usr/bin/env node

/**
 * Module dependencies.
 */
import debug from "debug";
import http from "http";

import app from "../app.mjs";
import { onError, onListening } from "./server-events.mjs";
import { normalizePort } from "./server-helpers.mjs";

/**
 * Express App.
 */
debug("authentication-node:server");
const port = normalizePort(process.env.PORT || "3001");
app.set("port", port);

/**
 * HTTP server.
 */
const server = http.createServer(app);

server.listen(port);
server.on("error", (err) => onError(err, port));
server.on("listening", () => onListening(server, port));
