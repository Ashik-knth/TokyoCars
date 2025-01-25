const { session } = require("passport");
const userSchema = require("../../model/usermodel");
const bcrypt = require("bcrypt");



exports.adminlogin = async (req, res) => {

    try{
    const { email , password } = req.body;
 
     console.log("Admin login", email, password);
     

    const admin = await userSchema.findOne({ email , isAdmin : true });

    console.log("This just for testing",admin);
    

    const errors = {};
    
    if(!email&&!password){
        errors.fields_error = "All fields are required";
        req.flash("errors", errors);
        return res.redirect("/admin/login");
    }

    if(!email){
        errors.email_error = "Must provide email";
        req.flash("errors", errors);
        return res.redirect("/admin/login");
    }

    if(!password){
        errors.password_error = "Must provide password";
        req.flash("errors", errors);
        return res.redirect("/admin/login");
    }
    
    if(!admin){
        errors.admin_error = "Invalid cedentials";
        req.flash("errors", errors);
        return res.redirect("/admin/login");
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if(!passwordMatch){
        errors.admin_password_match = "Password does not match";
        req.flash("errors", errors);
        return res.redirect("/admin/login");
    }

    req.session.admin = admin;
    res.redirect("/admin/dashboard");
    }catch(error){
        console.log(error);
        return res.redirect("/pageerror");
    }
     

}




exports.adminhomelogin = (req, res) => {
    
    try{

   

    const admin = req.session.admin;
    
    if(admin){
        return res.redirect("/admin/dashboard");
    }

    res.render("admin/login",{
        title: "Admin Login",
        layout: false,
        admin
    });

}catch(error){
    console.log(error);
    return res.redirect("/pageerror");
}

}
exports.dashboard = (req, res) => {
  
    try{

    

    admin = req.session.admin;
    res.render('admin/dashboard', {
        title: 'Admin Dashboard',
        layout: 'layouts/admin_layout',
        admin
    });

}catch(error){
    console.log(error);
    return res.redirect("/pageerror");
}


};

// exports.adminhome = (req, res) => {
//     res.render("admin/index");
// }

exports.orders = (req, res) => {
    res.render("admin/orders");
}

exports.password = (req, res) => {
    res.render("admin/password");
}



exports.users = (req, res) => {
    res.render("admin/users");
}

exports.pageerror = (req, res) => {
    res.render("admin/404",{
        title: "Error Page",
        layout:false
    });
}

exports.logout = (req,res) =>{
     try{

        console.log("your very niceeeeee");
        
        
        req.session.destroy(err =>{
            if(err){
                console.log("Error session destroy error", err);
                
                res.status(500).json({ success:false , message:"Session destoy error"});
                
            }

           res.status(200).json({success:true})
        })
     }catch(error){
        console.log("unexpected error during log out",error);
        res.redirect('/pageerror')
        
     }
}

