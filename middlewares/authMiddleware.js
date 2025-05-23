const { verifyToken } = require("../utils/jwtUtils");

const authMiddleware = (req, res, next) => {
  console.log("Auth middleware working");

  const tokenFromCookie = req.cookies?.token;

  const authHeader = req.headers.authorization;
  const tokenFromHeader =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  const token = tokenFromCookie || tokenFromHeader;

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = verifyToken(token);
    req.admin = decoded.id;
    console.log("Admin ID extracted from token: " + req.admin);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = authMiddleware;
