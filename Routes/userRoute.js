const express = require("express");
const {
  registerUser,
  loginUser,
  verifyEmail,
  getDashboard,
  refreshToken,
  logoutUser
} = require("../Controllers/UserController");
const auth = require("../Middleware/authMiddleware");

const router = express.Router();

// Public
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify/:token", verifyEmail);


// Protected
router.get("/dashboard", auth, getDashboard);
router.post("/refresh-token", refreshToken);
router.post("/logout", auth, logoutUser);

module.exports = router;
