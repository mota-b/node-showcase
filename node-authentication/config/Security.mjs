/**
 * Module dependencies.
 */
import cors from "cors";
import helmet from "helmet";
import csrf from "csurf";

const setSecurity = (app) => {
  // Base security
  app.use(helmet());
  // app.use(csrf({ cookie: true }));
  // app.use(function (req, res, next) {
  //     res.locals.csrftoken = req.csrfToken();
  //     next();
  // });

  // CORS
  app.use(cors());
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });
};

export { setSecurity };
