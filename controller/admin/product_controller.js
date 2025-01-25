const Product = require("../../model/product");
const Category = require("../../model/category");
const User = require("../../model/usermodel");
const orderSchema = require("../../model/order");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { log } = require("console");




exports.product = async (req, res) => {
    const admin = req.session.admin;
    const product = await Product.find().populate("category", "name")
    const category = await Category.find({ isDeleted: false });
    res.render("admin/product", {
        title: "Tokyo Cars",
        layout: "layouts/admin_layout",
        admin,
        product,
        category
    });
}

exports.addproduct = async (req, res) => {
    try {
        const admin = req.session.admin;
        const category = await Category.find({ isDeleted: false });

        res.render("admin/addproduct", {
            title: "Tokyo Cars",
            layout: "layouts/admin_layout",
            admin,
            category
        });

    } catch (error) {
        console.log(error);
        return res.redirect("/pageerror");
    }

}


exports.editproduct = async (req, res) => {

    const id = req.query.id;

    console.log("This is my id", id);


    console.log(req.files, "aasdasd");


    const product = await Product.findById({ _id: id }).populate("category", "name");



    const category = await Category.find({ isDeleted: false });


    console.log(product.productImage, "aasdasd");

    const admin = req.session.admin;
    res.render("admin/editproduct", {
        title: "Tokyo Cars",
        layout: "layouts/admin_layout",
        admin,
        product,
        category
    });
}
exports.addproducts = async (req, res) => {
    try {
        console.log("This is my files", req.files);
        console.log("This is my body", req.body);

        const errors = {};
        const { productName, category, regularPrice, description, stock } = req.body;


        if (!productName || !category || !regularPrice || !description || !stock) {
            errors.empty_error = "All fields are requireds";
            req.flash("errors", errors);
            return res.redirect('/admin/addproduct');
        }


        const productexist = await Product.findOne({ productName });
        if (productexist) {
            errors.product_error = "Product already exists";
            req.flash("errors", errors);
            return res.redirect('/admin/addproduct');
        }


        if (regularPrice < 0) {
            errors.price_error = "Regular price must be greater than 0";
            req.flash("errors", errors);
            return res.redirect('/admin/addproduct');
        }

        const categorys = await Category.findById(category);
        if (!categorys) {
            errors.category_error = "Invalid category";
            req.flash("errors", errors);
            return res.redirect('/admin/addproduct');
        }


        const productImage = req.files.map(file => file.filename);


        const newProduct = new Product({
            productName,
            category,
            regularPrice,
            productImage,
            description,
            stock
        });

        await newProduct.save();
        return res.redirect('/admin/product');

    } catch (error) {
        console.error('Error while adding product:', error);
        return res.redirect('/pageerror');
    }
};


// exports.deletesingleimage = async (req, res) => {
//     const { imageNameToServer, productIdToServer } = req.body;

//     const product = await Product.findByIdAndUpdate(productIdToServer, { $pull: { productImage: imageNameToServer } });

//     const imagePath = path.join(__dirname, `../../public/uploads/${imageNameToServer}`);

//     fs.unlink(imagePath, (err) => {
//         if (err) {
//             console.error('Error deleting image:', err);
//             return res.redirect('/pageerror');
//         }
//         console.log('Image deleted successfully');
//         return res.redirect('/admin/product');
//     });
// }


exports.editproductfile = async (req, res) => {
    try {
        const _id = req.params.id;
        const errors = {};


        const existingProduct = await Product.findById(_id);
        if (!existingProduct) {
            errors.product_error = "Product not found";
            req.flash("errors", errors);
            return res.redirect('/admin/product');
        }


        let productImage = [...existingProduct.productImage];

        if (req.files && req.files.length > 0) {
            req.files.forEach((file, index) => {
                const fieldName = file.fieldname;
                const match = fieldName.match(/productImage(\d+)/);
                if (match) {
                    const position = parseInt(match[1]) - 1;
                    productImage[position] = file.filename;
                }
            });
        }


        const { productName, category, price, description, stock } = req.body;

        console.log("this is my regular price", price);

        console.log("this is my stock", stock);


        const updatedProduct = await Product.findByIdAndUpdate(
            _id,
            {
                productName,
                category,
                regularPrice: price,
                description,
                stock,
                productImage
            },
            { new: true }
        );

        if (!updatedProduct) {
            errors.product_error = "Product not found";
            req.flash("errors", errors);
            return res.redirect('/admin/product');
        }

        return res.redirect('/admin/product');

    } catch (error) {
        console.error("Error updating product:", error);
        return res.redirect("/pageerror");
    }
};
exports.deleteproduct = async (req, res) => {
    try {
        const { productId } = req.body;
        console.log("This is my product id", productId);
        const product = await Product.updateOne({ _id: productId }, { $set: { isBlocked: true } });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        return res.json({ success: true, redirectUrl: "/admin/product" });
    } catch (error) {
        console.log(error);
        return res.redirect("/pageerror");
    }
};

exports.restoreproduct = async (req, res) => {
    try {
        const { productId } = req.body;
        console.log("This is my product id", productId);
        const product = await Product.updateOne({ _id: productId }, { $set: { isBlocked: false } })
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        return res.json({ success: true, redirectUrl: "/admin/product" });
    } catch (error) {
        console.log(error);
        return res.redirect("/pageerror");
    }
};

exports.ordermanagement = async (req, res) => {
    try {
        // const orders = await orderSchema.aggregate([
        //     {
        //         $unwind: "$items" // Unwind the items array
        //     },
        //     {
        //         $lookup: {
        //             from: "users", // Collection name for users
        //             localField: "user",
        //             foreignField: "_id",
        //             as: "user"
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: "products", // Collection name for products
        //             localField: "items.product",
        //             foreignField: "_id",
        //             as: "items.product"
        //         }
        //     },
        //     {
        //         $unwind: "$user" // If user is an array, unwind it
        //     },
        //     {
        //         $unwind: "$items.product" // If product is an array, unwind it
        //     }
        // ]);

        
        const orders = await orderSchema.find().populate("user").populate("items.product").populate("address");
        
        console.log("Unwound Orders:", orders);

        const admin = req.session.admin;

        res.render("admin/order-management", {
            title: "Tokyo Cars",
            layout: "layouts/admin_layout",
            admin,
            orders
        });
    } catch (error) {
        console.error("Error in ordermanagement:", error);
        res.status(500).send("Internal Server Error");
    }
};


exports.paymentChange = async (req, res) => {
    console.log("this is my value", req.body);
    const { orderId, paymentStatus, productId } = req.body;
    const order = await orderSchema.findById(orderId).populate("items.product").populate("address").populate("user");
    const product = await Product.findById(productId);
    if(!product){
        res.status(400).json({ success: false, message: "Product not found" });
        return;
    }
    
    if(!order){
        res.status(400).json({ success: false, message: "Order not found" });
        return;
    }

    for(let value of order.items){
        if(value.product._id.toString() === product._id.toString()){
             value.PaymentStatus = paymentStatus;
        }
    }

    if(paymentStatus === "Paid"){
        for(let value of order.items){
            if(value.product._id.toString() === product._id.toString()){
                value.orderStatus = "Delivered";
            }
        }
    }

    await order.save();

    const OrderId = order.OrderId;
    return res.json({ success: true, message: "Payment status updated successfully" , OrderId });
    
}

exports.statusChange = async (req, res) => {

    console.log("Status change");
    
    console.log("Request body:", req.body);
    const { orderId, orderStatus,  productId } = req.body;

    try {

        const order = await orderSchema.findById(orderId).populate("items.product");
        
        const product = await Product.findById(productId);

        if(!product){
            res.status(400).json({ success: false, message: "Product not found" });
            return;
        }
        

        if (!order) {
            return res.status(400).json({ success: false, message: "Order not found" });
        }

       for(let value of order.items){
          if(value.product._id.toString() == product._id.toString()){
              value.orderStatus = orderStatus;
          }
       }

       if(orderStatus === "Delivered"){
        for(let value of order.items){
            if(value.product._id.toString() == product._id.toString()){
                value.PaymentStatus = "Paid";
            }
         }
       }

        await order.save();

        const orderIds = order.OrderId;


        console.log("Order status updated successfully");

        return res.json({ success: true, message: "Order status updated successfully", orderIds });
        
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.orderdetail = async (req, res) => {
    const admin = req.session.admin;
    const id = req.params.id;
    console.log("This is my order id", id);

    const order = await orderSchema.findById(id).populate("items.product").populate("address");

    if (!order) {
        res.status(400).json({ success: false, message: "Order not found" });
        return;
    }

    console.log("Order contains", order.items.length, "items.");
    console.log("First item:", order.items[0]);


    order.items = Array.isArray(order.items) ? order.items : [];


    console.log("This is my orderqqqqqqq", order.items);



    res.render("admin/orderdetails", {
        title: "TOKYO CARS",
        layout: "layouts/admin_layout",
        admin,
        order,
    });

}


exports.returnstatusChange = async (req,res) =>{
    try{

        console.log("Return Status change");

        console.log('This is my body', req.body);


        const {orderStatus , orderId , productId} = req.body ;

        const order = await orderSchema.findById(orderId).populate("items.product");
        
        if(!order){
            res.status(404).json({success:false , message: 'Order is not found'})
        }

        const product = await Product.findById(productId);

        if(!product){
            res.status(404).json({success:false, message: 'Product is not found'});
        }

        for(let value of order.items){
            if(value.product._id.toString() == product._id.toString()){

                value.isAdminAcceptedReturn = orderStatus ;
            }
        }

        await order.save();

        const OrderId = order.OrderId;

        res.status(200).json({success:true, message:'Return status updated successfully', OrderId});


        

    }catch(error){
        console.log("A Error Occured",error);
        
    }
}


