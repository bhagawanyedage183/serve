const express = require("express");
const router = express.Router();
const { loginCheck } = require("../middleware/auth");

router.get("/test-auth", loginCheck, (req, res) => {
  // Return decoded user details from token
  res.json({ userDetails: req.userDetails });
});

module.exports = router;
