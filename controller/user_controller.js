const userSchema = require("../model/user_model");
const bcrypt = require("bcrypt");
const saltRounds = 10;

exports.login =  (req, res) => {
    res.render("user/login");
}