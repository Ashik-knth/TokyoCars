const mongoose = require("mongoose");

const User = require("../model/usermodel");


exports.user_auth = async (req, res, next) => {
    if(req.session.Userdata){
        next();
    }else{
        res.redirect('/login');
    }
}

exports.login_auth = async (req, res, next) => {
    if(!req.session.Userdata){
     next();
    }else{
        res.redirect('/');

    }
}

exports.admin_auth = async (req, res, next) => {
    if(req.session.admin){
        next();
    }else{
        res.redirect('/admin/login');
    }
}




