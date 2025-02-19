const mongoose = require("mongoose");

const UserSchema = require("../model/usermodel");


// exports.user_auth = async (req, res, next) => {

//     const user = req.session.Userdata;

//     const User = await UserSchema.findById(user._id);

//     if (user) {
//          return next();
//     } else {
//         res.redirect('/login');
//     }
// }



exports.login_auth = async (req, res, next) => {
    const user = req.session.Userdata;   
    
     if(user){
        res.redirect('/');
     }else{
       return next();
     }
    
};

exports.signup_auth = async (req, res, next) => {
    const user = req.session.Userdata;

    if (!user) {
        if (req.path === '/signup') {
            return next();
        }
    }
    next();
}


exports.admin_auth = async (req, res, next) => {
    if (req.session.admin) {
        next();
    } else {
        res.redirect('/admin/login');
    }
}


exports.user_block = async (req, res, next) => {
    try {
        console.log("Middleware triggered!");

        const user = req.session.Userdata;
        if (!user) {
            return res.redirect('/login');
        }

        let User = await UserSchema.findById(user._id);
        if (!User) {
            req.session.destroy(); 
            return res.redirect('/login');
        }

        if (User.isBlocked) {
            req.session.destroy(); 
            return res.redirect('/login');
        }

        next();
    } catch (err) {
        console.error("Error in user_block middleware: ", err);
        res.status(500).send("Internal Server Error");
    }
};



