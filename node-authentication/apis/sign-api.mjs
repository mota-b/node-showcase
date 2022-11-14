/**
 * Module dependencies
 */
import express from "express";

const router = express.Router();
router.post("/up", (req, res, next) => {
  const { body, query } = req;
  res.status(200).json({ message: "signed up" });
});

/**
 * Export
 */
export default router;
