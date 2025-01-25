const { name } = require('ejs');
const couponSchema = require('../../model/coupon');

exports.coupon = async (req,res)=>{
    const admin = req.session.admin;
    const coupon = await couponSchema.find();
    console.log("zzzzzzz",coupon);
    
    res.render('admin/coupon', {
        title: 'Coupon Management',
        layout: 'layouts/admin_layout',
        admin,
        coupon
    });
}


exports.addcoupon = async (req, res) => {
  try {
    console.log("Received Coupon Data:", req.body);

    const { name, discount, date } = req.body;

    // Create and save the coupon
    const coupon = new couponSchema({
      coupon_code: name,
      discount: parseFloat(discount),
      expiryDate: new Date(date) 
    });

    await coupon.save();

    console.log("Coupon saved successfully:", coupon);
    res.redirect('/admin/coupon');
  } catch (error) {
    console.error("Error while adding coupon:", error);
    res.status(500).send("An error occurred while adding the coupon. Please try again later.");
  }
};

exports.editcoupon = async (req, res) => {
  try{

    console.log("edit coupon  ");
    
  
    console.log("eeeeeee",req.body);

    const {editID,couponName, discountName,dateName} = req.body;

    const coupon = await couponSchema.findByIdAndUpdate(editID, {
       coupon_code: couponName,
       discount: parseFloat(discountName),
       expiryDate: new Date(dateName)
    })

    if(!coupon){
      console.log("coupon not found");
      return res.status(404).send("Coupon not found");
    }

    console.log("coupon updated successfully:", coupon);
    

    res.redirect('/admin/coupon');

  }catch(error){
    console.log(error);
    
  }
}


exports.deletecoupon = async (req,res)=>{

try{

  console.log("deletecoupon called");

  const{couponId} = req.body;

  console.log("This is my coupon Id",couponId);

  await couponSchema.findByIdAndDelete(couponId);

  console.log("coupon deleted successfully");
  

  res.status(200).json({success:true, message: "Coupon deleted Successfully"});
  

}catch(error){
  console.log("Delete coupon  error",error);
  res.redirect('/pageerror')
  
}
  
  
}
  
