const mongoose = require("mongoose");
const URL = process.env.MONGODBURL; 
mongoose
  .connect(URL)
  .then(() => {
    console.log("Connected to MongoDB Atlas successfully");
    const currentDatabase = mongoose.connection.db.databaseName;
    console.log("Currently connected to database:", currentDatabase); 
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB Atlas:", error.message);
  });
