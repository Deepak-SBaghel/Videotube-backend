import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
        throw new ApiError(400, "Name and description are required");
    }

    const playlist = await Playlist.create({
        name,
        description,
        videos: [],
        owner: req.user._id
    });

    return res
        .status(201)
        .json(new ApiResponse(201, playlist, "Playlist created successfully"));
});

export const getUserPlaylists = asyncHandler(async (req, res) => {
    const playlists = await Playlist.find({ owner: req.user._id }).populate("videos");

    return res
        .status(200)
        .json(new ApiResponse(200, playlists, "User playlists fetched successfully"));
});

export const getPlaylistById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const playlist = await Playlist.findById(id)
        .populate("videos")
        .populate("owner", "username email");

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

export const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You cannot modify this playlist");
    }

    if (!playlist.videos.includes(videoId)) {
        playlist.videos.push(videoId);
        await playlist.save();
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video added to playlist"));
});

export const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You cannot modify this playlist");
    }

    playlist.videos = playlist.videos.filter(
        (vid) => vid.toString() !== videoId.toString()
    );
    await playlist.save();

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video removed from playlist"));
});

export const deletePlaylist = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const playlist = await Playlist.findById(id);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You cannot delete this playlist");
    }

    await playlist.deleteOne();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});
