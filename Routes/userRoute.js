const express = require("express");
const {
  registerUser,
  loginUser,
  verifyEmail,
  refreshToken,
  logoutUser,
  getUser,
  getAllUsers
} = require("../Controllers/UserController");
const auth = require("../Middleware/authMiddleware");

const router = express.Router();

// Public
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify/:token", verifyEmail);


// Protected
router.get("/get-user", auth, getUser);
router.get("/get-all-users", auth, getAllUsers);
router.post("/refresh-token", refreshToken);
router.post("/logout", auth, logoutUser);

module.exports = router;
