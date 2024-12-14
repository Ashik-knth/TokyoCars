const express = require("express");
const user_router = express.Router();
const user_controller = require("../controller/user_controller");
const auth = require("../middleware/auth");


user_router.get('/', user_controller.login);

module.exports = user_router;