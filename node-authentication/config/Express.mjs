/**
 * Module dependencies.
 */
import express from "express";
import logger from "morgan";
import dotenv from "dotenv";

const setExpress = (app) => {
  // Config Environment
  const { NODE_ENV } = process.env;
  const env = `.env${process.env.NODE_ENV ? "." + process.env.NODE_ENV : ""}`;
  dotenv.config({
    path: env,
  });

  console.log(
    `>> Environment: ${process.env.NODE_ENV ? process.env.NODE_ENV : "default"}`
  );

  // logger
  app.use(logger("dev"));

  // parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
};

/**
 * Export
 */
export { setExpress };
