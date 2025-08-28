const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
 
// DB Connection
require("./DB/Connection");

// Routes
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const userRoutes = require("./Routes/userRoute");
const { default: seedAdmin } = require("./DB/SuperUser");
app.use("/api/users", userRoutes); 

// Root
app.get("/", (req, res) => {
  res.send("Welcome to the WeddingBiz API 🚀");
});

// Start Server
app.listen(PORT, () => {
  seedAdmin()
  console.log(`Server running on port ${PORT}`);
});
