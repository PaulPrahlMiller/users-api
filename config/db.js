const mongoose = require("mongoose");
require("dotenv").config();

const connectDatabase = () => {
  try {
    mongoose.connect(process.env.DATABASE_URL);
    const mongo = mongoose.connection;

    mongo.on("connected", () => console.log("MongoDB connected"));
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDatabase;
