/**
 * Module dependencies.
 */
import debug from "debug";

/**
 * Events
 */

// Event listener for HTTP server "error" event.
function onError(error, port) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}
// Event listener for HTTP server "listening" event.
function onListening(server, port) {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  const { APP_NAME } = process.env;

  debug("Listening on " + bind);
  console.log(`>> ${APP_NAME}: listening on port ${port} ...`);
}

export { onListening, onError };
