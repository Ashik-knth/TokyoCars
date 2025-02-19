
const addressSchema = require("../../model/address");
const cartSchema = require("../../model/cart");
const orderSchema = require("../../model/order");
const categorySchema = require("../../model/category");
const wishlistSchema = require("../../model/wishlist");
const couponSchema = require("../../model/coupon");
const Product = require("../../model/product");
const { product } = require("./product_controller");


exports.datefilter = async (req, res) => {
    try {

        const admin = req.session.admin;
        console.log("Date filter route is called", req.body);

        const { startDate, endDate } = req.body;



        if (!startDate) {
            return res.status(400).json({ message: "Start date is required." });
        }

        if (!endDate) {
            return res.status(400).json({ message: "End date is required." });
        }

        let filter = {};


        filter = { orderDate: { $gte: new Date(startDate), $lte: new Date(endDate) } };

        console.log("Filtering orders with:", filter);
        

        const orders = await orderSchema.find(filter).sort({ orderDate: -1 }).limit(4).populate("items.product").populate("address").populate("user");



        const products = await Product.countDocuments();
        

        const order = await orderSchema.aggregate([
           
            {
                $match: {
                    orderDate: {
                        $gte: new Date(startDate), 
                        $lte: new Date(endDate)   
                    }
                }
            },
            
            {
                $unwind: "$items"
            },
           
            {
                $match: {
                    'items.orderStatus': 'Delivered'
                }
            },
          
            {
                $group: {
                    _id: null, 
                    deliveredCount: {
                        $sum: 1 
                    },
                    overallDiscount: {
                        $sum: "$items.discount" 
                    },
                    overallOrderAmount: {
                        $sum: {
                            $subtract: [
                                { $multiply: ['$items.price', '$items.quantity'] }, 
                                '$items.discount'
                            ]
                        }
                    }
                }
            },
           
            {
                $project: {
                    _id: 0,
                    deliveredCount: 1,
                    overallDiscount: 1,
                    overallOrderAmount: 1
                }
            }
        ]);


        console.log("this is my orderssssssssssssss",order);
        

        const topproducts = await orderSchema.aggregate([

            {
                $match: {
                    orderDate: {
                        $gte: new Date(startDate), 
                        $lte: new Date(endDate)   
                    }
                }
            },

            {$unwind:"$items"},

            {
                $match:{
                    'items.orderStatus': 'Delivered'
                }
            },

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

        console.log("this is top productssssssssss",topproducts);
        


        const topCategorys = await orderSchema.aggregate([


            {
                $match: {
                    orderDate: {
                        $gte: new Date(startDate), 
                        $lte: new Date(endDate)   
                    }
                }
            },
             
         

            {$unwind:"$items"},

            {$match:{"items.orderStatus" : "Delivered"}},


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
        

      console.log("this is my top categorysssssssss ",topCategorys);
      
        

        if(order.length==0 && orders.length==0){
          
            return res.status(400).json({ success: false , message: "Orders not found"});
        }

        res.status(200).json({ success: true, message:"Filter Applied ", orders, order, admin , products , topproducts , topCategorys });
    } catch (error) {
        console.error("Error in datefilter:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error });
    }
};

