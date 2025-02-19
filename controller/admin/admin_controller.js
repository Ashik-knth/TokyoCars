const { session } = require("passport");
const userSchema = require("../../model/usermodel");
const orderSchema = require("../../model/order")
const Product = require("../../model/product");
const bcrypt = require("bcrypt");



exports.adminlogin = async (req, res) => {

    try{
    const { email , password } = req.body;
 
     console.log("Admin login", email, password);
     

    const admin = await userSchema.findOne({ email , isAdmin : true });

    console.log("This just for testing",admin);
    

    const errors = {};
    
    if(!email&&!password){
        errors.fields_error = "All fields are required";
        req.flash("errors", errors);
        return res.redirect("/admin/login");
    }

    if(!email){
        errors.email_error = "Must provide email";
        req.flash("errors", errors);
        return res.redirect("/admin/login");
    }

    if(!password){
        errors.password_error = "Must provide password";
        req.flash("errors", errors);
        return res.redirect("/admin/login");
    }
    
    if(!admin){
        errors.admin_error = "Invalid cedentials";
        req.flash("errors", errors);
        return res.redirect("/admin/login");
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if(!passwordMatch){
        errors.admin_password_match = "Password does not match";
        req.flash("errors", errors);
        return res.redirect("/admin/login");
    }

    req.session.admin = admin;
    res.redirect("/admin/dashboard");
    }catch(error){
        console.log(error);
        return res.redirect("/pageerror");
    }
     

}




exports.adminhomelogin = (req, res) => {
    
    try{

   

    const admin = req.session.admin;
    
    if(admin){
        return res.redirect("/admin/dashboard");
    }

    res.render("admin/login",{
        title: "Admin Login",
        layout: false,
        admin
    });

}catch(error){
    console.log(error);
    return res.redirect("/pageerror");
}

}
exports.dashboard = async  (req, res) => {
  
    try{

        const salesReport = await orderSchema.aggregate([
            
            {
                $match: {
                    'items.orderStatus': 'Delivered'
                }
            },
           
            {
                $unwind: '$items'
            },
           
            {
                $match: {
                    'items.orderStatus': 'Delivered'
                }
            },
           
            {
                $group: {
                    _id: null, 
                    totalDeliveredOrders: { $sum: 1 }, 
                    overallOrderAmount: {
                        $sum: {
                            $subtract: [
                                { $multiply: ['$items.price', '$items.quantity'] }, 
                                '$items.discount'
                            ]
                        }
                    },
                    overallDiscount: {
                        $sum: '$items.discount' 
                    }
                }
            },
            
            {
                $project: {
                    _id: 0, 
                    totalDeliveredOrders: 1,
                    overallOrderAmount: 1,
                    overallDiscount: 1
                }
            }
        ]);


        console.log("this is my dashboarddattaaaaaaa",salesReport);
        
        
        


        const topproducts = await orderSchema.aggregate([

            {$match:{"items.orderStatus" : "Delivered"}},

            {$unwind:"$items"},

            {
                $group:{
                    _id: "$items.product",
                    productTitle : { $first: "$items.productTitle"},
                    totalQuantity : {$sum: "$items.quantity"},
                    sellCount: { $sum: 1 },

                },
            },

            {
                $sort:{totalQuantity:-1}
            },

           {
            $limit: 5
           },

           {
            $project:{
                _id: 0,
                productId : "$_id",
                productTitle : 1,
                totalQuantity : 1,
                sellCount : 1,
            },
           },

        ])


        console.log("this is my top productsssssssss",topproducts);
        

        const topCategorys = await orderSchema.aggregate([
             
            {$match:{"items.orderStatus" : "Delivered"}},

            {$unwind:"$items"},


           {
            $lookup:{
                from:"products",
                localField : "items.product",
                foreignField: "_id",
                as: "productDetails"
            }
           },

           {$unwind:"$productDetails"},

           {
            $lookup:{
                from:"categories",
                localField: "productDetails.category",
                foreignField: "_id",
                as : "CategoryDetails",
            },
           },

           {$unwind:"$CategoryDetails"},

           {
            $group:{
                _id: "$CategoryDetails.name",
                totalQuantity : {$sum:"$items.quantity"},
                Sellcount : {$sum:1},

            },
           },

           {$sort : {totalQuantity:-1}},

           {$limit:5},

           {
            $project:{
                _id:0,
                categoryName : "$_id",
                totalQuantity : 1,
                Sellcount : 1,
            },
           },

        ])        


        console.log("this is my top categoriesssssss",topCategorys);
        


          const products = await Product.countDocuments();
          

        const order = await orderSchema.find().sort({ orderDate: -1 }).limit(4).populate("items.product").populate("address").populate("user");

        if(!order){
            res.status(404).json({error : "Order Not found"});
        }
    

    admin = req.session.admin;
    res.render('admin/dashboard', {
        title: 'Admin Dashboard',
        layout: 'layouts/admin_layout',
        admin,
        salesReport,
        products,
        order,
        topproducts,
        topCategorys,
    });

}catch(error){
    console.log(error);
    return res.redirect("/pageerror");
}


};



exports.orders = (req, res) => {
    res.render("admin/orders");
}

exports.password = (req, res) => {
    res.render("admin/password");
}



exports.users = (req, res) => {
    res.render("admin/users");
}

exports.pageerror = (req, res) => {
    res.render("admin/404",{
        title: "Error Page",
        layout:false
    });
}

exports.logout = (req,res) =>{
     try{

        console.log("your very niceeeeee");
        
        
        req.session.destroy(err =>{
            if(err){
                console.log("Error session destroy error", err);
                
                res.status(500).json({ success:false , message:"Session destoy error"});
                
            }

           res.status(200).json({success:true})
        })
     }catch(error){
        console.log("unexpected error during log out",error);
        res.redirect('/pageerror')
        
     }
}


exports.cancel_order = async (req,res)=>{
    console.log("Admin cancel router is called");

    try {
        const { orderId, productId, message } = req.body;
        console.log("Cancel order request received", orderId);

        console.log("Cancel order reasonnnnn", message);


        console.log("Cancel product request id", productId);

        const user = req.session.Userdata;

        const order = await orderSchema.findById(orderId);

        if (!order) {
            res.status(400).json({ success: false, message: "Order not found" });
            return;
        }

        const productcheck = await Product.findById(productId);




        if (!productcheck) {
            res.status(400).json({ success: false, message: "Product not found" });
            return;
        }

        console.log("This is the product  ", productcheck);

        productcheck.stock += order.items.find(item => item.product.toString() === productcheck._id.toString()).quantity;

        await productcheck.save();


        let wallet = await walletSchema.findOne({ user: user._id });

        if (!wallet) {

            wallet = new walletSchema({
                user: user._id,
                balance: 0,
                wallet_history: []
            })
        }



        for (let product of order.items) {
            if (product.product._id.toString() === productcheck._id.toString()) {

                product.orderStatus = "Cancelled";

                product.CancelorderReason = message;

                if (order.paymentMethod === 'Razorpay' || order.paymentMethod === 'Wallet') {


                    console.log("Product offerrrrr priceeeeeeeeee", product.price);



                    const refundedAmount = product.price * product.quantity - product.discount + 40;

                    wallet.balance += refundedAmount;


                    wallet.wallet_history.push({
                        date: new Date(),
                        amount: refundedAmount,
                        discription: "Order Cancelled Money Credited",
                        transactionType: "Credited"
                    })

                }

                console.log("Product cancelled successfully", product.orderStatus);

            }

        }

        console.log("Walletissssss", wallet);

        await wallet.save();


        console.log("Wallet balance updated successfully", wallet.balance);


        await order.save();

        res.status(200).json({ success: true, message: "Order cancelled successfully" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
    
}

