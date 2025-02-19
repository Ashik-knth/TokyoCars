const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({

    coupon_code:{
        type: String,
        required: true,
        unique: true,
    },

    discount:{
        type: Number,
        required: true,
    },

    coupon_stock:{
        type: Number,
        required: false,
    },
    
    startDate: {
        type: Date,
        required: false,
    },

    expiryDate: {
        type: Date,
        required: true,
    },


   minimum_purchase_amount : {
    type: Number,
    default:0

   },


   maximum_coupon_amount :{
    type: Number,
    default:0
   },

},

{
    timestamps: true    }


);

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon

