const express = require("express");
const {
  registerUser,
  loginUser,
  verifyEmail,
  refreshToken,
  logoutUser,
  getUser,
  getAllUsers,
  forgetPassword,
  resetPassword,
  updateUser, 
} = require("../Controllers/UserController");
const auth = require("../Middleware/authMiddleware");
const upload = require("../Middleware/upload"); 

const router = express.Router();

// Public
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forget", forgetPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/verify/:token", verifyEmail);

// Protected
router.get("/get-user", auth, getUser);
router.get("/get-all-users", auth, getAllUsers);
router.post("/refresh-token", auth, refreshToken);
router.post("/logout", auth, logoutUser);
router.patch("/update", auth, upload.single("profilePicture"), updateUser);

module.exports = router;
