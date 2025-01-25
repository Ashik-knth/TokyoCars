const mongoose = require("mongoose");

const Product = require("./product");

const User = require("./usermodel");

const cartSchema = new mongoose.Schema({
    user :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    items:[{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        
        quantity:{
            type: Number,
            default: 1
        }
    }],

},
{
    timestamps: true
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;