import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const uploadVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required");
    }

    if (!req.files?.videoFile || !req.files?.thumbnail) {
        throw new ApiError(400, "Video file and thumbnail are required");
    }

    // Upload to Cloudinary
    const videoUpload = await uploadOnCloudinary(req.files.videoFile[0].path, "video");
    const thumbnailUpload = await uploadOnCloudinary(req.files.thumbnail[0].path);

    if (!videoUpload?.url || !thumbnailUpload?.url) {
        throw new ApiError(500, "Error uploading files to Cloudinary");
    }

    const video = await Video.create({
        videoFile: videoUpload.url,
        thumbnail: thumbnailUpload.url,
        title,
        description,
        duration: videoUpload.duration || 0,
        owner: req.user._id
    });

    return res
        .status(201)
        .json(new ApiResponse(201, video, "Video uploaded successfully"));
});

export const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search = "" } = req.query;

    const aggregateQuery = Video.aggregate([
        {
            $match: {
                title: { $regex: search, $options: "i" },
                isPublished: true
            }
        },
        { $sort: { createdAt: -1 } }
    ]);

    const options = { page, limit };
    const videos = await Video.aggregatePaginate(aggregateQuery, options);

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

export const getVideoById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id).populate("owner", "username email");

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Increase view count
    video.view = (video.view || 0) + 1;
    await video.save();

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video fetched successfully"));
});

export const updateVideo = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;

    const video = await Video.findById(id);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this video");
    }

    if (title) video.title = title;
    if (description) video.description = description;

    if (req.files?.thumbnail) {
        const thumbnailUpload = await uploadOnCloudinary(req.files.thumbnail[0].path);
        video.thumbnail = thumbnailUpload.url;
    }

    await video.save();

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video updated successfully"));
});

export const deleteVideo = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to delete this video");
    }

    await video.deleteOne();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

export const togglePublishStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to change publish status");
    }

    video.isPublished = !video.isPublished;
    await video.save();

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Publish status updated"));
});
export const searchVideos = asyncHandler(async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ message: "Query is required" });
    }

    const videos = await Video.find({
        $or: [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
        ],
    }).populate("owner", "username email");

    res.status(200).json({ count: videos.length, videos });
});

export const sortVideos = asyncHandler(async (req, res) => {
    const { by } = req.query;

    let sortOption = {};
    if (by === "newest") sortOption = { createdAt: -1 };
    else if (by === "oldest") sortOption = { createdAt: 1 };
    else if (by === "popular") sortOption = { views: -1 }; // Assuming you store views

    const videos = await Video.find()
        .populate("owner", "username email")
        .sort(sortOption);

    res.status(200).json({ count: videos.length, videos });
});



