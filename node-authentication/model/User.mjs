/**
 * Module dependencies
 */
import mongoose from "mongoose"; // mongodb ORM
import jwt from "jsonwebtoken"; // token based authentication
import bcrypt from "bcrypt"; // encription

const model_designation = "user";
const { ADMIN_SECRET_TOKEN: secret } = process.env;

/**
 * Collection config
 */
const { Schema } = mongoose;
const ModelSchema = new Schema({
  // identifier
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },

  // db-optional
  creation_date: { type: Date, optional: true, default: new Date() },
  modification_date: { type: Date, optional: true },
  // test1: { type: Schema.Types.ObjectId, required: true },
  // test2: { type: Date, required: true },
  // test3: { type: String },
  // test4: { type: Number, required: true },
  // test5: { type: [String], required: true },
});

/**
 * Collection methodes
 */
// passport local authentication strategy
function LocalAuthenticationStrategy(email, password, done) {
  Model.findOne({ email: email }, (err, model_instance) => {
    // user not found , non matching password ...
    if (err) {
      // handle error
      // const { AUTHENTICATE } = require("../errorHandler");
      // AUTHENTICATE(err);

      // return
      done(err, null, {
        message: "mongo error ?",
      });
    } else {
      // exist && password match ?
      if (
        model_instance &&
        model_instance.verifyPassword(password, model_instance.password)
      ) {
        // Authentification result
        const result = {
          identification: {
            email: model_instance.email,
            username: model_instance.username,
            token: Model.generateJWT(model_instance._id),
            role: "admin",
          },
          state: {
            isRemember: false,
          },
        };

        done(null, result, {
          message: "Authentication successful !",
        });
      } else {
        //   !exist || !password_match
        done(null, result, {
          message: "Wrong email or password !",
        });
      }
    }
  });
}
// Cipher a password
function CypherPassword(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}
// Generate a JSON web token
function GenerateJWT({ _id }, options = { expiresIn: "1d" }) {
  return jwt.sign(
    {
      _id,
    },
    secret,
    options
  );
}
// Verify the JSON web token
function VerifyJWT(token) {
  let decode = null;
  try {
    decode = jwt.verify(token, secret, {});
    // TODO verify if the callback is usefull
    // decode = jwt.verify(token, secret, {}, callback);
  } catch (err) {
    // const { JWT } = require("../errorHandler");
    // JWT(err);
    return false;
  }

  return decode;
}

// Get Schema prototype
function GetPrototype() {
  const object_prototype = ModelSchema.paths;
  return object_prototype;
}
// Get Schema Required prototype
function GetRequiredPrototype() {
  const object_prototype = ModelSchema.paths;
  const object_required_fields = ModelSchema.requiredPaths();
  let required_prototype = {};

  object_required_fields.forEach((key) => {
    const value = object_prototype[key];

    required_prototype = { ...required_prototype, [key]: value };
  });
  return required_prototype;
}
// Get Schema UnRequired prototype
function GetUnRequiredPrototype() {
  const object_prototype = ModelSchema.paths;
  const exception_fields = ["_id", "__v"];
  let unrequired_prototype = {};

  for (const key in object_prototype) {
    const is_exeption_field = exception_fields.indexOf(key) != -1;

    // not-exeption_field && not-required && not-optional
    if (
      !is_exeption_field &&
      !object_prototype[key].options.required &&
      !object_prototype[key].options.optional
    )
      unrequired_prototype = {
        ...unrequired_prototype,
        [key]: object_prototype[key],
      };
  }
  return unrequired_prototype;
}
// Get Schema Unic prototype
function GetUnicPrototype() {
  const object_prototype = ModelSchema.paths;
  let unics_prototype = {};

  for (const key in object_prototype) {
    if (object_prototype[key].options.unique)
      unics_prototype = {
        ...unics_prototype,
        [key]: object_prototype[key],
      };
  }
  return unics_prototype;
}
// Get hint to fix the error
function GetFieldErrorHint(key = null, key_type = null, value = null) {
  switch (key_type) {
    case "String":
      // not-found || not-a-string
      if (!value || (typeof value).toLowerCase() !== "string")
        return {
          name: key,
          type: key_type,
          received: {
            type: typeof value,
            value: value,
          },
        };
      break;

    case "Number":
      // not-found  || not-a-number
      if (!value || (typeof value).toLowerCase() !== "number")
        return {
          name: key,
          type: key_type,
          received: {
            type: typeof value,
            value: value,
          },
        };
      break;

    case "Date":
      // not-found  || Invalid-date
      if (!value || new Date(value).toString() === "Invalid Date")
        return {
          name: key,
          type: key_type,
          received: {
            type: "Invalid Date",
            value: value,
          },
        };
      break;

    case "Array":
    case "Mixed":
      // not-found ||  not-array || empty
      if (!value || !Array.isArray(value) || value.length <= 0)
        return {
          name: key,
          type: key_type,
          received: {
            type: Array.isArray(value) ? "Array" : typeof value,
            value: value,
          },
        };
      break;

    case "ObjectID":
      // not-found
      if (!value)
        return {
          name: key,
          type: key_type,
          received: {
            type: typeof value,
            value: value,
          },
        };
      break;
    default:
      return null;
      break;
  }
}
// Create
async function Create(body = {}) {
  // gather MUST be "unic" fields from the body
  const unics_prototype = Object.keys(GetUnicPrototype());
  let unic_fields = {};
  unics_prototype.forEach((field) => {
    const value = body[field];
    if (value) unic_fields = { ...unic_fields, [field]: value };
  });

  // search for existing instance with any of the "unic" fields
  const existing_instance = await ReadOne(
    { ...unic_fields },
    { matchAll: false, isInternal: true }
  );

  // return a promise
  return new Promise(function (resolve, reject) {
    // handle already exist or unic credentials already used
    if (existing_instance) {
      let hints = [];
      for (const field in unic_fields) {
        if (body[field] == existing_instance[field]) {
          hints.push({
            name: field,
            value: body[field],
          });
        }
      }

      const error = new Error("Unable to create");
      error.message = "already exist or unic credentials already used";
      error.status = 400;
      error.hints = hints;

      reject(error);
    } else {
      // test all attributes according to their instance type
      const required_prototype = GetRequiredPrototype();
      const unrequired_prototype = GetUnRequiredPrototype();

      const hints = [];
      let new_enty = {};

      // validate && check missing required fields ==> if valid add the fields to new_entry
      for (const key in required_prototype) {
        const key_type = required_prototype[key].instance;
        const value = body[key];

        const hint = GetFieldErrorHint(key, key_type, value);
        if (hint) {
          hint.required = true;
          hints.push(hint);
        } else {
          new_enty = { ...new_enty, [key]: value };
        }
      }
      // validate unrequired fields ==> if valid add the fields to new_entry
      for (const key in unrequired_prototype) {
        const key_type = unrequired_prototype[key].instance;
        const value = body[key];

        const hint = GetFieldErrorHint(key, key_type, value);
        if (hint) {
          hints.push(hint);
        } else {
          new_enty = { ...new_enty, [key]: value };
        }
      }

      // handle missing or incorrect credentials
      if (hints.length > 0) {
        const error = new Error("Unable to create");
        error.message = "missing or incorrect credentials";
        error.hints = hints;
        error.status = 400;
        reject(error);
      } else {
        // create new instance from the 'new_entry'
        new Model({
          ...new_enty,
          password: Model.CypherPassword(new_enty.password),
        }).save((create_error, instance) => {
          if (create_error) {
            // instance creation error
            console.log(create_error);
            create_error.status = 400;
            create_error.hints = [];
            reject(create_error);
          } else {
            // instance creation success
            resolve(instance);
          }
        });
      }
    }
  });
}
// ReadAll
function ReadAll(filter = {}, options = { paginate: false }) {
  // get filters
  let query = {};

  // return a promise
  return new Promise(function (resolve, reject) {
    Model.find(query, (err, instances) => {
      if (err) {
        err.status = 400;
        err.hints = [];
        reject(err);
      } else {
        resolve({ resources: instances });
      }
    });
  });
}
// ReadOne
function ReadOne(filter = {}, options = { matchAll: true }) {
  // get filters
  let query = {};

  // match all the fields
  if (options.matchAll) {
    query = { ...filter };
  } else {
    // match any field
    let filter_list = [];
    for (const field in filter) {
      filter_list.push({ [field]: filter[field] });
    }

    query = { $or: filter_list };
  }

  // return a promise
  return new Promise(function (resolve, reject) {
    Model.findOne(query, (err, instance) => {
      if (err) {
        err.status = 400;
        err.hints = [];
        reject(err);
      } else {
        // not-found
        if (!instance) {
          // is_create api
          if (options.isInternal) {
            resolve(null);
          } else {
            const error = new Error("Unable to create");
            error.message = "not found";
            error.status = 404;
            error.hints = [];
            reject(error);
          }
        } else {
          resolve(instance);
        }
      }
    });
  });
}
// UpdateOne
function UpdateOne(filter = {}, options = {}) {
  // get filters
  const { _id } = filter;
  let query = { _id };

  // get updatable fields
  const updatable_fields = Object.keys(GetRequiredPrototype()).concat(
    Object.keys(GetUnRequiredPrototype())
  );

  // get the update
  let update = {};
  updatable_fields.forEach((key) => {
    const value = filter[key];
    if (value) {
      update = { ...update, [key]: value };
    }
  });

  // cypher if new password
  if (update.password) {
    update.password = Model.CypherPassword(update.password);
  }

  // return a promise
  return new Promise(function (resolve, reject) {
    Model.findOneAndUpdate(
      query,
      { ...update },
      { new: true }, // return updated instance
      (err, instance) => {
        if (err) {
          err.status = 400;
          err.hints = [];
          reject(err);
        } else {
          // not-found
          if (!instance) {
            // is_create api
            if (options.isInternal) {
              resolve(null);
            } else {
              const error = new Error("Unable to update");
              error.message = "not found";
              error.status = 404;
              error.hints = [];
              reject(error);
            }
          } else {
            resolve(instance);
          }
        }
      }
    );
  });
}
// DeleteOne
function DeleteOne(filter = {}, options = {}) {
  // get filters
  const { _id } = filter;
  let query = { _id };

  // return a promise
  return new Promise(function (resolve, reject) {
    Model.findOneAndDelete(query, {}, (err, instance) => {
      if (err) {
        err.status = 400;
        err.hints = [];
        reject(err);
      } else {
        // not-found
        if (!instance) {
          // is_create api
          if (options.isInternal) {
            resolve(null);
          } else {
            const error = new Error("Unable to remove");
            error.message = "not found";
            error.status = 404;
            error.hints = [];
            reject(error);
          }
        } else {
          resolve(instance);
        }
      }
    });
  });
}

// set static methodes for the collection
const statics = [
  // Authentication
  {
    designation_call: "LocalAuthenticationStrategy",
    method: LocalAuthenticationStrategy,
  },
  {
    designation_call: "CypherPassword",
    method: CypherPassword,
  },
  {
    designation_call: "GenerateJWT",
    method: GenerateJWT,
  },
  {
    designation_call: "VerifyJWT",
    method: VerifyJWT,
  },

  // Prototypes
  {
    designation_call: "GetPrototype",
    method: GetPrototype,
  },
  {
    designation_call: "GetRequiredPrototype",
    method: GetRequiredPrototype,
  },
  {
    designation_call: "GetUnRequiredPrototype",
    method: GetUnRequiredPrototype,
  },
  {
    designation_call: "GetUnicPrototype",
    method: GetUnicPrototype,
  },
  {
    designation_call: "GetFieldErrorHint",
    method: GetFieldErrorHint,
  },

  // CRUD
  {
    designation_call: "Create",
    method: Create,
  },
  {
    designation_call: "ReadAll",
    method: ReadAll,
  },
  {
    designation_call: "ReadOne",
    method: ReadOne,
  },
  {
    designation_call: "UpdateOne",
    method: UpdateOne,
  },
  {
    designation_call: "DeleteOne",
    method: DeleteOne,
  },
];
statics.forEach(
  ({ designation_call, method }) =>
    (ModelSchema.statics[designation_call] = method)
);

/**
 * Instance methodes
 */
// Verify a password
function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

// set instance methodes for the collection
const methods = [
  // Authentication
  {
    designation_call: "verifyPassword",
    method: verifyPassword,
  },
];
methods.forEach(
  ({ designation_call, method }) =>
    (ModelSchema.methods[designation_call] = method)
);

/**
 * Collection Hooks
 */
// Pre Create
function PreCreate(next) {
  console.log(`> before save on ${Model.collection.name}`);
  if (this.isNew) {
    console.log(`> before create on ${Model.collection.name}`);

    // do some processing (this : the new instance)

    // TODO remove the document within timeout (ex: for email confirmation)
  }
  next();
}
// Pre Update
function PreUpdate(next) {
  console.log(`> before ${this.op} on ${Model.collection.name}`);

  // do some processing
  this._update = { ...this._update, modificationDate: new Date() };

  next();
}
// Post Update
function PostUpdate(instance) {
  console.log(`> after ${this.op} on ${Model.collection.name}`);

  // TODO update linked documents (parents, referencing-documents...)
}
// Pre Delete
function PreDelete(next) {
  console.log(`> before ${this.op} on ${Model.collection.name}`);

  // TODO delete linked documents (childs, ...)
  // TODO save on a BackUp collection (with existing media)

  next();
}
// Post Delete
function PostDelete(instance) {
  console.log(`> after ${this.op} on ${Model.collection.name}`);

  // TODO update linked documents (parents, referencing-documents...)
}

// set pre hooks for the collection
const pres = [
  {
    targetedMethods: ["save"],
    method: PreCreate,
  },
  {
    targetedMethods: ["findOneAndUpdate"],
    method: PreUpdate,
  },
  {
    targetedMethods: ["findOneAndDelete"],
    method: PreDelete,
  },
];
pres.forEach(({ targetedMethods, method }) =>
  ModelSchema.pre(targetedMethods, method)
);

// set post hooks for the collection
const posts = [
  {
    targetedMethod: "findOneAndUpdate",
    method: PostUpdate,
  },
  {
    targetedMethod: "findOneAndDelete",
    method: PostDelete,
  },
];
posts.forEach(({ targetedMethod, method }) =>
  ModelSchema.post(targetedMethod, {}, method)
);

/**
 * Export Model
 */
const Model = mongoose.model(model_designation, ModelSchema);
export { Model };
