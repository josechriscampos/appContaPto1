// backend/src/libs/jwt.js
import jwt from "jsonwebtoken";

export const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};