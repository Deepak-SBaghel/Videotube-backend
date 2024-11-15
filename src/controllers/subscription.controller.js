import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (req.user._id.toString() === channelId) {
        throw new ApiError(400, "You cannot subscribe to yourself, MY LORD!");
    }

    const existing = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId,
    });

    if (existing) {
        await existing.deleteOne();
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Unsubscribed successfully"));
    }

    await Subscription.create({
        subscriber: req.user._id,
        channel: channelId,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, {}, "Subscribed successfully"));
});

export const getSubscribedChannels = asyncHandler(async (req, res) => {
    const subs = await Subscription.find({ subscriber: req.user._id }).populate(
        "channel",
        "username email"
    );

    return res
        .status(200)
        .json(
            new ApiResponse(200, subs, "Subscribed channels fetched successfully")
        );
});

export const getChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    const subs = await Subscription.find({ channel: channelId }).populate(
        "subscriber",
        "username email"
    );

    return res
        .status(200)
        .json(
            new ApiResponse(200, subs, "Subscribers fetched successfully")
        );
});
