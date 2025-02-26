const express = require("express");
const user_router = express();
const user_controller = require("../controller/user/user_controller");
const cart_controller = require("../controller/user/cart_controller");
const address_controller = require("../controller/user/address_controller");
const product_controller = require("../controller/user/product_controller");
const coupon_controller = require("../controller/user/coupon_controller");
const passport = require("passport");
const { user_auth , login_auth , user_block , signup_auth } = require("../middleware/auth");


user_router.get('/', user_block, user_controller.userhome);

user_router.get('/login', login_auth , user_controller.login);

user_router.post('/login',  user_controller.userlogin);

user_router.get('/signup', signup_auth, user_controller.signup);

user_router.post('/signup', user_controller.user_register);

user_router.get('/pageNotFound', login_auth, user_controller.pageNotFound);

user_router.get('/verify-otp',   user_controller.signupotp);

user_router.post('/verify-otp', user_controller.verify_otp);

user_router.post('/resend-otp', user_controller.resend_otp);

user_router.get('/blog',   user_controller.blog);

user_router.get('/about',  user_controller.about);

user_router.get('/contact', user_controller.contact);

user_router.get('/shop', user_block ,user_controller.shop);

user_router.get('/singleproduct/:id', user_block, user_controller.singleproduct);

user_router.get('/profile', user_block, user_controller.profile);

user_router.get('/address', user_block, user_controller.address);

user_router.get('/order', user_block, user_controller.order);

user_router.get('/orderdetails/:id',  user_block ,  user_controller.orderdetails);

user_router.get('/reset-password',  user_controller.reset_password);

user_router.post('/reset-password', user_controller.reset_password_post);

user_router.get('/reset-otp', user_controller.reset_otp);

user_router.post('/reset-otp', user_controller.reset_verify_otp);

user_router.post('/reset-resend-otp', user_controller.reset_resend_otp);

user_router.get('/new-password',  user_controller.new_password);

user_router.post('/new-password',   user_controller.new_password_post);

user_router.get('/checkout', user_block,  user_controller.checkout);

user_router.post("/add-to-cart",cart_controller.cart);

user_router.get('/cart', user_block, cart_controller.cart_page);

user_router.post('/update-quantity', cart_controller.update_quantity);

user_router.post('/remove-from-cart', cart_controller.remove_from_cart);

user_router.post('/add-address', address_controller.add_address);

user_router.post('/checkout-address', address_controller.checkout_address);

user_router.post('/edit-address', address_controller.edit_address);

user_router.post('/delete-address', address_controller.delete_address);

user_router.post('/profile-update/:id', user_controller.profile_update);

user_router.post('/place-order', user_controller.place_order);

user_router.get('/order-success',  user_block, user_controller.order_success);

user_router.get('/google', passport.authenticate('google', { scope: [ 'profile', 'email'] }));

user_router.post('/cancelOrder', user_controller.cancel_order);

user_router.get('/profile-reset',   user_block, user_controller.profile_reset);

user_router.post('/profile-reset', user_controller.profile_reset_post);

user_router.get('/profile-reset-otp',  user_block, user_controller.profile_reset_otp);

user_router.post('/profile-reset-otp', user_controller.profile_reset_verify_otp);

user_router.post('/profile-reset-resend-otp', user_controller.profile_reset_resend_otp);

user_router.get('/profile-new-password',   user_block, user_controller.profile_new_password);

user_router.post('/profile-new-password', user_controller.profile_new_password_post);

user_router.post('/logout', user_controller.logout);

user_router.get('/wishlist',  user_block,  user_controller.wishlist);

user_router.post('/add-to-wishlist', user_controller.add_to_wishlist);

user_router.post('/removeFromWishlist',user_controller.removeFromWishlist);

user_router.post('/apply-coupon', coupon_controller.apply_coupon);

// user_router.post('/removeCoupon',coupon_controller.remove_coupon);

user_router.post('/return-order', user_controller.returnOrder)

user_router.get('/wallet',  user_block, user_controller.wallet);

user_router.get('/coupon', user_block, coupon_controller.coupon );

user_router.post('/create_razorpay_oder', user_controller.razorpay);

user_router.post('/veryfy_razorpay_payment', user_controller.veryfy_razorpay_payment);

user_router.post('/re_payment',user_controller.repayment)

user_router.get('/invoice/:id',  user_block, user_controller.invoice);

user_router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/signup' }),
    (req, res) => {
        req.session.Userdata = req.user;
        res.redirect('/');
    }
);


module.exports = user_router;