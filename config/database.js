const mongoose = require("mongoose");

const env = require("dotenv").config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log("MongoDB connected");
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};

module.exports = connectDB;