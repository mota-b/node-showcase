/**
 * Module dependencies.
 */
import passport from "passport";
import LocalStrategy from "passport-local";

import { User } from "../model/index.mjs";

passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    (username, password, done) => {
      User.findOne({ username })
        .then((user) => {
          if (!user || !user.validatePassword(password)) {
            return done(null, false, {
              error: "username or password is invalid",
              success: 3,
            });
          }
          //console.log(user)
          return done(null, user);
        })
        .catch(done);
    }
  )
);

/**
 * Export
 */
export { passport };
