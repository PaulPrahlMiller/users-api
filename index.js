const express = require("express");
const userRoutes = require("./routes/user");
const connectDatabase = require("./config/db");

const app = express();

connectDatabase();

app.use(express.static("public"));

app.use(express.json());

app.use("/api/users", userRoutes);

app.all("*", (error, req, res, next) => {
  console.log("the error");
  res.status(500).json({ error: "Server error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
