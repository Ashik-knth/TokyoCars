const express = require("express");
const admin_router = express();
const admin_controller = require("../controller/admin/admin_controller");
const customer_controller = require("../controller/admin/customer_controller");
const category_controller = require("../controller/admin/category_controller");
const product_controller = require("../controller/admin/product_controller");
const coupon_controller = require("../controller/admin/coupon_controller");
const {upload} = require("../multer/multer");
const { admin_auth } = require("../middleware/auth");


admin_router.get('/login' , admin_controller.adminhomelogin);

admin_router.get('/dashboard', admin_auth, admin_controller.dashboard);

admin_router.post('/login', admin_controller.adminlogin);

admin_router.get('/orders', admin_auth, admin_controller.orders);

admin_router.get('/password', admin_auth, admin_controller.password);

admin_router.get('/product', admin_auth, product_controller.product);

admin_router.get('/users', admin_auth, customer_controller.usersinfo);

admin_router.get('/pageerror', admin_controller.pageerror);

admin_router.post('/logout',admin_controller.logout);

admin_router.post('/block',customer_controller.blockuser);

admin_router.post('/unblock', customer_controller.unblock);

// CATEGORY

admin_router.get('/category', admin_auth, category_controller.categorie);

admin_router.post('/addcategory', category_controller.addcategory);

admin_router.post('/editcategory', category_controller.editcategory);

admin_router.post('/deletecategory', category_controller.deletecategory);

admin_router.post('/restorecategory', category_controller.restorecategory);

// PRODUCT

admin_router.get('/product', admin_auth, product_controller.product);

admin_router.get('/addproduct', admin_auth, product_controller.addproduct);

admin_router.get('/editproduct', admin_auth, product_controller.editproduct);

admin_router.post('/editproduct/:id', upload.any() , product_controller.editproductfile);

admin_router.post('/addproduct', upload.any() , product_controller.addproducts);

// admin_router.post('/deletesingleimage', product_controller.deletesingleimage);

admin_router.post('/deleteproduct', product_controller.deleteproduct);

admin_router.post('/restoreproduct', product_controller.restoreproduct);

// ORDER 

admin_router.get('/order-management', admin_auth, product_controller.ordermanagement);

admin_router.post('/payment-change', product_controller.paymentChange);

admin_router.post('/status-change', product_controller.statusChange);

admin_router.post('/return-status-change', product_controller.returnstatusChange)

admin_router.get('/order-details/:id', admin_auth, product_controller.orderdetail)

// COUPON

admin_router.get('/coupon', admin_auth,coupon_controller.coupon);

admin_router.post('/addcoupon', coupon_controller.addcoupon);

admin_router.post('/editcoupon', coupon_controller.editcoupon);

admin_router.delete('/deletecoupon', coupon_controller.deletecoupon);


module.exports = admin_router;