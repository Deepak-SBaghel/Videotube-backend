import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
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
    console.log("the req.body is", req.body);
    console.log("the email is", email);

    if (!username && !email) {
        console.log("please enter username or email input");
        throw new ApiError(401, "all fields are required");
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (!existingUser) {
        console.log("user Does not exist");
        throw new ApiError(400, "user does not exist");
    }

    const checkPassword = await existingUser.isPasswordCorrect(password);
    // no need of existingUser.methods.isPasswordCorrect  X X X
    if (!checkPassword) {
        console.log("incorrect password");
        throw new ApiError(400, "incorrect password");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        existingUser._id
    );

    // the aT and rT are not in the existingUser so we call again
    const loggedInUser = await User.findById(existingUser._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                    //this is only shower to user not stored in database
                },
                "User logged in sucessfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    // remove cookie
    // renew refresh token
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: { refreshToken: 1 },
        },
        {
            new: true,
        }
    );
    const options = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out Sucessfully"));
});

const refreshAccessToken = asyncHandler(async (req, res, next) => {
    const incomingRefreshToken =
        req.cookies?.refreshToken || req.bod.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, " Unauthorized request");
    }

    try {
        const decodedRefreshToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedRefreshToken?._id);
        console.log("user from decoded refresh token is ",user);
        
        if (!user) {
            throw new ApiError(401, " Invelid refresh Token");
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, " refresh token is expired or not used");
        }
        // new take new acces token from the generate access toekn

        const options = {
            httpOnly: true,
            secure: true,
        };

        const { accessToken } = await generateAccessToken_endPoint(user._id);
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken },
                    "access token is refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid access token");
    }
});

export { registerUser, loginUser, logoutUser ,refreshAccessToken };
