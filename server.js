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
const cache = require("nocache");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const flash = require("connect-flash");
const nocache = require("nocache");

const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(nocache());

app.use(
    session({
        secret: "secret",
        resave: true,
        saveUninitialized: true,
    })
);

app.use(flash());

dotenv.config();

app.use(express.static(path.join(__dirname, 'public')));

app.use(morgan("dev"));

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use((req,res,next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    next();
});

mongoose.connect(process.env.DATABASE_URL).then(() => {
    console.log("Database connected");
}).catch(err => {
    console.log(err);
});

app.use("/", user_router);
app.use("/admin", admin_router);


app.listen(PORT, () => {
    console.log(`Server running on  http://localhost:${PORT}`);
});

