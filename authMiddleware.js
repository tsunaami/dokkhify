import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;


    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: token missing" });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "dev_secret_key"
      );
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized: invalid token" });
    }


    if (!decoded?.id) {
      return res.status(401).json({ message: "Unauthorized: invalid payload" });
    }


    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }


    req.user = user;

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({ message: "Server error in auth middleware" });
  }
};

export default authMiddleware;