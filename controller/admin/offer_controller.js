const categorySchema = require("../../model/category");
const productSchema = require("../../model/product");
const offerSchema = require("../../model/offer");
const Category = require("../../model/category");



exports.offer = async (req, res) => {

  try {


    const offer = await offerSchema.find();

    const product = await productSchema.find();

    const category = await categorySchema.find();

    console.log("offer", offer);

    const admin = req.session.admin;

    res.render("admin/offer", {
      title: "Admin Offer Page",
      layout: "layouts/admin_layout",
      admin,
      offer,
      product,
      category
    })

  } catch (error) {
    console.log("offer error", error);

  }

}


exports.addoffer = async (req, res) => {
  try {

    console.log("addoffer", req.body);

    const { name, discount, date } = req.body;

    const offer = new offerSchema({
      name: name,
      discount: parseFloat(discount),
      endDate: new Date(date)
    })

    await offer.save();

    console.log("offer saved successfully", offer);

    res.redirect("/admin/offer");

  } catch (error) {
    console.log("addoffer error", error);
  }
}

exports.editoffer = async (req, res) => {
  try {

    console.log("editoffer", req.body);

    const { editID, offerName, discountName, dateName } = req.body;

    const offer = await offerSchema.findByIdAndUpdate(editID, {
      name: offerName,
      discount: parseFloat(discountName),
      endDate: new Date(dateName)
    })

    console.log("offer updated successfully", offer);

    req.flash("success", "Offer Updated Successfully");

    res.redirect("/admin/offer");

  } catch (error) {
    console.log("editoffer error", error);
  }
}

exports.deleteoffer = async (req, res) => {
  try {

    console.log("deleteoffer", req.body);

    const { offerid } = req.body;

    const product = await productSchema.updateMany({
      productoffer: offerid}, {$set: {productOffer: 0, categoryofferprice: 0}});


     const products = await productSchema.updateMany({
       categoryoffer: offerid}, {$set: {categoryofferprice: 0}});
     

    console.log("This is offer id products", product);

    console.log("This is offer id products", products);
    

    const offer = await offerSchema.findByIdAndDelete(offerid);

    if (!offer) {
      console.log("offer not found");
      return res.status(400).json({ message: "Offer Not Found" });
    }

    console.log("offer deleted successfully", offer);

    return res.status(200).json({ message: "Offer Deleted Successfully" });

  } catch (error) {
    console.log("deleteoffer error", error);
  }
}


exports.applyproductoffer = async (req, res) => {
  try {

    console.log("apply offer request body", req.body);

    const { productId, offerId } = req.body;



    const product = await productSchema.findByIdAndUpdate(productId, { productoffer: offerId }).populate("productoffer");

    console.log("This is the product", product);


    const offer = await offerSchema.findById(offerId);


    console.log("This is the offersssssss", offer);

    console.log("Orginal Price", product.regularPrice);


    let OfferPrice = parseInt(product.regularPrice * offer.discount) / 100;

    console.log("This is the OfferPrice", OfferPrice);
    


    product.productOffer = Number(product.regularPrice - OfferPrice);

    console.log("This is the productOffer", product.productOffer);
    

    await product.save()

    res.status(200).json({ success: true, message: "product offered successfully" })

    console.log("This is the OfferPrice", OfferPrice);



    if (!offer) {
      console.log("offer not found");
      return res.status(400).json({ message: "Offer Not Found" });
    }

    if (!product) {
      console.log("product not found");
      return res.status(400).json({ message: "Product Not Found" });
    }


  } catch (error) {
    console.log("applyproductoffer error", error);

  }
}


exports.applycategoryoffer = async (req, res) => {
  try {

    console.log("Categoryoffer apply request recieved", req.body);

    const { CategoryId, offerId } = req.body;

    const category = await categorySchema.findByIdAndUpdate(CategoryId, { categoryoffer: offerId }).populate("categoryoffer");

    const products = await productSchema.updateMany({ category: CategoryId }, { $set: { categoryoffer: offerId } });


    console.log("This is the products", products);
    

    console.log("This is the category", category);

    if (!category) {
      return res.status(404).json({ error: "Category Not Found" })
    }


    const product = await productSchema.find({ category: CategoryId });

    

    if(!product){
      return res.status(404).json({ error: "Product Not Found" })
    }


    const offer = await offerSchema.findById(offerId);

    console.log("This is the offer", offer);

    if (!offer) {
      return res.status(404).json({ error: "Offer Not Found" });
    }

    for(let value of product){

      console.log("This is the value", value.regularPrice);
      

      let OfferPrice = parseInt(value.regularPrice * offer.discount) / 100;

      console.log("This is the OfferPrice", OfferPrice);
      

      value.categoryofferprice = value.regularPrice - OfferPrice;

      console.log("This is the OfferPriceeeeee", value.categoryofferprice);
      

      await value.save();
    }

    console.log("This is the product", product);


    res.status(200).json({ success: true, message: "category offer applied successfully" })
    

  } catch (error) {
    console.log("category offer apply error", error);

  }
}