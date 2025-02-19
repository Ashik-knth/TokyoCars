
const categorySchema = require("../../model/category");


exports.categorie = async (req, res) => {
    const admin = req.session.admin;
    const category = await categorySchema.find();
    console.log(category, "aasddffggghhn");

    res.render("admin/category", {
        title: "TOKYO CARS",
        layout: "layouts/admin_layout",
        admin,
        category
    });
}

exports.addcategory = async (req, res) => {
    const { name } = req.body;
    console.log(name, 'hg');

    try {
        const uppercase = name.toUpperCase();
        const casesensitiveCategory = await categorySchema.findOne({ name: new RegExp(`^${name}$`, 'i') });
        const category = await categorySchema.findOne({ name: new RegExp(`^${uppercase}$`, 'i') });
        
        if(category){
            return res.json({ success: false, message: "Category already exists" });
        }

        if (casesensitiveCategory) {
            return res.json({ success: false, message: "Category already exists" });
        }

        const existingCategory = await categorySchema.findOne({ name });
        if (existingCategory) {
            return res.json({ success: false, message: "Category already exists" });
        }
        const newCategory = new categorySchema({ name,  categoryoffer:null, categoryofferprice:null });
        console.log(newCategory);

        await newCategory.save();
        return res.json({ success: true, message: "Category added successfully", redirectUrl: "/admin/category" });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: "Error adding category" });
    }

}

exports.editcategory= async (req, res) => {
    const { name, _id } = req.body;

    const uppercase = name.toUpperCase();

    const category = await categorySchema.findOne({ name: new RegExp(`^${uppercase}$`, 'i') });
    if (category) {
        return res.json({ success: false, message: "Category already exists" });
    }
    


    try {

        const category = await categorySchema.findByIdAndUpdate(_id , {name:uppercase});
        

        
        if (!category) {
            return res.json({ success: false, message: "Category not found" });
        }
        await category.save();
        return res.json({ success: true, message: "Category updated successfully", redirectUrls: "/admin/category" });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: "Error updating category" });
    }
}

exports.deletecategory= async (req, res) => {
    const {categoryId } = req.body;
    console.log("This is my id",categoryId);
    try {
        
        const deletecategory = await categorySchema.updateOne({_id : categoryId},{$set : {isDeleted : true}});
        if (!deletecategory) {
            return res.json({ success: false, message: "Category not found" });
        }

        return res.json({ success: true, message: "Category Deleted successfully", redirectUrl: "/admin/category" });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: "Error Deleting category" });
    }
}

exports.restorecategory = async (req, res) => {
    const {categoryId } = req.body;
    console.log("This is my id",categoryId);
    try {
        const restorecategory = await categorySchema.updateOne({_id : categoryId},{$set : {isDeleted : false}});
        if (!restorecategory) {
            return res.json({ success: false, message: "Category not found" });
        }

        return res.json({ success: true, message: "Category Restored successfully" , redirectUrl: "/admin/category" });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: "Error Restoring category" });
    }
}