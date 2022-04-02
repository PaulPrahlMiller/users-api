const mongoose = require("mongoose");

const connectDatabase = () => {
  try {
    mongoose.connect("mongodb://localhost:27017/lab1");
    const mongo = mongoose.connection;

    mongo.on("connected", () => console.log("MongoDB connected"));
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDatabase;
