const User = require("../Models/UserCredential");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const EMAIL_SECRET = process.env.EMAIL_SECRET;
const createTokens = (userId, role) => {
  const accessToken = jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};

// ✅ Register
exports.registerUser = async (req, res) => {
  try {
    const { partner_1, partner_2, email, password } = req.body;
    console.log("Registering user:", email, partner_1, partner_2, password);
    let user = await User.findOne({ email });
    if (user) {
      console.log("Registration failed: Email already exists:", email);
      return res.status(400).json({ msg: "Email already exists" });
    }

    user = new User({ partner_1, partner_2, email, password });
    await user.save();
    console.log("User saved to database:", user._id);

    // Email verification link
    const emailToken = jwt.sign({ id: user._id }, EMAIL_SECRET, {
      expiresIn: "1d",
    });
    const url = `http://localhost:5000/api/users/verify/${emailToken}`;

    // Send mail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: email,
      subject: "Verify your email",
      html: `Click <a href="${url}">here</a> to verify your account.`,
    });
    console.log("Verification email sent to:", email);

    res.json({
      msg: "Registration successful! Please check your email to verify.",
    });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ error: err.message });
  }
};

// Social Login (Google, Facebook) 

exports.socialLogin = async (req, res) => {
}


// ✅ Verify Email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, EMAIL_SECRET);
    await User.findByIdAndUpdate(decoded.id, { isVerified: true });
    res.send("Email verified successfully!");
  } catch (err) {
    res.status(400).send("Invalid or expired token");
  }
};

// ✅ Login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: "User not found" });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

  if (!user.isVerified)
    return res.status(400).json({ msg: "Verify your email first" });

  const { accessToken, refreshToken } = createTokens(user._id, user.role);

  // Save refreshToken in DB
  user.refreshToken = refreshToken;
  await user.save();

  res.json({ accessToken, refreshToken, user });
};

exports.refreshToken = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ msg: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token)
      return res.status(403).json({ msg: "Invalid refresh token" });

    // Generate new tokens
    const { accessToken, refreshToken } = createTokens(user._id, user.role);

    user.refreshToken = refreshToken; // update refresh token
    await user.save();

    res.json({ accessToken, refreshToken });
  } catch (err) {
    res.status(403).json({ msg: "Invalid or expired token" });
  }
};

// logout function
exports.logoutUser = async (req, res) => {
  console.log("Logging out user:", req.body);
  const { token } = req.body;
  if (!token) return res.sendStatus(204);
  const user = await User.findOne({ refreshToken: token });
  if (user) {
    user.refreshToken = null;
    await user.save();
  }
  res.sendStatus(204);
};

// Get user
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -refreshToken");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Users (Admin only)
exports.getAllUsers = async (req, res) => {
  // if (req.user.role !== "admin") {
  //   return res.status(403).json({ msg: "Access denied" });
  // }
  try {
    const users = await User.find().select("-password -refreshToken");
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ Protected Example
exports.getDashboard = async (req, res) => {
  res.json({ msg: "Welcome to dashboard", user: req.user });
};
