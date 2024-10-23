const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const UserIP = require("../models/userIpModel");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization
  // console.log('auth heaeder', authHeader)
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      req.user = user;
      req.body.userId = decoded.id;
      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ error: "Invalid token" });
      }
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ error: "Token expired. Please login again." });
      }
      res.status(500).json({ error: "Server error" });
    }
  } else {
    // console.log("No token found in headers");
    res.status(401).json({ error: "No token provided" });
  }
};

const publicApiAccess = (req, res, next) => {
  if (req.path.startsWith("/api/user")) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(403).json({ message: "Access Denied" });
    }
    const token = authHeader.split(" ")[1];
    if (token !== process.env.AUTH_TOKEN) {
      return res.status(403).json({ message: "Access Denied" });
    }
    next();
  } else {
    next();
  }
};

const getIpAddress = async (req, res, next) => {
  const userIpAddress =
    req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"];
  const userId = req.userId;

  try {
    let user = null;
    if (userId) {
      user = await User.findById(userId);
    }
    let existingIP = await UserIP.findOne({
      ipAddress: userIpAddress,
      userAgent,
    });

    if (!existingIP) {
      const newUserIP = new UserIP({
        ipAddress: userIpAddress,
        userAgent,
      });
      await newUserIP.save();
      if (user) {
        user.ipAddresses.push(newUserIP._id);
        await user.save();
      }
    } else {
      existingIP.lastVisited = Date.now();
      existingIP.visitCount += 1;
      await existingIP.save();
    }
  } catch (error) {
    console.error("Error saving user IP address:", error);
    res.status(500).json({ message: "Server Error" });
    return;
  }
  next();
};

const isAdmin = async (req, res, next) => {
  const userId = req.user._id;
  const adminUser = await User.findOne(userId);
  // console.log("Admin Details:", adminUser);
  
  if (!adminUser) {
    return res.status(404).json({ message: "User not found." });
  }
  if (adminUser.role !== "admin") {
    return res.status(403).json({ message: "You are not an admin." });
  }
  next();
};
module.exports = { protect, isAdmin, getIpAddress, publicApiAccess };