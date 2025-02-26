const express = require("express");
const app = express();
const path = require("path");
const user_router = require("./routes/user");
const admin_router = require("./routes/admin");
const cors = require("cors");
const morgan = require("morgan");
const session = require("express-session");
const ejs = require("ejs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const flash = require("connect-flash");
const nocache = require("nocache");
const connectDB = require("./config/database");
const passport = require("./config/passport");
const expressLayouts = require("express-ejs-layouts");
const multer = require("multer");
const sharp = require("sharp");
const upload = multer({ dest: "uploads/" });

connectDB();

const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(nocache());

app.use(
    session({
        secret: process.env.SESSION_SECRETE  || "aVerySecureRandomString123",
        resave: false,
        saveUninitialized: false,
        
        cookie: {
            secure: false,
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24, 
        },
    })
);


app.use(passport.initialize());
app.use(passport.session());

dotenv.config();

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(morgan("dev"));

app.set('view engine', 'ejs');
app.use(expressLayouts)
app.set('views', [path.join(__dirname, 'views/user'), path.join(__dirname, 'views/admin')]);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


app.use(flash());

app.use((req, res, next) => {
    res.locals.errors = req.flash("errors")[0] || {};
    res.locals.success = req.flash("success")[0] || {};
    next();
  });

  app.use((err, req, res, next) => {
    console.error("Error handler called", err.stack); 
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
    });
});
  


app.use("/", user_router);

app.use("/admin", admin_router);

app.use('/*', (req, res) => {
    res.render('page404', { layout: false, title: 'Page Not Found' });
    
});


app.listen(PORT, () => {
    console.log(`Server running on  http://localhost:${PORT}`);
});


