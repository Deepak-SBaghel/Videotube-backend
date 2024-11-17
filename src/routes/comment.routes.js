import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    addComment,
    getCommentsByVideo,
    updateComment,
    deleteComment
} from "../controllers/comment.controller.js";

const router = Router();
router.get("/:videoId", getCommentsByVideo);
router.post("/:videoId", verifyJWT, addComment);
router.patch("/:id", verifyJWT, updateComment);
router.delete("/:id", verifyJWT, deleteComment);

export default router;
