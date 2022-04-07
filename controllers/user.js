const User = require("../models/User");

exports.getUsers = async (req, res) => {
  await User.find({})
    .then((users) => {
      res.status(200).json({ users });
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    // Check user exists
    if (!user) {
      return res.status(404).json({ error: "User does not exist" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.addUser = async (req, res) => {
  try {
    // Destructure request body data
    let { firstname, lastname, email } = req.body;

    // Check if user exists
    email = email.toLowerCase();
    let user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Create new user
    user = new User({
      firstname,
      lastname,
      email,
    });

    // Add user to database
    user = await user.save();
    res.status(201).json({ user });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    let user;
    // Check the email does not conflict with an existing user
    if (req.body.email) {
      user = await User.find({ email: req.body.email });
      if (user) {
        return res.status(409).json({ error: "That email is already in use" });
      }
    }

    // Update the user
    const fields = req.body;
    user = await User.findOneAndUpdate(
      { _id: req.params.id },
      { ...fields },
      { runValidators: true, new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User does not exist" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    // Check user existed
    if (!user) {
      return res.status(404).json({ error: "User doesn't exist" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
