const userSchema = require("../../model/usermodel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const env = require("dotenv").config();
const sendEmail = require("../../utils/sendemail");
const Product = require("../../model/product");
const otpSchema = require("../../model/otp");
const { session } = require("passport");
const addressSchema = require("../../model/address");
const cartSchema = require("../../model/cart");
const orderSchema = require("../../model/order");
const categorySchema = require("../../model/category");
const wishlistSchema = require("../../model/wishlist");
const couponSchema = require("../../model/coupon");
const razorpayInstance = require("../../config/razorpay");
const walletSchema = require("../../model/wallet");
const { object } = require("joi");
const { default: mongoose } = require("mongoose");
const { json } = require("body-parser");



exports.pageNotFound = async (req, res) => {
    try {
        res.render("user/page404", {
            title: "Error Page",
            layout: false
        });
    } catch (error) {
        console.log(error);
    }
}


exports.user_register = async (req, res) => {
    try {
        const { username, email, password, confirm_password } = req.body;

        const errors = {};

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        const usernameRegex = /^[a-zA-Z0-9]+$/;
        const emailuppercaseRegex = /^[A-Z]/;

        //  Username Validation

        if (username === "") {
            errors.username_error = "All fields are required";
            req.flash("errors", errors);
            return res.redirect("/signup");
        } else if (!usernameRegex.test(username)) {
            errors.username_error = "User name must be alphanumeric";
            req.flash("errors", errors);
            return res.redirect("/signup");
        }

        // Email Validtion

        if (email === "") {
            errors.email_error = "All fields are required";
            req.flash("errors", errors);
            return res.redirect("/signup");
        } else if (!emailRegex.test(email)) {
            errors.email_error = "Invalid email format";
            req.flash("errors", errors);
            return res.redirect("/signup");
        } else if (emailuppercaseRegex.test(email)) {
            errors.email_error = "Email must not start with an uppercase letter";
            req.flash("errors", errors);
            return res.redirect("/signup");
        }

        // Password Validation

        if (password === "") {
            errors.password_error = "All fields are required";
            req.flash("errors", errors);
            return res.redirect("/signup");
        } else if (!passwordRegex.test(password)) {
            errors.password_error = "Password must contain at least one letter, one number, and one special character";
            req.flash("errors", errors);
            return res.redirect("/signup");
        } else if (password.length < 8) {
            errors.password_error = "Password must be at least 8 characters long";
            req.flash("errors", errors);
            return res.redirect("/signup");
        }

        // Confirm Password Validation

        if (confirm_password === "") {
            errors.confirm_password_error = "All fields are required";
            req.flash("errors", errors);
            return res.redirect("/signup");
        } else if (password !== confirm_password) {
            errors.confirm_password_error = "Passwords do not match";
            req.flash("errors", errors);
            return res.redirect("/signup");
        }

        // Check if user already exists

        const finduser = await userSchema.findOne({ email });

        if (finduser) {
            errors.users_error = "User already exists";
            req.flash("errors", errors);
            return res.redirect("/signup");
        }


        const otp = Math.floor(100000 + Math.random() * 900000).toString();


        // REFERAL CODE GENERATOR


        const refferalcode = generateRefferalCode(8);

        function generateRefferalCode(length = 8) {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            return result;
        }

        console.log("Refferal codeeeeeeeeeeee", refferalcode);


        const emailSent = await sendEmail(email, otp);

        if (!emailSent) {
            res.status(500).send("Failed to send email");
            return;
        }

        req.session.Userdata = { username, email, password, refferalcode };

        console.log("This is my session data", req.session.Userdata);


        const otpData = new otpSchema({
            otp,
            email
        });

        otpData.save();

        console.log("Otp schema email", otpData.email);



        console.log("OTP SENT", otp);

        res.redirect("/verify-otp");


    } catch (error) {
        console.log("Signup error", error);

        res.redirect("/pageNotFound");
    }
}

exports.verify_otp = async (req, res) => {
    try {

        const { email } = req.session.Userdata;

        console.log("This is my email", email);

        const validateotp = await otpSchema.findOne({ email });

        console.log("Verify otp", validateotp);

        const { otp } = req.body;

        console.log("Body otp", otp);



        if (validateotp.otp === otp && validateotp.email === email) {

            const { username, email, password, refferalcode } = req.session.Userdata;
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new userSchema({
                username,
                email,
                password: hashedPassword,
                refferalCode: refferalcode
            });
            await user.save();

            console.log("Signup Successfully");

            req.session.destroy();

            res.json({ success: true });
        } else {
            res.status(400).json({ success: false, message: "Invalid OTP , Please Resend OTP and try again" });
        }

    } catch (error) {
        console.log("Verify otp error", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

exports.resend_otp = async (req, res) => {
    try {

        console.log(
            "Resend otp request received"
        );


        const { email } = req.session.Userdata;

        console.log(req.session.Userdata);

        console.log("Resend otp", email);


        // if (!email) {
        //     res.status(400).json({ success: false, message: "Email not found" });
        //     return;
        // }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const resendOtp = new otpSchema({

            otp,
            email
        });

        await resendOtp.save();

        const emailSent = await sendEmail(email, otp);

        console.log("OTP SENT", otp);


        if (emailSent) {
            console.log("Email sent successfully");

            res.json({ success: true, message: "OTP resent successfully" });

        } else {
            res.status(500).json({ success: false, message: "Resend otp error. Please try again" });
        }

    } catch (error) {
        console.log("Resend otp error", error);
        res.status(500).json({ success: false, message: "Resend otp error. Please try again" });
    }
}

exports.userlogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log("Login request received", email, password);


        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;


        const errors = {};

        if (!email) {
            errors.email_error = "All fields are required";
        } else if (!emailRegex.test(email)) {
            errors.email_error = "Invalid email format";
        }


        if (password === "") {
            errors.password_error = "All fields are required";
        } else if (password.length < 8) {
            errors.password_error = "Password must be at least 8 characters long";
        } else if (!passwordRegex.test(password)) {
            errors.password_error = "Password must contain at least one letter, one number, and one special character";;
        }

        if (Object.keys(errors).length > 0) {
            req.flash("errors", errors);
            return res.redirect("/login");
        }

        const user = await userSchema.findOne({ email, isAdmin: false, });

        if (!user) {
            errors.email_error = "Invalid User ";
            req.flash("errors", errors);
            return res.redirect("/login");
        }

        if (user.isBlocked) {
            errors.blocked = "Your account has been blocked Admin";
            req.flash("errors", errors);
            return res.redirect("/login");
        }


        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            errors.password_error = "Invalid email or password";
            req.flash("errors", errors);
            return res.redirect("/login");
        }

        req.session.Userdata = user;

        return res.redirect("/");

    } catch (error) {
        console.error(error);
        const errors = { server_error: "Something went wrong. Please try again later." };
        req.flash("errors", errors);
        return res.redirect("/login");
    }
}



exports.login = (req, res) => {

    console.log("Login page");

    const user = req.session.Userdata;

    res.render("user/logins", {
        title: "TOKYO CARS Login Page",
        layout: false,
        user
    });
}

exports.signupotp = (req, res) => {

    res.render("user/signupotp", {
        title: "Otp Page",
        layout: false,
    });
}

exports.userhome = async (req, res) => {

    let user = req.session.Userdata;
    console.log("This is my user", user);

    let wishlist_length = 0;


    if (user) {
        const wishlist = await wishlistSchema.findOne({ userId: user._id });
        if (wishlist) {
            wishlist_length = wishlist.items.length;

        }
    }

    console.log("wishlist_length", wishlist_length);



    res.render("user/home", {
        title: "TOKYO CARS",
        layout: "layouts/user_layout",
        user,
        wishlist_length
    }
    );
}

exports.signup = (req, res) => {
    res.render("user/signup", {
        title: "TOKYO CARS Signup",
        layout: false,

    });
}

exports.blog = async (req, res) => {
    const user = req.session.Userdata;

    let wishlist_length = 0;

    const wishlist = await wishlistSchema.findOne({ userId: user._id });

    if (wishlist) {
        wishlist_length = wishlist.items.length;
    }
    res.render("user/blog", {
        title: "BLOG PAGE",
        layout: "layouts/user_layout",
        user,
        wishlist_length
    });
}

exports.about = async (req, res) => {
    let user = req.session.Userdata;

    let wishlist_length = 0;

    const wishlist = await wishlistSchema.findOne({ userId: user._id });

    if (wishlist) {
        wishlist_length = wishlist.items.length;
    }
    res.render("user/about", {
        title: "ABOUT PAGE",
        layout: "layouts/user_layout",
        user,
        wishlist_length
    });
}

exports.contact = async (req, res) => {
    const user = req.session.Userdata;


    let wishlist_length = 0;

    const wishlist = await wishlistSchema.findOne({ userId: user._id });

    if (wishlist) {
        wishlist_length = wishlist.items.length;
    }


    console.log("rourer is called contact ");

    res.render("user/contact", {
        title: "Contact PAGE",
        layout: "layouts/user_layout",
        user,
        wishlist_length
    });
}


exports.shop = async (req, res) => {
    try {

        console.log("This is workingggg", req.query);

        const filter = req.query.filter || null;
        const page = parseInt(req.query.page) || 1;
        const search = req.query.search || null;
        const categorys = req.query.category || null;


        console.log("This is our filter", filter);
        console.log("this is our page", page);
        console.log("this is our search", search);
        console.log("this is our categorys", categorys);



        const user = req.session.Userdata;

        let wishlist_length = 0;

        const wishlist = await wishlistSchema.findOne({ userId: user._id });

        if (wishlist) {
            wishlist_length = wishlist.items.length;
        }


        let limit = 8;
        const skip = (page - 1) * limit;

        console.log("Skip", skip);


        const query = { isBlocked: false, stock: { $gt: 0 } };
        let sortOptions = {};

        const isAjaxRequest = req.xhr || req.headers.accept.includes('application/json');

        if (search) {
            query.productName = { $regex: search, $options: "i" }
        }

        if (["normal", "sports", "luxury"].includes(categorys)) {
            const category = await categorySchema.findOne({
                name: categorys.toUpperCase(),
                isDeleted: false,
            });

            if (category) {
                query.category = category._id;
            }
        }

        console.log("This is my query", query);


        switch (filter) {
            case "newArrivals":
                sortOptions = { createdAt: -1 };
                limit = 4;
                break;
            case "A-to-Z":
                sortOptions = { productName: 1 };
                break;
            case "Z-to-A":
                sortOptions = { productName: -1 };
                break;
            case "lowest-high":
                sortOptions = { regularPrice: 1 };
                break;
            case "high-low":
                sortOptions = { regularPrice: -1 };
                break;
        }


        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

        console.log(totalPages, "total pages");



        const products = await Product.find(query)
            .populate({
                path: "category",
                populate: {
                    path: "categoryoffer",
                    select: "discount"
                }
            })
            .populate("productoffer", "discount")
            .sort(sortOptions)
            .skip(skip)
            .limit(limit);

        console.log("Productsssssssssssssssssssqqqqqqq", products);


        if (isAjaxRequest) {
            return res.json({
                products,
                currentPage: page,
                totalPages,
            });
        }

        // **Render Page for Normal Requests**
        res.render("user/shop", {
            title: "TOKYO CARS",
            layout: "layouts/user_layout",
            user: req.session.Userdata,
            products,
            currentPage: page,
            totalPages,
            filter,
            wishlist_length
        });
    } catch (error) {
        console.error(error);
        if (req.xhr) {
            return res.status(500).json({ error: "Internal Server Error" });
        }
        res.status(500).send("Internal Server Error");
    }
};


exports.singleproduct = async (req, res) => {
    try {

        const id = req.params.id;

        const products = await Product.findById({ _id: id }).populate({
            path: "category",
            populate: {
                path: "categoryoffer",
                select: "discount"
            }
        }).populate("productoffer", "discount")

        const product = await Product.find().limit(3).populate("category", "name");


        let user = req.session.Userdata;

        let productOffer = products?.productOffer;

        console.log("productOffer", productOffer);


        let categoryOffer = products?.categoryofferprice === undefined ? 0 : products?.categoryofferprice;

        console.log("categoryOffer", categoryOffer);

        let productdiscount = products?.productoffer?.discount === undefined ? 0 : products?.productoffer?.discount;

        let categorydiscount = products?.category?.categoryoffer?.discount === undefined ? 0 : products?.category?.categoryoffer?.discount;


        console.log("categorydiscount", categorydiscount);

        console.log("productdiscount", productdiscount);



        let percentage = Math.max(productdiscount, categorydiscount);





        let offerPrice = 0;

        if (productOffer > 0 && categoryOffer > 0) {
            offerPrice = Math.min(productOffer, categoryOffer);
        } else if (productOffer > 0) {
            offerPrice = productOffer;
        } else if (categoryOffer > 0) {
            offerPrice = categoryOffer;
        }

        console.log("offerPraceqqqqqqqqqqqqqqqqqqqq", offerPrice);



        let wishlist_length = 0;


        const wishlist = await wishlistSchema.findOne({ userId: user._id });

        if (wishlist) {
            wishlist_length = wishlist.items.length;
        }

        if (!products) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.render("user/singleproducts", {
            title: "TOKYO CARS",
            layout: "layouts/user_layout",
            user,
            products,
            product,
            wishlist_length,
            offerPrice,
            percentage
        })



    } catch (error) {

        console.log(error);

    }
}

exports.profile = async (req, res) => {

    const user = req.session.Userdata;
    console.log("This is my user", user);

    const userprofile = await userSchema.findById(user?._id);

    res.render("user/profile", {
        title: "TOKYO CARS",
        layout: "layouts/user_profile_layout",
        user,
        userprofile
    })
}

exports.address = async (req, res) => {
    const user = req.session.Userdata;

    const address = await addressSchema.find({ userId: user?._id, isDeleted: false });

    const userprofile = await userSchema.findById(user._id);

    console.log("this is my addreessssssoooooooo", userprofile);


    console.log("This is my address", address);

    res.render("user/address", {
        title: "TOKYO CARS",
        layout: "layouts/user_profile_layout",
        user,
        address,
        userprofile
    });
}

exports.order = async (req, res) => {
    const user = req.session.Userdata;
    console.log("This is my useriddddddddd", user);

    const userprofile = await userSchema.findById(user._id);

    const orders = await orderSchema.find({ user: user?._id }).sort({ orderDate: -1 }).populate("items.product").populate("address");
    console.log("This is my orders", orders);

    res.render("user/order", {
        title: "TOKYO CARS",
        layout: "layouts/user_profile_layout",
        user,
        orders,
        userprofile
    });
}

exports.orderdetails = async (req, res) => {
    const user = req.session.Userdata;
    const userprofile = await userSchema.findById(user._id);
    const id = req.params.id;
    console.log("This is my order id", id);

    let discountPrice = 0;

    const order = await orderSchema.findById(id).populate("items.product").populate("address");




    for (let item of order.items) {
        if (item.discount) {
            discountPrice += item.discount;
        }
    }

    console.log("discountPrice", discountPrice);


    order.items = Array.isArray(order.items) ? order.items : [];


    const delivered = order.items.some((item) => item.orderStatus == 'Delivered');

    console.log("This is the delivered product", delivered);


    res.render("user/orderdetails", {
        title: "TOKYO CARS",
        layout: "layouts/user_profile_layout",
        user,
        order,
        discountPrice,
        delivered,
        userprofile
    });
}

exports.reset_password = (req, res) => {
    const user = req.session.Userdata;
    res.render("user/resetpassword", {
        title: "TOKYO CARS",
        layout: false,
        user,
    });
}

exports.reset_otp = (req, res) => {
    const user = req.session.Userdata;
    res.render("user/reset-otp", {
        title: "TOKYO CARS",
        layout: false,
        user
    });
}

exports.new_password = (req, res) => {
    const user = req.session.Userdata;
    res.render("user/new-password", {
        title: "TOKYO CARS",
        layout: false,
        user
    });
}


exports.checkout = async (req, res) => {

    console.log("check out page is calledddddd");

    const user = req.session.Userdata;
    const cart = await cartSchema.find({ user: user?._id }).populate('items.product');

    console.log("and this is the product caaart", cart);


    if (!cart || cart.length === 0) {
        console.log("Cart is empty");

        return res.redirect("/cart");
    }

    const hasBlockedProduct = cart[0]?.items.some(item => item.product.isBlocked);

    const productquantitycheck = cart[0]?.items.find(item => item.product.stock < item.quantity)

    if (productquantitycheck) {
        return res.redirect('/cart')
    }

    console.log("this is the quantitycheck ", productquantitycheck);


    if (hasBlockedProduct) {

        return res.redirect("/cart");
    }

    const outofstock = cart[0]?.items.some(item => item.product.stock == 0);

    if (outofstock) {
        return res.redirect("/cart");
    }

    let wishlist_length = 0;

    const coupon = await couponSchema.find();

    const wishlist = await wishlistSchema.findOne({ userId: user._id });

    if (wishlist) {
        wishlist_length = wishlist.items.length;
    }


    let totalAmount = 0;



    cart[0]?.items.forEach(item => {

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
    });

    const address = await addressSchema.find({ userId: user?._id, isDeleted: false });
    res.render("user/checkout", {
        title: "TOKYO CARS",
        layout: false,
        user,
        address,
        cart,
        totalAmount,
        wishlist_length,
        coupon
    });

}

exports.reset_password_post = async (req, res) => {
    try {
        const { email } = req.body;
        const errors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email === "") {
            errors.email_error = "All fields are required";
            req.flash("errors", errors);
            return res.redirect("/reset-password");
        }

        if (!emailRegex.test(email)) {
            errors.email_error = "Invalid email format";
            req.flash("errors", errors);
            return res.redirect("/reset-password");
        }

        const user = await userSchema.findOne({ email });

        if (!user) {
            errors.email_error = "User not found";
            req.flash("errors", errors);
            return res.redirect("/reset-password");
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        console.log("OTP SENT", otp);

        const emailSent = await sendEmail(email, otp);


        const otpData = new otpSchema({
            userId: user._id,
            otp
        });

        await otpData.save();

        req.session.Userdata = user;




        if (!emailSent) {
            res.status(500).send("Failed to send email");
            return;
        }

        res.redirect("/reset-otp");

    } catch (error) {
        console.log("Reset password error", error);
        res.redirect("/pageNotFound");
    }
}



exports.reset_verify_otp = async (req, res) => {
    try {

        console.log("Reset otp post request received");

        const { otp } = req.body;

        const user = req.session.Userdata;

        const storedOtp = await otpSchema.findOne({ userId: user._id });

        console.log("Stored otp", storedOtp);

        console.log("Session user", user);



        if (storedOtp == null) {
            res.status(400).json({ success: false, message: "Invalid OTP" });
            return;
        }

        if (otp.length !== 6) {
            res.status(400).json({ success: false, message: "Please enter a valid OTP" });
            return;
        }

        if (storedOtp.otp !== otp) {
            res.status(400).json({ success: false, message: "Invalid OTP" });
            return;
        }

        if (storedOtp.otp === otp && storedOtp.userId.toString() === user._id.toString()) {

            console.log("Otp verified successfully");


            res.json({ success: true, redirectUrl: "/new-password" });
        } else {
            res.status(400).json({ success: false, message: " Please resend OTP and try again" });
        }

    } catch (error) {
        console.log("Reset verify otp error", error);
        res.status(500).json({ success: false, message: "Please try again later" });
    }


}

exports.reset_resend_otp = async (req, res) => {
    console.log("Resend otp request received");


    const users = req.session.Userdata;

    console.log("This is my users", users);

    const { email, _id } = users;


    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    console.log(" Reset Resend otp", otp);


    const emailSent = sendEmail(email, otp);

    if (!emailSent) {
        res.status(500).json({ success: false, message: "Resend otp error. Please try again" });
        return;
    }

    const otpData = new otpSchema({
        userId: _id,
        otp
    });

    await otpData.save();

    res.json({ success: true, message: "OTP resent successfully" });


}


exports.new_password_post = async (req, res) => {

    try {
        const { password, confirm_password } = req.body;

        const user = req.session.Userdata;

        console.log("This is my user", user);


        password_regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        const errors = {};

        if (password === "") {
            errors.password_error = " Password fields are required";
        } else if (!password_regex.test(password)) {

            errors.password_error = "Password must contain at least one letter, one number, and one special character no spaces";

        } else if (password.length <= 8) {
            errors.password_error = "Password must be at least 8 characters long";
        }

        if (password !== confirm_password) {
            errors.confirm_password_error = "Both password not match";
        } else if (confirm_password === "") {

            errors.confirm_password_error = "confirm password required";

        }

        if (Object.keys(errors).length > 0) {
            req.flash("errors", errors);
            return res.redirect("/user-new-password");
        }




        console.log("This is my user", user);


        const hashedPassword = await bcrypt.hash(password, 10);

        console.log("Hashed password", hashedPassword);


        const userData = await userSchema.findByIdAndUpdate(user._id, { password: hashedPassword });

        req.session.Userdata = userData;

        console.log("Password updated successfully");

        req.session.destroy();

        res.redirect("/login");

    } catch (error) {

        console.log('Server error', error);
        res.json({ success: false, message: 'Internal server error' });

    }

}


exports.profile_update = async (req, res) => {

    try {

        const id = req.params.id;

        const { username, phone } = req.body;

        const errors = {};

        const numberSpaceRegex = /^[0-9 ]+$/;

        const phoneRegex = /^[0-9]+$/;

        if (username === "") {
            errors.username_error = " Username required";
        } else if (numberSpaceRegex.test(username)) {
            errors.username_error = "User name must be alphabets charecter";
        }


        if (phone) {

            if (!phoneRegex.test(phone)) {

                errors.phone_error = "Phone number must be numeric";

            } else if (phone === "") {
                errors.phone_error = "Phone number required";
            } else if (phone.length > 10) {
                errors.phone_error = "Phone number should not exceed 10 digits";
            }

        }

        if (Object.keys(errors).length > 0) {
            req.flash("errors", errors);
            return res.redirect("/profile");
        }

        const user = await userSchema.findByIdAndUpdate(id, { username, phone });

        await user.save();

        console.log("Profile updated successfully");
        req.flash("success", "Profile updated successfully");
        res.redirect("/profile");


    } catch (error) {
        console.log("Profile update error", error);
    }
}

exports.place_order = async (req, res) => {

    try {
        console.log("Place order request received");


        const { selectedAddress, cartId, PayableAmount, paymentMethod, SubtotalAmount, couponId } = req.body;
        console.log('coupon id', couponId);


        const carts = await cartSchema.findById(cartId).populate("items.product");



        const productBlock = carts.items.some(item => item.product.isBlocked);

        const outofstock = carts.items.some(item => item.product.stock == 0);

        console.log("yessssssssssssssssssssssssssssssssssssss", productBlock);

        console.log("outttttttttttttttttttt", outofstock);

        const productquantitycheck = carts.items.some(item => item.product.stock < item.quantity)

        console.log("this is quantity less than productoooooo ", productquantitycheck);


        if (productquantitycheck) {

            console.log("and  is itttttttttt worrrrrrkoooooo");

            return res.status(200).json({ success: false, message: ` product quantity less than stock` })
        }


        if (productBlock) {

            return res.status(200).json({ success: false, message: "Poduct is Not Awailable" })
        }


        if (outofstock) {
            return res.status(200).json({ success: false, message: "Product is out of Stock" });
        }



        if (paymentMethod == "Cash on Delivery" && 5000 < PayableAmount) {

            return res.status(400).json({ success: false, message: "1000 Above not Allowed Cash on delivery" });

        }


        if (paymentMethod === "Wallet") {

            const user = req.session.Userdata;

            const wallet = await walletSchema.findOne({ user: user._id });

            if (!wallet) {
                res.status(400).json({ success: false, message: "Wallet not found" });
                return;
            }

            console.log("this is my wallet", wallet);

            console.log("this is my wallet balance", wallet.balance);


            if (wallet.balance < PayableAmount) {
                res.status(400).json({ success: false, message: "Insufficient balance in wallet" });
                return;
            }

            wallet.balance -= PayableAmount;

            wallet.wallet_history.push({
                amount: PayableAmount,
                transactionType: "Debited",
                date: new Date(),
                discription: "Order Placed Successfully"
            })


            await wallet.save();
        }



        console.log("this is my boadysssssss", req.body);


        let shippingCharges = 40;

        let orderItems = [];

        const address = await addressSchema.findById(selectedAddress);

        if (!address) {
            res.status(400).json({ success: false, message: "Address not found" });
            return;
        }

        const coupon = couponId && await couponSchema.findById(couponId);


        const payableAmount = coupon ? PayableAmount : Number(SubtotalAmount) + shippingCharges;

        console.log("this is my coupon", coupon);


        let cart = await cartSchema.findById(cartId);


        if (!cart) {
            res.status(400).json({ success: false, message: "Cart not found" });
            return;
        }

        const productsIds = cart.items.map(item => item.product);

        console.log("This is my products ids", productsIds);

        const products = await Product.find({ _id: { $in: productsIds } });

        console.log("This is my productskooooi", products);


        for (const product of products) {
            if (product.isBlocked) {
                res.status(400).json({ success: false, message: "Product is blocked" });
                return;
            }
        }


        for (let item of cart.items) {


            if (item.length == 0) {
                res.status(400).json({ success: false, message: "Cart is empty" });
            }


            console.log("This is my itemshooooossss", item);

            const product = products.find(product => product._id.toString() === item.product.toString());


            if (!product) {
                console.log("Product not found");

                res.status(400).json({ success: false, message: "Product not found" });
                return;
            }
        }


        for (const product of products) {
            let discount = 0;
            if (product.stock < cart.items.find(item => item.product.toString() === product._id.toString()).quantity) {
                res.status(400).json({ success: false, message: "Product out of stocks " });
                return;
            } else {
                product.stock = Math.max(0, product.stock - cart.items.find(item => item.product.toString() === product._id.toString()).quantity);
            }


            if (coupon && coupon.expiryDate > new Date()) {


                const offerPrice = (() => {
                    const productOffer = typeof product.productOffer === "number" && !isNaN(product.productOffer)
                        ? product.productOffer
                        : 0;
                    const categoryOffer = typeof product.categoryofferprice === "number" && !isNaN(product.categoryofferprice)
                        ? product.categoryofferprice
                        : 0;


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


                const regularPrice = product.regularPrice;

                if (offerPrice > 0) {

                    discount = coupon ? offerPrice * cart.items.find(item => item.product.toString() === product._id.toString()).quantity * (coupon.discount / 100) : 0;
                } else {

                    discount = coupon ? regularPrice * cart.items.find(item => item.product.toString() === product._id.toString()).quantity * (coupon.discount / 100) : 0;
                }

                console.log("Discount:", discount);


            }


            const offerPrice = (() => {
                const productOffer = typeof product.productOffer === "number" && !isNaN(product.productOffer)
                    ? product.productOffer
                    : 0;
                const categoryOffer = typeof product.categoryofferprice === "number" && !isNaN(product.categoryofferprice)
                    ? product.categoryofferprice
                    : 0;


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

            console.log("discoooooooooo", discount);

            console.log("offer price", offerPrice);



            orderItems.push({
                product: product._id,
                quantity: cart.items.find(item => item.product.toString() === product._id.toString()).quantity,
                price: offerPrice || product.regularPrice,
                discount: discount,
                productImage: product.productImage[0],
                productTitle: product.productName

            });

            await product.save();


        }

        function generateOrderId() {
            const randomNumbers = Math.floor(100000 + Math.random() * 900000);

            return `ORD-${randomNumbers}`;
        }

        const orderId = generateOrderId();
        console.log("Generated Order ID:", orderId);

        const order = new orderSchema({
            couponId: couponId ? couponId : null,
            OrderId: orderId,
            user: req.session.Userdata._id,
            address: selectedAddress,
            orderDate: new Date(),
            items: orderItems,
            totalAmount: SubtotalAmount,
            payableAmount: payableAmount,
            paymentMethod,
            shippingCharge: shippingCharges
        });

        await order.save();

        await cartSchema.findByIdAndDelete(cartId);

        console.log("Order placed successfully");

        res.status(200).json({ success: true, message: "Order placed successfully", redirectUrl: "/order-success" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }

}

exports.order_success = async (req, res) => {
    try {
        const order = await orderSchema.findOne({ user: req.session.Userdata._id });
        const user = req.session.Userdata;
        console.log("Order success request received");
        res.render("user/ordersucces", {
            layout: false,
            user,
            order

        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.cancel_order = async (req, res) => {
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


                    console.log("lengthhhhhhhhhh", product.length);



                    const refundedAmount = product.price * product.quantity - product.discount;

                    console.log("this is the refunded amount", refundedAmount);


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

exports.profile_reset = async (req, res) => {
    const user = req.session.Userdata;

    const userprofile = await userSchema.findById(user._id);

    res.render("user/profile_reset", {
        title: "TOKYO CARS",
        layout: "layouts/user_profile_layout",
        user,
        userprofile
    })
}

exports.profile_reset_otp = async (req, res) => {
    const user = req.session.Userdata;
    const userprofile = await userSchema.findById(user._id);
    res.render("user/profile_otp", {
        title: "TOKYO CARS",
        layout: "layouts/user_profile_layout",
        user,
        userprofile
    })
}

exports.profile_new_password = async (req, res) => {
    const user = req.session.Userdata;
    const userprofile = await userSchema.findById(user._id);
    res.render("user/profile-newpassword", {
        title: "TOKYO CARS",
        layout: "layouts/user_profile_layout",
        user,
        userprofile
    })
}

exports.wallet = async (req, res) => {

    try {

        user = req.session.Userdata;

        const userprofile = await userSchema.findById(user._id);


        const objectId = new mongoose.Types.ObjectId(user._id);

        const wallets = await walletSchema.aggregate([{

            $match: {
                user: objectId
            },
        },


        { $unwind: "$wallet_history" },

        {
            $sort: { "wallet_history.date": -1 }
        }

        ])


        console.log("This is my walletsssssssssss", wallets);

        res.render("user/wallet", {
            title: "Tokyo Cars Wallet",
            layout: "layouts/user_profile_layout",
            user,
            wallets,
            userprofile
        })

    } catch (error) {
        console.log("Wallet page rendering ", error)
    }

}


exports.profile_reset_post = async (req, res) => {

    try {
        const { email } = req.body;
        const errors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (!emailRegex.test(email)) {
            errors.email_error = "Invalid email format";
            req.flash("errors", errors);
            return res.redirect("/profile-reset");
        }

        const user = await userSchema.findOne({ email });

        if (!user) {
            errors.email_error = "User not found";
            req.flash("errors", errors);
            return res.redirect("/profile-reset");
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        console.log("OTP SENT FIRST", otp);

        const emailSent = await sendEmail(email, otp);


        const otpData = await new otpSchema({
            userId: user._id,
            otp,
            email
        });

        try {
            await otpData.save();

            console.log("OTP saved successfully");

        } catch (error) {
            console.log("Error saving OTP", error);
        }

        req.session.Userdata = user;




        if (!emailSent) {
            res.status(500).send("Failed to send email");
            return;
        }

        res.redirect("/profile-reset-otp");

    } catch (error) {
        console.log("Reset password error", error);
        res.redirect("/pageNotFound");
    }

}


exports.profile_reset_verify_otp = async (req, res) => {
    try {

        console.log("Reset otp post request received");

        const { otp } = req.body;

        const user = req.session.Userdata;

        const storedOtp = await otpSchema.findOne({ userId: user._id });

        console.log("Stored otp", storedOtp);

        console.log("Session user", user);



        if (storedOtp == null) {
            res.status(400).json({ success: false, message: "Invalid OTP" });
            return;
        }

        if (otp.length !== 6) {
            res.status(400).json({ success: false, message: "Please enter a valid OTP" });
            return;
        }

        if (storedOtp.otp !== otp) {
            res.status(400).json({ success: false, message: "Invalid OTP" });
            return;
        }

        if (storedOtp.otp === otp && storedOtp.userId.toString() === user._id.toString()) {

            console.log("Otp verified successfully");


            res.json({ success: true, redirectUrl: "/profile-new-password" });
        } else {
            res.status(400).json({ success: false, message: " Please resend OTP and try again" });
        }

    } catch (error) {
        console.log("Reset verify otp error", error);
        res.status(500).json({ success: false, message: "Please try again later" });
    }
}

exports.profile_reset_resend_otp = async (req, res) => {
    console.log("Resend otp request received");


    const users = req.session.Userdata;

    console.log("This is my users", users);

    const { email, _id } = users;


    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    console.log(" Reset Resend otp", otp);


    const emailSent = sendEmail(email, otp);

    if (!emailSent) {
        res.status(500).json({ success: false, message: "Resend otp error. Please try again" });
        return;
    }

    const otpData = new otpSchema({
        userId: _id,
        otp
    });

    await otpData.save();

    res.json({ success: true, message: "OTP resent successfully" });
}


exports.profile_new_password_post = async (req, res) => {

    try {
        const { password } = req.body;

        const user = req.session.Userdata;

        console.log("This is my user", user);


        const hashedPassword = await bcrypt.hash(password, 10);

        console.log("Hashed password", hashedPassword);


        const userData = await userSchema.findByIdAndUpdate(user._id, { password: hashedPassword });

        req.session.Userdata = userData;

        console.log("Password updated successfully");

        req.flash("success", "Password updated successfully");
        res.redirect("/profile");

    } catch (error) {

        console.log('Server error', error);
        res.json({ success: false, message: 'Internal server error' });

    }
}


exports.logout = ((req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).json({ success: false, message: "Logout failed" });
        }
        return res.status(200).json({ success: true, message: "Logged out successfully" });
    });
});

exports.wishlist = async (req, res) => {
    const user = req.session.Userdata;

    const users = await userSchema.findById(user._id);

    if (!users) {
        return res.status(404).json({ success: false, message: "User not found" });
    }


    let wishlist_length = 0;

    let wishlist = await wishlistSchema.findOne({ userId: user._id }).populate("items.product");

    if (!wishlist) {
        wishlist = { items: [] }
    }
    wishlist_length = wishlist.items.length;


    console.log("wishlist_length", wishlist_length);


    req.session.Userdata = users;


    console.log("This is wishlist ");

    res.render("user/wishlist", {
        title: "Tokyo Cars",
        layout: "layouts/user_layout",
        user,
        wishlist_length,
        wishlist: wishlist || { items: [] },
    })
}


exports.add_to_wishlist = async (req, res) => {

    console.log("Add to wishlist request received");

    const { productId } = req.body;

    console.log("Product Id", productId);

    const user = req.session.Userdata;
    try {
        const product = await Product.findById(productId);

        console.log("Product", product);

        if (!product) {
            return res.status(200).json({ success: false, message: "Product not found" });
        }
        let wishlist = await wishlistSchema.findOne({ userId: user._id });
        if (!wishlist) {
            wishlist = new wishlistSchema({
                userId: user._id,
                items: [{ product: productId }]
            });
        } else {
            const item = wishlist.items.find(item => item.product.toString() === product._id.toString());
            if (item) {
                console.log("called the message");

                return res.status(200).json({ success: false, message: "Product already in wishlist" });


            }
            wishlist.items.push({ product: productId });

        }

        await wishlist.save();

        console.log("Product added to wishlist successfully");

        return res.status(200).json({ success: true, message: "Product added to wishlist successfully" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }


}


exports.removeFromWishlist = async (req, res) => {

    console.log("Remove from wishlist request received");


    const { productId } = req.body;

    console.log("Product Id", productId);

    const user = req.session.Userdata;

    console.log("This is my user", user);


    const product = await Product.findById(productId);

    if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
    }

    const wishlist = await wishlistSchema.findOne({ userId: user?._id });

    if (!wishlist) {
        return res.status(404).json({ success: false, message: "Wishlist not found" });
    }

    const items = wishlist.items.filter(item => item.product._id.toString() == product._id.toString());

    if (items.length == 0) {
        return res.status(404).json({ success: false, message: "Item not found in wishlist" });
    }

    wishlist.items.pull({ product: productId });

    await wishlist.save();

    return res.status(200).json({ success: true, message: "Item removed from wishlist" });
}



exports.returnOrder = async (req, res) => {

    console.log("This is the return order rauter");

    const user = req.session.Userdata;

    console.log("This is my user", user);


    console.log("boadyyyyy", req.body);

    const { orderId, productId, message } = req.body;



    const order = await orderSchema.findById(orderId).populate("items.product");


    if (!order) {
        res.status(404).json({ success: false, message: ' Order is not found ' })
    }

    const product = await Product.findById(productId);

    if (!product) {
        res.status(404).json({ success: false, message: 'Product is not found ' });

    }

    let wallet = await walletSchema.findOne({ user: user._id })

    console.log("This is user walletssssssa ", wallet);

    if (!wallet) {
        wallet = new walletSchema({
            user: user._id,
            balance: 0,
            wallet_history: []
        })
    }



    for (let value of order.items) {
        if (value.product._id.toString() === product._id.toString()) {

            console.log("This is the insideeeeeeeee");


            value.isReturnRequested = true;

            value.reasonofReturn = message;

            const refundedAmount = value.price * value.quantity - value.discount;

            console.log("This is my refunded amount", refundedAmount);


            wallet.balance += refundedAmount;


            wallet.wallet_history.push({
                date: new Date(),
                amount: refundedAmount,
                discription: "Order Return Money Credited",
                transactionType: "Credited"
            })


            console.log("Product returned successfully");


        }
    }


    console.log("This is my wallet ", wallet);




    await wallet.save();


    console.log("Confirmmmmmmm");



    await order.save();

    res.status(200).json({ success: true, message: 'Return Requested ' });



}


// CREATE RAZORPAY ORDER 



const validateCart = async (cartId) => {
    const cart = await cartSchema.findById(cartId).populate("items.product");
    if (!cart) throw new Error("Cart not found");

    const issues = [];
    cart.items.forEach(item => {
        if (item.product.stock < item.quantity) {
            issues.push(`${item.product.productName} has insufficient stock (${item.product.stock} available)`);
        }
        if (item.product.isBlocked) {
            issues.push(`${item.product.productName} is not available and cannot be purchased`);
        }
        if (item.product.stock === 0) {
            issues.push(`${item.product.productName} is out of stock`);
        }
    });

    if (issues.length > 0) {
        throw new Error(`Cart validation failed: ${issues.join(", ")}`);
    }

    return cart;
};

const validateOrder = async (orderId) => {
    const order = await orderSchema.findById(orderId).populate("items.product");
    if (!order) throw new Error("Order not found");

    const issues = [];
    order.items.forEach(item => {
        if (item.product.stock === 0) {
            issues.push(`${item.product.productName} is out of stock`);
        } else if (item.product.stock < item.quantity) {
            issues.push(`${item.product.productName} has insufficient stock (${item.product.stock} available)`);
        }
    });

    if (issues.length > 0) {
        throw new Error(`Order validation failed: ${issues.join(", ")}`);
    }

    return order;
};


const calculatePayableAmount = (SubtotalAmount, coupon, shippingCharges, payableAmount) => {
    return coupon ? payableAmount : Number(SubtotalAmount) + shippingCharges;
};



const createRazorpayOrder = async (amount) => {
    try {
        const razorpayOrder = await razorpayInstance.orders.create({
            amount: amount * 100,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        });
        return razorpayOrder;
    } catch (error) {
        console.error("Razorpay order creation failed:", error);
        throw new Error("Failed to create Razorpay order");
    }
};


exports.razorpay = async (req, res) => {
    try {
        console.log("Place order request received");

        const { cartId, PayableAmount, SubtotalAmount, couponId, orderId } = req.body;
        const shippingCharges = 40;

        const coupon = couponId && await couponSchema.findById(couponId);

        let validatedData;
        if (cartId) {
            validatedData = await validateCart(cartId);
        } else if (orderId) {
            validatedData = await validateOrder(orderId);
        } else {
            return res.status(400).json({ success: false, message: "Either cartId or orderId is required" });
        }

        const payableAmount = calculatePayableAmount(SubtotalAmount, coupon, shippingCharges, PayableAmount);

        const razorpayOrder = await createRazorpayOrder(payableAmount);

        console.log("Razorpay order created:", razorpayOrder);

        return res.status(200).json({
            success: true,
            message: 'Razorpay order created successfully',
            razorpayOrderId: razorpayOrder.id,
            payableAmount: payableAmount,
        });

    } catch (error) {
        console.error("Error in Razorpay route:", error.message);
        return res.status(error.message.includes("not found") ? 404 : 500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};


// RAZORPAY CREATE ORDER END 

exports.veryfy_razorpay_payment = async (req, res) => {

    try {

        const { formData, failed } = req.body;

        console.log("this is my boadyyyyyyyyyyyy", req.body);



        console.log("Verify Razorpay payment request received", failed);


        const { selectedAddress, cartId, PayableAmount, paymentMethod, SubtotalAmount, couponId } = formData;



        console.log('coupon id', couponId);


        let shippingCharges = 40;

        let orderItems = [];

        const address = await addressSchema.findById(selectedAddress);

        if (!address) {
            res.status(400).json({ success: false, message: "Address not found" });
            return;
        }

        const coupon = couponId && await couponSchema.findById(couponId);


        const payableAmount = coupon ? PayableAmount : Number(SubtotalAmount) + shippingCharges;

        console.log("this is my coupon", coupon);


        let cart = await cartSchema.findById(cartId);


        if (!cart) {
            res.status(400).json({ success: false, message: "Cart not found" });
            return;
        }

        const productsIds = cart.items.map(item => item.product);

        console.log("This is my products ids", productsIds);

        const products = await Product.find({ _id: { $in: productsIds } });

        console.log("This is my productskooooi", products);


        for (const product of products) {
            if (product.isBlocked) {
                res.status(400).json({ success: false, message: "Product is blocked" });
                return;
            }
        }


        for (let item of cart.items) {


            if (item.length == 0) {
                res.status(400).json({ success: false, message: "Cart is empty" });
            }


            console.log("This is my itemshooooossss", item);

            const product = products.find(product => product._id.toString() === item.product.toString());


            if (!product) {
                console.log("Product not found");

                res.status(400).json({ success: false, message: "Product not found" });
                return;
            }
        }


        for (const product of products) {
            let discount = 0;
            if (product.stock < cart.items.find(item => item.product.toString() === product._id.toString()).quantity) {
                res.status(400).json({ success: false, message: "Product out of stocks " });
                return;
            } else if (!failed) {
                product.stock = Math.max(0, product.stock - cart.items.find(item => item.product.toString() === product._id.toString()).quantity);
            }


            if (coupon && coupon.expiryDate > new Date()) {


                const offerPrice = (() => {
                    const productOffer = typeof product.productOffer === "number" && !isNaN(product.productOffer)
                        ? product.productOffer
                        : 0;
                    const categoryOffer = typeof product.categoryofferprice === "number" && !isNaN(product.categoryofferprice)
                        ? product.categoryofferprice
                        : 0;


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


                const regularPrice = product.regularPrice;

                if (offerPrice > 0) {

                    discount = coupon ? offerPrice * cart.items.find(item => item.product.toString() === product._id.toString()).quantity * (coupon.discount / 100) : 0;
                } else {

                    discount = coupon ? regularPrice * cart.items.find(item => item.product.toString() === product._id.toString()).quantity * (coupon.discount / 100) : 0;
                }

                console.log("Discount:", discount);


            }


            const offerPrice = (() => {
                const productOffer = typeof product.productOffer === "number" && !isNaN(product.productOffer)
                    ? product.productOffer
                    : 0;
                const categoryOffer = typeof product.categoryofferprice === "number" && !isNaN(product.categoryofferprice)
                    ? product.categoryofferprice
                    : 0;


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

            console.log("discoooooooooo", discount);

            console.log("offer price", offerPrice);



            orderItems.push({
                product: product._id,
                quantity: cart.items.find(item => item.product.toString() === product._id.toString()).quantity,
                price: offerPrice || product.regularPrice,
                discount: discount,
                productImage: product.productImage[0],
                productTitle: product.productName,
                PaymentStatus: failed ? 'Failed' : 'Paid'

            });

            await product.save();


        }

        function generateOrderId() {
            const randomNumbers = Math.floor(100000 + Math.random() * 900000);

            return `ORD-${randomNumbers}`;
        }

        const orderId = generateOrderId();
        console.log("Generated Order ID:", orderId);


        const order = new orderSchema({
            couponId: couponId ? couponId : null,
            OrderId: orderId,
            user: req.session.Userdata._id,
            address: selectedAddress,
            orderDate: new Date(),
            items: orderItems,
            totalAmount: SubtotalAmount,
            payableAmount: payableAmount,
            paymentMethod,
            shippingCharge: shippingCharges
        });

        await order.save();

        await cartSchema.findByIdAndDelete(cartId);

        console.log("Order placed successfully");

        if (failed) {
            return res.status(400).json({ success: false, message: "Your Payments Failed!" });
        }

        res.status(200).json({ success: true, message: "Order placed successfully", redirectUrl: "/order-success" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}



exports.invoice = async (req, res) => {
    try {


        console.log("Router calllelelelelelellelele");


        const user = req.session.userData;

        const orderId = req.params.id;

        console.log("This is the order id", orderId);



        const order = await orderSchema.aggregate([
    
            { $match: { _id: new mongoose.Types.ObjectId(orderId) } },
          
            {
              $lookup: {
                from: "addresses", 
                localField: "address", 
                foreignField: "_id", 
                as: "address" 
              }
            },
            { $unwind: "$address" }, 
          

            {
              $lookup: {
                from: "users", 
                localField: "user", 
                foreignField: "_id", 
                as: "user" 
              }
            },
            { $unwind: "$user" }, 
          
            { $unwind: "$items" },
          
            { $match: { "items.orderStatus": "Delivered" } },
          
            {
              $addFields: {
                "items.totalPrice": {
                  $subtract: [
                    { $multiply: ["$items.price", "$items.quantity"] }, 
                    "$items.discount" 
                  ]
                }
              }
            },
          
            {
              $group: {
                _id: "$_id", 
                deliveredProducts: { $push: "$items" }, 
                totalAmountOfDeliveredProducts: { $sum: "$items.totalPrice" }, 
                address: { $first: "$address" }, 
                user: { $first: "$user" },
                invoice: { $first: "$Invoice"},
                orderDate: { $first: "$orderDate" }
              }
            },
    
            {
              $project: {
                _id: 0, 
                deliveredProducts: 1,
                totalAmountOfDeliveredProducts: 1,
                address: 1, 
                user: 1 ,
                invoice : 1,
                orderDate:1
              }
            }
          ]);


      console.log("this is my orderrrrrrrrrr",order);

        res.render("user/invoice", {
            title: "Invoice",
            layout: false,
            user,
            order
        })

    } catch (error) {
        console.log("This is my invoice", error);

    }
}


exports.repayment = async (req, res) => {
    try {

        const { orderId } = req.body;

        const order = await orderSchema.findOneAndUpdate(
            { _id: orderId },
            {
                $set: { "items.$[].PaymentStatus": "Paid" }
            },
            { new: true }
        );

        const productsIds = order.items.map(item => item.product);

        const products = await Product.find({ _id: { $in: productsIds } });


        console.log("this is my product idsss", products);



        for (let product of products) {
            if (product.stock < order.items.find(item => item.product.toString() === product._id.toString()).quantity) {
                res.status(400).json({ success: false, message: "Product out of stocks " });
                return;
            } else {
                product.stock = Math.max(0, product.stock - order.items.find(item => item.product.toString() === product._id.toString()).quantity);

                console.log("afteeerrrrrrrr", product.stock);

            }

            await product.save();
        }

        console.log("Payment successfully");

        res.status(200).json({ success: true, message: "Payment Successfully" })


    } catch (error) {

    }
}

