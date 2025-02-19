const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    discount: {
        type: Number,
        required: true,
    },
    
    endDate: {
        type: Date,
        required: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
},

{timestamps: true}

)


const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer