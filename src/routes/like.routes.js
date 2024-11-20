import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    toggleVideoLike,
    toggleTweetLike,
    toggleCommentLike,
    getLikedVideos
} from "../controllers/like.controller.js";

const router = express.Router();
router.post("/video/:videoId", verifyJWT, toggleVideoLike);
router.post("/tweet/:tweetId", verifyJWT, toggleTweetLike);
router.post("/comment/:commentId", verifyJWT, toggleCommentLike);
router.get("/videos", verifyJWT, getLikedVideos);

export default router;

