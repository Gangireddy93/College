const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "college_hall_ticket_jwt_secret_2026";

/**
 * Middleware to verify JWT token and ensure only authenticated Admin has access
 */
const verifyAdminToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Valid Admin JWT token is required.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing.",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (
      decoded.role !== "admin" &&
      decoded.role !== "college_admin" &&
      decoded.role !== "super_admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden. Admin privileges required.",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired JWT token. Please sign in again.",
    });
  }
};

module.exports = {
  verifyAdminToken,
  JWT_SECRET,
};
