
const { required } = require("joi");
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,

    },
    password: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: true,
        unique: true, 
    },

    phone: {
        type: String,
        required: false,
        default: null
    },

    googleId: {
        type: String,

    },

    image: {
        type: String,
        required : false,
    },

    isAdmin: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    }, 

    refferalCode: {
        type: String,
        required: false,
        default: null
    },
},


{timestamps: true}

);
const User = mongoose.model("User", userSchema);

module.exports = User;