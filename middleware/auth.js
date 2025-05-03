const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/keys");
const userModel = require("../models/users");

exports.loginCheck = (req, res, next) => {
  try {
    let token = req.headers.authorization || req.headers.token;
    console.log("Auth Middleware - token:", token);
    if (!token) {
      console.log("Auth Middleware - No token provided");
      return res.json({ error: "You must be logged in" });
    }
    token = token.replace("Bearer ", "");
    decode = jwt.verify(token, JWT_SECRET);
    console.log("Auth Middleware - decoded token:", decode);
    req.userDetails = decode;
    next();
  } catch (err) {
    console.log("Auth Middleware - error:", err);
    res.json({
      error: "You must be logged in",
    });
  }
};

exports.normalizeUserRole = (req, res, next) => {
  if (req.userDetails && req.userDetails.userRole && !req.userDetails.role) {
    req.userDetails.role = req.userDetails.userRole;
  }
  next();
};

exports.isAuth = (req, res, next) => {
  let { loggedInUserId } = req.body;
  if (
    !loggedInUserId ||
    !req.userDetails._id ||
    loggedInUserId != req.userDetails._id
  ) {
    res.status(403).json({ error: "You are not authenticate" });
  }
  next();
};

exports.isAdmin = async (req, res, next) => {
  try {
    let reqUser = await userModel.findById(req.body.loggedInUserId);
    // If user role 0 that's mean not admin it's customer
    if (reqUser.userRole === 0) {
      res.status(403).json({ error: "Access denied" });
    }
    next();
  } catch {
    res.status(404);
  }
};
