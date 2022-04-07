const { validationResult } = require("express-validator");

exports.request = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array()[0].msg });
  } else {
    next();
  }
};
