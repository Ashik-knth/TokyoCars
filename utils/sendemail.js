const nodemailer = require("nodemailer");

const sendEmail = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASSWORD,
            }
        });
        const info = {
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: "OTP Verification",
            text: `Your OTP is: ${otp}`,
            html: `<b>Your OTP : ${otp}</b>`,
        };
        await transporter.sendMail(info);
        return true;

    } catch (error) {
        console.log(error);
        return false;
    }
};

module.exports = sendEmail;