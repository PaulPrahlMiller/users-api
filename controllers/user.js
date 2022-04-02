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
  await User.findById(req.params.id)
    .then((user) => {
      if (!user) {
        res.status(404).json({ error: "User does not exist" });
      }
      res.status(200).json({ user });
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
};

exports.addUser = async (req, res) => {
  // Destructure request body data
  const { firstname, lastname, email } = req.body;

  // Check if user exists
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
  await user
    .save()
    .then((user) => {
      res.status(201).json({ user });
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
};

exports.updateUser = async (req, res) => {
  const fields = req.body;

  await User.findOneAndUpdate(
    { _id: req.params.id },
    { ...fields },
    { runValidators: true, new: true }
  )
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User does not exist" });
      }
      res.status(200).json({ user });
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
};

exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User doesn't exist" });
      }
      res.status(200).json({ user });
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
};
