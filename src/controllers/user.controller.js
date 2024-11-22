import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { buildCookieOptions } from "../utils/cookieOptions.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
// import { cookie } from "cookie-parser";
// u csn use cookie-parser directry as imported in app.use()

const generateAccessToken_endPoint = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        return { accessToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating access token"
        );
    }
};

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        console.log(user);

        const accessToken = user.generateAccessToken();

        const refreshToken = user.generateRefreshToken();
        //console.log("accesstoken is:",accessToken,"refreshToken is",refreshToken);
        // directly use the methods , no need of user.methode.gener...

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false }); // await takes time
        // this is to remove all the mongoose validation
        // therefore we dont have to send teh password,etc... again
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating access token and refresh token"
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    // write steps :-
    // take input from use (frontend)
    // check if the value is null or not
    // check if already exist
    // check for image and avatar
    // upload to cloudinary
    // check if avatar is uploaded or not
    // take url and make a user in mongo bd
    // remove password and refresh token from returned item
    // return to user

    console.log("the req.body is ", req.body); // object with the text send data

    const { fullname, email, username, password } = req.body;
    console.log("email", email);

    if (
        [fullname, email, username, password].some(
            (field) => field?.trim() === ""
            // if any field is empty , this will show true
        )
    ) {
        throw new ApiError(400, "all fields are Required");
    }
    // User does not print any thing , just a model
    const existingUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    console.log("Existing user is ", existingUser);

    if (existingUser) {
        throw new ApiError(409, "User with email or username already existS");
    }

    console.log("request files is ", req.files); // contains an object with file which have an array of obj(inside prop of file)

    const avatarLocalPath = req.files?.avatar[0]?.path;
    console.log("avatat local path", avatarLocalPath);

    //const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    // if nover image is not here , it will give null

    let coverImageLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avater file is required");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    console.log("done");

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    console.log("uploaded avatar, the avatar is ", avatar);

    // that is why we are using async because , we are using await here
    // which will make the program syncronous and stop from moving forward

    const user = await User.create({
        fullname, // key = fillName , value = value inside fullname
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        //  coverImage:coverImage?coverImage.url || "";
        email,
        password,
        username: username.toLowerCase(),
    });
    console.log("Created user is ", user);

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    if (!createdUser) {
        throw new ApiError(500, "something went wrong while regestring user");
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "userCreated sucessfully")
        //this will show in postman
    );
});

const loginUser = asyncHandler(async (req, res) => {
    // steps
    // take req.body
    // take values and match with the database (username/email and password)
    // (find the user exist or not )
    // by using bcrypt.js check password
    // give access token to the user when he login(using jwt token)
    // send by cookies
    // make login true
    // make a program so that , refresh token req for new access token once expired

    const { username, email, password } = req.body;
    if (!username && !email)
        throw new ApiError(400, "Username or email is required");

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (!existingUser) throw new ApiError(400, "User does not exist");

    const ok = await existingUser.isPasswordCorrect(password);
    if (!ok) throw new ApiError(400, "Incorrect password");

    const accessToken = existingUser.generateAccessToken();
    const refreshToken = existingUser.generateRefreshToken();

    existingUser.refreshToken = refreshToken;
    await existingUser.save({ validateBeforeSave: false });

    const loggedInUser = await User.findById(existingUser._id).select(
        "-password -refreshToken"
    );

    return res
        .status(200)
        .cookie("accessToken", accessToken, buildCookieOptions("access"))
        .cookie("refreshToken", refreshToken, buildCookieOptions("refresh"))
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser },
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    // remove cookie
    // renew refresh token
    await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
    );

    const accessOpts = buildCookieOptions("access");
    const refreshOpts = buildCookieOptions("refresh");

    return res
        .status(200)
        .clearCookie("accessToken", accessOpts)
        .clearCookie("refreshToken", refreshOpts)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies?.refreshToken || req.body?.refreshToken;
    if (!incomingRefreshToken)
        throw new ApiError(401, "Unauthorized: no refresh token");

    let decoded;
    try {
        decoded = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
    } catch (err) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    const user = await User.findById(decoded?._id);
    if (!user) throw new ApiError(401, "User not found for refresh token");

    // Token reuse/rotation check
    if (user.refreshToken !== incomingRefreshToken) {
        // Optional: revoke all sessions here
        user.refreshToken = undefined;
        await user.save({ validateBeforeSave: false });
        throw new ApiError(401, "Refresh token reuse detected");
    }

    // Mint new pair (rotate refresh)
    const accessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(200)
        .cookie("accessToken", accessToken, buildCookieOptions("access"))
        .cookie("refreshToken", newRefreshToken, buildCookieOptions("refresh"))
        .json(new ApiResponse(200, { ok: true }, "Access token refreshed"));
});

// we will get the current user from ,auth.middleware
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    console.log("req.body is :", req.body);
    console.log("req.body is :", req.body);

    const user = await User.findById(req.user?._id);
    console.log("the user is :", user);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password Sucessfully saved"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, "Current user fetched sucessfully")
        );
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body;
    if (!fullname && !email) {
        throw new ApiError(400, "All fields are required");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email,
            },
        },
        {
            new: true,
        }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Account detail uploaded Sucessfully")
        );
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarPublicId = req.user?.avatar.split("/").pop().split(".")[0];
    console.log("avatarPublicId is :", avatarPublicId);

    if (!avatarPublicId) {
        throw new ApiError(500, "error occurd in avatarPublicId");
    }
    const deletedImage = await deleteOnCloudinary(avatarPublicId);
    if (!deletedImage) {
        throw new ApiError(500, "error occurd in deleting file");
    }

    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: { avatar: avatar.url },
        },
        { new: true }
    ).select("-password -refreshToken");
    await user.save({ validateBeforeSave: "false" });

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar updated Sucessfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImagePublicId = req.user?.coverImage
        .split("/")
        .pop()
        .split(".")[0];
    console.log("coverImagePublicId is :", coverImagePublicId);

    if (coverImagePublicId) {
        const deletedImage = await deleteOnCloudinary(coverImagePublicId);
        if (!deletedImage) {
            throw new ApiError(500, "error occurd in deleting file");
        }
    }
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) {
        throw new ApiError(400, "CoverImage file is missing");
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on coverImage");
    }

    const user = await User.findByIdAndUpdate(
        req.user?.id,
        {
            $set: { coverImage: coverImage.url },
        },
        { new: true }
    ).select("-password -refreshToken");
    await user.save({ validateBeforeSave: "false" });

    return res
        .status(200)
        .json(new ApiResponse(200, user, "coverImage updated Sucessfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    // this will be profile page
    const { username } = req.params;
    if (!username?.trim()) {
        throw new ApiError(400, "username is missing");
    }
    //User.find({username})
    const channel = await User.aggregate([
        {
            $match: {
                // this will return 1 document ie user
                username: username?.toLowerCase(),
            },
        },
        {
            $lookup: {
                from: "subscriptions", //Subscription -> subscriptions
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            $lookup: {
                from: "subscriptions", //Subscription -> subscriptions
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo",
            },
        },
        {
            $addFields: {
                subscriberCount: {
                    $size: "$subscribers",
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo",
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                subscriberCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
            },
        },
    ]);
    // returns a arraw of objects , but we will have only 1 obj in arr

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, channel[0], "user channel fetched sucessfully")
        );
});
const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                // WE CANT USE MONGOOSE IN AGGREGATION
                // u cant use req.user._id because aggregatin code is directly compled
                // so , we have to create a mongoose variable to refer to req.user._id
                _id: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id", // mongodb will create _id automaticaly
                as: "watchHistory", // name of array
                pipeline: [
                    {
                        $lookup: {
                            from: "user",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner",
                            },
                            // owner is a field now
                            // create a object of owner rather than arr[0]
                        },
                    },
                ],
            },
        },
    ]);
    // user = [{a,b,watchHIstory}]
    return res.status(200).json(new ApiResponse(200, user[0].watchHistory));
});
//Note : make seperate contoller to change the files
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
};
