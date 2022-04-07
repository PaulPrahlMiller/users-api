const router = require("express").Router();
const userController = require("../controllers/user");
const { check, body } = require("express-validator");
const validation = require("../middleware/validator");

router.get("/", userController.getUsers);

router.post(
  "/",
  body("firstname", "First name is required").not().isEmpty(),
  body("lastname", "Last name is required").not().isEmpty(),
  body("email", "Email not valid").isEmail(),
  validation.request,
  userController.addUser
);

router.get(
  "/:id",
  check("id", "Not a valid MongoDB ID").isMongoId(),
  validation.request,
  userController.getUserById
);

router.put(
  "/:id",
  check("id", "Not a valid MongoDB id").isMongoId(),
  validation.request,
  userController.updateUser
);

router.delete(
  "/:id",
  check("id", "Not a valid MongoDB id").isMongoId(),
  validation.request,
  userController.deleteUser
);

module.exports = router;
