const mongoose = require("mongoose");
const { product } = require("../controller/admin/admin_controller");
const Category = require("./category");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    regularPrice: {
      type: Number,
      required: true,
      min: 1, 
    },
    salePrice: {
      type: Number,
      required: false,
    },
    productOffer: {
      type: Number,
      default: 0,
    },
    productImage: {
      type: [String],
      required: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    stock: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Available", "Out of Stock"],
      default: "Available",
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
