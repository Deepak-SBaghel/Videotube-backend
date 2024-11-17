import { comment as Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
        throw new ApiError(400, "Comment content is required");
    }

    const newComment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    });

    return res
        .status(201)
        .json(new ApiResponse(201, newComment, "Comment added successfully"));
});
export const getCommentsByVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const aggregateQuery = Comment.aggregate([
        { $match: { video: videoId } },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [{ $project: { username: 1, email: 1 } }]
            }
        },
        { $unwind: "$owner" },
        { $sort: { createdAt: -1 } }
    ]);

    const options = { page, limit };
    const comments = await Comment.aggregatePaginate(aggregateQuery, options);

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});
export const updateComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    const foundComment = await Comment.findById(id);
    if (!foundComment) {
        throw new ApiError(404, "Comment not found");
    }

    if (foundComment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to edit this comment");
    }

    if (!content || content.trim().length === 0) {
        throw new ApiError(400, "Comment content is required");
    }

    foundComment.content = content;
    await foundComment.save();

    return res
        .status(200)
        .json(new ApiResponse(200, foundComment, "Comment updated successfully"));
});
export const deleteComment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const foundComment = await Comment.findById(id);
    if (!foundComment) {
        throw new ApiError(404, "Comment not found");
    }

    if (foundComment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to delete this comment");
    }

    await foundComment.deleteOne();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});
