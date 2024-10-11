import multer from "multer";

const storage = multer.diskStorage({
    // cb = callback
    destination: function (req, file, cb) {
        cb(null, "./public/temp");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
        // change this original name to something filename+uniquesuffix
    },
});

export const upload = multer({ storage });
