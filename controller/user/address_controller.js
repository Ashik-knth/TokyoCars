
const addressSchema = require("../../model/address");
const userSchema = require("../../model/usermodel");


exports.add_address = async (req, res) =>{

   try{
    const {addressName,phoneNumber,streetAddress,city,state,zipCode,country} = req.body;

    const user = req.session.Userdata;

    const checkout = req.query.checkout;

    const router = checkout ? '/checkout' : '/address';

    const address = new addressSchema({
        userId:user._id,
        addressName,
        phoneNumber,
        streetAddress,
        city,
        state,
        zipCode,
        country
    })
    await address.save();
    req.flash('success','Address added successfully');
    res.redirect(router);

   }catch(error){
    console.log(error);
    res.redirect('/pageNotFound');
    
   }
    
}


exports.checkout_address = async (req, res) =>{

    try{
     const {addressName,phoneNumber,streetAddress,city,state,zipCode,country} = req.body;
 
     const user = req.session.Userdata;
 
     const address = new addressSchema({
         userId:user._id,
         addressName,
         phoneNumber,
         streetAddress,
         city,
         state,
         zipCode,
         country
     })
     await address.save();
     req.flash('success','Address added successfully');
     res.redirect('/checkout');
 
    }catch(error){
     console.log(error);
     res.redirect('/pageNotFound');
     
    }

}

exports.edit_address = async (req, res) =>{
    try{
        const {addressName,phoneNumber,streetAddress,city,state,zipCode,country,addressId} = req.body;
        const user = req.session.Userdata._id;
        const address = await addressSchema.findByIdAndUpdate(addressId,{
            addressName,
            phoneNumber,
            streetAddress,
            city,
            state,
            zipCode,
            country,
            userId:user
        });

        if(!address){
            return res.redirect('/address');
        }
        await address.save();
        
        req.flash('success','Address updated successfully');
        
        res.redirect('/address');
    }catch(error){
        console.log(error);
        res.redirect('/pageNotFound');
    }
}

exports.delete_address = async (req, res) =>{
    try{
        const {addressId} = req.body;
        const address = await addressSchema.findById(addressId);
        if(!address){
            return res.redirect('/address');
        }
        address.isDeleted = true;
        await address.save();
        res.status(200).send({  success:true , message:'Address deleted successfully', Redirecturl:'/address' });
    }catch(error){
        console.log(error);
        res.status(500).send({  success:false , message:'Internal server error' });
    }
}
