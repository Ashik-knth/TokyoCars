const path = require("path");
const fs = require("fs")
const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../uploads");
       
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;
        cb(null, uniqueSuffix);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Unsupported file type. Only JPEG, PNG, and GIF are allowed."), false);
    }
};

exports.upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter,
});

