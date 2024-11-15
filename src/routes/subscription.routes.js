import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    toggleSubscription,
    getSubscribedChannels,
    getChannelSubscribers,
} from "../controllers/subscription.controller.js";

const router = Router();

router.post("/:channelId", verifyJWT, toggleSubscription);

router.get("/me", verifyJWT, getSubscribedChannels);

router.get("/channel/:channelId", verifyJWT, getChannelSubscribers);

export default router;
