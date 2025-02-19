const { ref, number, date, required } = require("joi");
const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },

    balance : {
        type : Number ,
        default : 0 ,
        required : true
    },

    wallet_history :[{
        date : {
            type : Date,
            required: true,
            default : Date.now()

        },

        amount : {
            type : Number ,
            required : true

        },

        discription : {
            type : String,
            required : false,
        },

        transactionType :{
            type: String,
            required : true,
            enum: ['Debited' , 'Credited']
        }
    }
]

},
{
    timestamps : true
}

);


const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet ;