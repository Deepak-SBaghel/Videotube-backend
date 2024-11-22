// we are making to get the access of the user in logout function
// instead of returning user , we are adding user in req body
// then pass to next middleware with next


// can also be used to check if the user is checkrd in or not
// src/middlewares/auth.middleware.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const bearer = req.headers?.authorization || req.headers?.Authorization;
    const tokenFromHeader = bearer?.startsWith("Bearer ")
      ? bearer.slice(7)
      : undefined;

    const token = req.cookies?.accessToken || tokenFromHeader;

    if (!token) throw new ApiError(401, "Unauthorized: no access token");

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      if (err?.name === "TokenExpiredError") {
        throw new ApiError(401, "Access token expired");
      }
      throw new ApiError(401, "Invalid access token");
    }

    const user = await User.findById(decoded?._id).select("-password -refreshToken");
    if (!user) throw new ApiError(401, "User not found for token");

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
});



// WITH THIS WE CAN ACCESS req,user 
// and also varify that the user us logined 