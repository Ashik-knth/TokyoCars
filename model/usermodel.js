
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
        required: false,
        default: "https://i.pinimg.com/736x/cd/52/d3/cd52d3075b8004ebf398622bf0043897.jpg", 
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