const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "construction_crm_fallback_jwt_key_2026";

/**
 * Verify JWT token in incoming requests
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];

  if (!authHeader) {
    return res.status(401).json({
      message: "Access denied. Authentication token required.",
    });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  if (!token) {
    return res.status(401).json({
      message: "Access denied. Token missing.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired session. Please login again.",
    });
  }
};

module.exports = { verifyToken, JWT_SECRET };
