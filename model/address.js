const mmongoose = require("mongoose");

const addressSchema = new mmongoose.Schema({
    userId:{
        type:mmongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    addressName:{
        type:String,
        required:true
    },

   phoneNumber:{
     type:String,
     required:true
   },

   streetAddress:{
     type:String,
     required:true
   },
   
   isDeleted: {
    type: Boolean,
    default: false,
   },
 
   saveInfo:{
     type:Boolean,
     default:false
   },

   isDeleted:{
     type:Boolean,
     default:false
   },
   
   city:{
     type:String,
     required:true
   },
   
   state:{
     type:String,
     required:true
   },

   zipCode:{
     type:String,
     required:true
   },

   country:{
     type:String,
     required:true
   }
    

},

{timestamps:true}

);  


const Address = mmongoose.model("Address", addressSchema);

module.exports = Address