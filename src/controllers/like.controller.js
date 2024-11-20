import { like as Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    });

    if (existingLike) {
        await existingLike.deleteOne();
        return res.status(200).json(new ApiResponse(200, {}, "Video unliked"));
    }

    await Like.create({ video: videoId, likedBy: req.user._id });
    return res.status(201).json(new ApiResponse(201, {}, "Video liked"));
});
export const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    });

    if (existingLike) {
        await existingLike.deleteOne();
        return res.status(200).json(new ApiResponse(200, {}, "Tweet unliked"));
    }

    await Like.create({ tweet: tweetId, likedBy: req.user._id });
    return res.status(201).json(new ApiResponse(201, {}, "Tweet liked"));
});
export const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    });

    if (existingLike) {
        await existingLike.deleteOne();
        return res.status(200).json(new ApiResponse(200, {}, "Comment unliked"));
    }

    await Like.create({ comment: commentId, likedBy: req.user._id });
    return res.status(201).json(new ApiResponse(201, {}, "Comment liked"));
});
export const getLikedVideos = asyncHandler(async (req, res) => {
    const likes = await Like.find({
        likedBy: req.user._id,
        video: { $ne: null }
    }).populate("video");

    return res
        .status(200)
        .json(new ApiResponse(200, likes, "Liked videos fetched successfully"));
});
