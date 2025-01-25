
const userSchema = require("../../model/usermodel");
const Product = require("../../model/product");
const categorySchema = require("../../model/category");
const cartSchema = require("../../model/cart");
const AddressSchema = require("../../model/address");
const wishlistSchema = require("../../model/wishlist");

exports.cart = async (req, res) => {
    try {
        if (!req.session.Userdata) {
            return res.redirect("/login");
        }

        const userId = req.session.Userdata._id;
        const productId = req.body.productId;
        const quantity = parseInt(req.body.quantity);

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        let cart = await cartSchema.findOne({ user: userId });
        if (!cart) {
            cart = new cartSchema({ user: userId, items: [] });
        }

        if(product.stock<quantity){
            return res.json({success:false, message: "Quantity out of stock" });
        }

        if(quantity==0){
            return res.json({success:false, message: "Product not Awailable" });
        }

        const existingProduct = cart.items.find(item => item.product.toString() === productId);

        const totalQuantity = existingProduct ? existingProduct.quantity + quantity : quantity;

        if (totalQuantity > product.stock) {
            return res.json({
                success: false,
                message: "Cannot add product to cart. Quantity exceeds stock."
            });
        }

        if (existingProduct) {

            existingProduct.quantity += quantity;
        } else {
            cart.items.push({ product: productId, quantity: quantity });
        }

        await cart.save();
        console.log("Cart saved successfully");
        res.status(201).json({
            success: true,
            message: "Product added to cart successfully",
            redirectUrl: '/cart'
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
};


exports.cart_page = async (req, res) => {
    console.log("this is my cart page newwwww");

    if (!req.session.Userdata) {
        return res.redirect("/login"); 
    }

    const userId = req.session.Userdata._id;

    let wishlist_length = 0;

    const wishlist = await wishlistSchema.findOne({userId:userId});

    if(wishlist){
        wishlist_length = wishlist.items.length;
    }

    let totalAmount = 0;

    let cart = await cartSchema.findOne({ user: userId }).populate('items.product');
    if (!cart) {
        cart = { items: [] };
    }

    cart.items.forEach(item => {
        totalAmount += item.product.regularPrice * item.quantity;
    });

    try {
        const cart = await cartSchema.findOne({ user: userId }).populate('items.product');

        res.render('user/cart', {
            title: "TOKYO CARS",
            layout: "layouts/user_layout",
            user: req.session.Userdata,
            cart: cart || { items: [] },
            totalAmount: totalAmount,
            wishlist_length
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.update_quantity = async (req, res) => {
    try {

        console.log("User ID:", req.session.Userdata._id);
        console.log("Product ID:", req.body.productId);
        console.log("Quantity:", req.body.quantity);

        const quantity = req.body.quantity;
        const productId = req.body.productId;
        const userId = req.session.Userdata._id;
        const product = await Product.findById(productId);

        console.log("Quantity:", quantity);
        
        console.log("Product STOCK:", product.stock);
        
        if(!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if(product.stock<quantity){
            return res.json({success:false, message: "Quantity out of stock" ,quantity:product.stock});
        }
        
        const cart = await cartSchema.findOne({ user: userId });
        const item = cart.items.find(item => item.product.toString() === productId);

        if (item) {
            item.quantity = quantity;
            // totalAmount = item.quantity * item.product.regularPrice;
            console.log("just wowwwwwwwww");
            
            // console.log("Total Amount:", totalAmount);
            await cart.save();
            res.status(200).json({success:true });
        } else {
            res.status(404).json({ success: false, message: "Product not found in cart" });
        }
    } catch (error) {
        console.log(error);
        res.redirect('/pageNotFound');
    }
};

exports.remove_from_cart = async (req, res)=>{
    try{

        console.log("Product removed from cart");

        const productId = req.body.productId;   
        const userId = req.session.Userdata._id;

        const cart = await cartSchema.findOne({user:userId});
        if(!cart){
            return res.status(404).json({success:false, message: "Cart not found"});
        }

        const removeProduct = cart.items.find(item => item.product.toString() === productId);
        if(!removeProduct){
            return res.status(404).json({success:false, message: "Product not found in cart"});
        }

        cart.items.pull(removeProduct);
        await cart.save();
        res.status(200).json({success:true, message: "Product removed from cart successfully"});
        
        

    }catch(err){
        console.log(err);
        res.redirect('/pageNotFound');
    }
}


