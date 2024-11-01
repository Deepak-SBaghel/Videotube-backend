// USE MIDDLEWARE IN ROUTES
import { Router } from "express";
import {
    logoutUser,
    loginUser,
    registerUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

const logRequestBody = (req, res, next) => {
    console.log("Request body:", req.body);
    next(); // Pass control to the next middleware or controller
};
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

router.route("/login").post(logRequestBody, loginUser);

// secured route (user should be logined to access this )
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refreshAccessToken").post(refreshAccessToken);
router.route("/changeCurrentPassword").post(verifyJWT, changeCurrentPassword);
router.route("/getCurrentUser").post(verifyJWT, getCurrentUser);
router.route("/updateAccountDetails").post(verifyJWT, updateAccountDetails);
router
    .route("/updateUserAvatar")
    .post(
        
        verifyJWT,
        upload.single("avatar"),
        updateUserAvatar
    );
router
    .route("/updateUserCoverImage")
    .post(
        verifyJWT,
        upload.single("coverImage"),
        updateUserCoverImage
    );
// router.route("/").post();

export default router;

// dafault keyword is used to export a single variable
