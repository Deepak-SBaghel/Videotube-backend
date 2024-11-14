import { tweet as Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


export const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
        throw new ApiError(400, "Tweet content is required");
    }

    const newTweet = await Tweet.create({
        content,
        owner: req.user._id,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, newTweet, "Tweet created successfully"));
});
export const getAllTweets = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search = "" } = req.query;

    const query = search
        ? { content: { $regex: search, $options: "i" } }
        : {};

    const tweets = await Tweet.find(query)
        .populate("owner", "username email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

export const getTweetById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const foundTweet = await Tweet.findById(id).populate("owner", "username email");

    if (!foundTweet) {
        throw new ApiError(404, "Tweet not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, foundTweet, "Tweet fetched successfully"));
});

export const updateTweet = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    const foundTweet = await Tweet.findById(id);

    if (!foundTweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (foundTweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this tweet");
    }

    if (!content || content.trim().length === 0) {
        throw new ApiError(400, "Tweet content is required");
    }

    foundTweet.content = content;
    await foundTweet.save();

    return res
        .status(200)
        .json(new ApiResponse(200, foundTweet, "Tweet updated successfully"));
});

export const deleteTweet = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const foundTweet = await Tweet.findById(id);

    if (!foundTweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (foundTweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to delete this tweet");
    }

    await foundTweet.deleteOne();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});
export const searchTweets = asyncHandler(async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ message: "Query is required" });
    }

    const tweets = await Tweet.find({
        content: { $regex: query, $options: "i" },
    }).populate("owner", "username email");

    res.status(200).json({ count: tweets.length, tweets });
});
export const sortTweets = asyncHandler(async (req, res) => {
    const { by } = req.query;

    let sortOption = {};
    if (by === "newest") sortOption = { createdAt: -1 };
    else if (by === "oldest") sortOption = { createdAt: 1 };
    else if (by === "popular") sortOption = { likesCount: -1 }; // Assuming you count likes somewhere

    const tweets = await Tweet.find()
        .populate("owner", "username email")
        .sort(sortOption);

    res.status(200).json({ count: tweets.length, tweets });
});


