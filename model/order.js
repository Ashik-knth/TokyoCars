const moongoose = require('mongoose');

const orderSchema = new moongoose.Schema({

    OrderId: {
        type: String,
        required: true,
        unique: true
    },
   
    user: {
        type: moongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

 
    address:{
        type: moongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: true
    },

    orderDate: {
        type: Date,
        default: Date.now
    },

    items:[{
        product: {
            type: moongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        
        quantity:{
            type: Number,
            default: 1
        },

        price:{
            type: Number,
            required: true
        },

        discount:{
            type: Number,
            default: 0
        },

        orderStatus:{
            type: String,
            default: 'Processing',
            enum: ['Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled']
        },

        isReturnRequested:{
            type: Boolean,
            default: false
        },

        

        isAdminAcceptedReturn:{
            type: String,
            default: 'Pending',
            enum: ['Pending', 'Accepted', 'Rejected']
        },

        reasonofReturn:{
            type: String,
        },

        PaymentStatus:{
            type: String,
            default: 'Pending',
            enum: ['Pending', 'Paid', 'Failed', 'Refunded']
        },

    }],

    paymentMethod:{
        type: String,
        required: true,
        enum: ['Cash on Delivery', 'Online']
    },

    // PaymentStatus:{
    //     type: String,
    //     default: 'Pending',
    //     enum: ['Pending', 'Paid', 'Failed', 'Refunded']
    // },

    totalAmount:{
        type: Number,
        required: true
    },

    payableAmount:{
        type: Number,
        required: true
    },

    shippingCharge:{
        type: Number,
        default: 0
    },


    
},{
    timestamps: true
});

const Order = moongoose.model('Order', orderSchema);

module.exports = Order;
    