import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist
} from "../controllers/playlist.controller.js";

const router = Router();

//Auth required
router.post("/", verifyJWT, createPlaylist);
router.get("/me", verifyJWT, getUserPlaylists);
router.patch("/:playlistId/videos/:videoId", verifyJWT, addVideoToPlaylist);
router.delete("/:playlistId/videos/:videoId", verifyJWT, removeVideoFromPlaylist);
router.delete("/:id", verifyJWT, deletePlaylist);
// no Auth required
router.get("/:id", getPlaylistById);

export default router;
