
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    isDeleted: {
        type: Boolean,
        default: false,
    },

    categoryoffer :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Offer",
        required : false
    },

    categoryofferprice : {
        type : Number,
        required : false
    }
},
{timestamps: true}
);



const Category = mongoose.model("Category", categorySchema);

module.exports = Category