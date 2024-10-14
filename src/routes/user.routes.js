// USE MIDDLEWARE IN ROUTES
import { Router } from "express";
import { loginUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
    // upload.single() for single file
    // upload.array() for many fike with same name
    // upload.fields() from many file with different names
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    registerUser
);

router.route("/login").post(loginUser)
router.route("/logout").post(
    verifyJWT,
    logoutUser)

export default router;

// dafault keyword is used to export a single variable
// 
