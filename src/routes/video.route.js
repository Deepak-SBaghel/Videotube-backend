import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    uploadVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    searchVideos,
    sortVideos,
} from "../controllers/video.controller.js";

const router = Router();

router.post("/", verifyJWT, uploadVideo);
router.get("/", getAllVideos);
router.get("/:id", getVideoById);
router.put("/:id", verifyJWT, updateVideo);
router.delete("/:id", verifyJWT, deleteVideo);

export default router;
