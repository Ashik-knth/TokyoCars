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

   users: [{
    
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    isBought:{
        type: Boolean,
        default: false
    }

   }],

   minimum_purchase_amount : {
    type: Number,
    default:1000

   },


   maximum_coupon_amount :{
    type: Number,
    default:2000
   },

},

{
    timestamps: true    }


);

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon

