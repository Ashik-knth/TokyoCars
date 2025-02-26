
const userSchema = require("../../model/usermodel");
const Product = require("../../model/product");
const categorySchema = require("../../model/category");
const cartSchema = require("../../model/cart");
const AddressSchema = require("../../model/address");
const wishlistSchema = require("../../model/wishlist");

exports.cart = async (req, res) => {
    try {

        console.log("cart post  request received");

        if (!req.session.Userdata) {
            return res.redirect("/login");
        }

        const userId = req.session.Userdata._id;

        console.log("User ID:", userId);

        const id = req.body.productId.trim();

        console.log("Product ID:", id);

        const quantity = parseInt(req.body.quantity);

        console.log("Quantity:", quantity);

        const offerPrice = parseInt(req.body.offerPrice);

        console.log("Offer Price:", offerPrice);


        const product = await Product.findOne({ _id: id });

        console.log("Product:", product);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        console.log("Productssssssssssssssssss:", product);


        let cart = await cartSchema.findOne({ user: userId });

        console.log("Cartsssssssssssssssss:", cart);

        if (!cart) {
            cart = new cartSchema({ user: userId, items: [] });
        }

        console.log(" First step ");


        if (product.stock < quantity) {
            return res.json({ success: false, message: "Quantity out of stock" });
        }

        console.log(" Second step ");


        if (quantity == 0) {
            return res.json({ success: false, message: "Product not Awailable" });
        }

        console.log(" Third step ");


        const existingProduct = cart.items.find(item => item.product.toString() === product._id.toString());

        console.log(" Existing Product:", existingProduct);


        const totalQuantity = existingProduct ? existingProduct.quantity + quantity : quantity;

        console.log(" Total Quantity:", totalQuantity);


        if (totalQuantity > product.stock) {
            return res.json({
                success: false,
                message: "Cannot add product to cart. Quantity exceeds stock."
            });
        }

        console.log(" Fourth step ");


        if (existingProduct) {

            existingProduct.quantity += quantity;
        } else {
            cart.items.push({ product: product._id, quantity: quantity });
        }

        console.log(" Fifth step ");


        await cart.save();
        console.log("Cart saved successfully");

        console.log("Sixth step ");

        res.status(201).json({
            success: true,
            message: "Product added to cart successfully",
            redirectUrl: '/cart',

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

    const wishlist = await wishlistSchema.findOne({ userId: userId });

    if (wishlist) {
        wishlist_length = wishlist.items.length;
    }

    let totalAmount = 0;

    let cart = await cartSchema.findOne({ user: userId }).populate('items.product');
    if (!cart) {
        cart = { items: [] };
    }

    cart.items.forEach(item => {

        const offerPrice = (() => {
            const productOffer = typeof item.product.productOffer === "number" &&
                !isNaN(item.product.productOffer) ? item.product.productOffer : 0;
            const categoryOffer = typeof item.product.categoryofferprice === "number" &&
                !isNaN(item.product.categoryofferprice) ? item.product.categoryofferprice : 0;


            if (productOffer > 0 && categoryOffer > 0) {
                return Math.min(productOffer, categoryOffer);
            } else if (productOffer > 0) {
                return productOffer;
            } else if (categoryOffer > 0) {
                return categoryOffer;
            } else {
                return 0;
            }
        })();

        totalAmount += offerPrice > 0 ? offerPrice * item.quantity : item.product.regularPrice * item.quantity;

        console.log("Jusssstttt manasilavan", totalAmount);

    });

    try {
        const cart = await cartSchema
            .findOne({ user: userId })
            .populate('items.product');

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

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (product.stock < quantity) {
            return res.json({ success: false, message: "Quantity out of stock", quantity: product.stock });
        }

        const cart = await cartSchema.findOne({ user: userId });
        const item = cart.items.find(item => item.product.toString() === productId);

        if (item) {
            item.quantity = quantity;
            // totalAmount = item.quantity * item.product.regularPrice;
            console.log("just wowwwwwwwww");

            // console.log("Total Amount:", totalAmount);
            await cart.save();
            res.status(200).json({ success: true });
        } else {
            res.status(404).json({ success: false, message: "Product not found in cart" });
        }
    } catch (error) {
        console.log(error);
        res.redirect('/pageNotFound');
    }
};

exports.remove_from_cart = async (req, res) => {
    try {

        console.log("Product removed from cart");

        const productId = req.body.productId;
        const userId = req.session.Userdata._id;

        const cart = await cartSchema.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        const removeProduct = cart.items.find(item => item.product.toString() === productId);
        if (!removeProduct) {
            return res.status(404).json({ success: false, message: "Product not found in cart" });
        }

        cart.items.pull(removeProduct);
        await cart.save();
        res.status(200).json({ success: true, message: "Product removed from cart successfully" });



    } catch (err) {
        console.log(err);
        res.redirect('/pageNotFound');
    }
}


