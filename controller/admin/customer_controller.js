

const userSchema = require("../../model/usermodel");



exports.usersinfo = async (req,res)=>{
    const admin = req.session.admin;
    
    try{
        const users = await userSchema.find({isAdmin : false});

        res.render("admin/usermanagement",{
            title: "Tokyo Cars",
            layout: "layouts/admin_layout",
            users,
            admin
        });
    }catch(error){
        console.log(error);
        return res.redirect("/pageerror");
    }
}

exports.blockuser = async (req,res)=>{
    const {userId} = req.body;
    console.log("This is my id",userId);
    try{
        const user = await userSchema.updateOne({_id : userId},{$set : {isBlocked : true}});
        return res.json({ success: true, redirectUrl: "/admin/users" });
    }catch(error){
        console.log(error);
        return res.redirect("/pageerror");
    }
}

exports.unblock = async (req,res) =>{
    
    const {userId} = req.body;

    console.log("This is my unblock id",userId);
    

    try{
        const user = await userSchema.updateOne({_id : userId},{$set : {isBlocked : false}});
        return res.json({ success: true, redirectUrl: "/admin/users" });
    }catch(error){
        console.log(error);
        return res.redirect("/pageerror");
    }
    
}



