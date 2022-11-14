/**
 * Module dependencies.
 */
import mongoose from "mongoose";
mongoose.Promise = global.Promise;

const setMongo = () => {
  const { DB_URL, MONGODB_USER, MONGODB_PASSWORD } = process.env;
  const db_url = MONGODB_USER
    ? DB_URL.replace("<user>", MONGODB_USER).replace(
        "<password>",
        MONGODB_PASSWORD
      )
    : DB_URL;
  const db_name = db_url.split("/")[3].split("?")[0];

  // connect to mongodb
  mongoose
    .connect(db_url, {
      useUnifiedTopology: true,
      // useCreateIndex: true,
      useNewUrlParser: true,
      // useFindAndModify: false,
    })
    .then(() => {
      console.log(`>> Connection successful to db: (${db_name})`);
    })
    .catch((err) => {
      console.error(err);
    });
};

/**
 * Export
 */
export { setMongo };
