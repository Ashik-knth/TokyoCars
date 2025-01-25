const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
   userId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
         required: false,
   },
   otp: {
         type: String,
         required: true,
   },
   createdAt: {
         type: Date,
         default: Date.now,
         expires: 120, 
   },

   email:{
     type: String,
     required: false,
     unique: false,
   }
});

const Otp = mongoose.model("Otp", otpSchema);

module.exports = Otp;
