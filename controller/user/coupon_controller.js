const cartSchema = require("../../model/cart");
const orderSchema = require("../../model/order");
const categorySchema = require("../../model/category");
const wishlistSchema = require("../../model/wishlist");
const couponSchema = require("../../model/coupon");
const Product = require("../../model/product");
const userSchema = require("../../model/usermodel");


exports.apply_coupon = async (req, res) => {
    try{

        console.log("apply coupon request received");

        const user = req.session.Userdata;

        const {couponId, totalAmount, cartId} = req.body;


        const cart = await cartSchema.findById(cartId).populate("items.product");


        console.log("qqqqqqqqq",cart);


        // const productIds = cart.items.map(item => item.product._id.toString());
       
        // const product = await Product.find({ _id: { $in: productIds } });

        // console.log("This is my product", product);
        
        

        // console.log("Product IDs:", productIds);

        console.log("Body Data:", req.body);

        const coupon = await couponSchema.findOne({_id:couponId});

        console.log("This is my coupon", coupon);

        const discount = coupon.discount;

        console.log("This is my discount", discount);
        

        if(!coupon){
            console.log("coupon not found");
            return res.status(404).send("Coupon not found");
        }

        if(coupon.expiryDate < Date.now()){
            console.log("coupon expired");
            req.flash("error", "Coupon expired");
            return res.status(404).json({success:false , message:"Coupon expired" , discount, cart});
        }

        console.log("Total Amount:", totalAmount);
        

        const discountAmount = (totalAmount * coupon.discount) / 100;

        console.log("Discount Amount:", discountAmount);

        const updatedTotalAmount = totalAmount - discountAmount;

        console.log("Updated Total Amount:", updatedTotalAmount);

        res.status(200).json({success:true, message:"Coupon applied successfully", discountAmount, updatedTotalAmount,discount,cart});

    }catch(error){
        console.log(error);
    }
}


// exports.remove_coupon = async (req,res)=>{
//     try{

//         const {couponId} = req.body ;

//         const coupon = await couponSchema.findById(couponId);

//         if(!coupon){
//             console.log("coupon not found");
//             return res.status(404).send("Coupon not found");
//         }

//         console.log("coupon removed successfully:", coupon);
//         res.status(200).json({success:true, message:"Coupon removed successfully" , coupon});;

//     }catch(error){
//         console.log("Remove coupon error",error);
        
//     }
// }