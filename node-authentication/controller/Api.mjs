/**
 * Module dependencies.
 */
import sign from "../apis/sign-api.mjs";

const base_url = "/api/v1";
const apis = [{ path: "/sign", router: sign }];

const setApis = (app) => {
  apis.map(({ path, router }) => {
    const api_url = `${base_url}${path}`;
    app.use(api_url, router);
  });
};

/**
 * Export
 */
export { setApis };
