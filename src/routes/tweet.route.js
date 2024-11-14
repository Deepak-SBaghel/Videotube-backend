import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    createTweet,
    getAllTweets,
    getTweetById,
    updateTweet,
    deleteTweet,
    searchTweets,
    sortTweets,
} from "../controllers/tweet.controller.js";

const router = Router();


router.post("/", verifyJWT, createTweet);
router.get("/", getAllTweets);
router.get("/:id", getTweetById);
router.put("/:id", verifyJWT, updateTweet);
router.delete("/:id", verifyJWT, deleteTweet);
router.get("/search", searchTweets);
router.get("/sort", sortTweets);// Example: GET /api/tweets/sort?by=newest
export default router;
