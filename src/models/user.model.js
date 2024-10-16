import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true, //enable index if u want to use searching in this field
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar: {
        type: String, // cloudinary url
        required: true,
    },
    coverImage: {
        type: String, // cloudinary url
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
    ],
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    refreshToken:{
        type: String
    }
});
//this will run every time we try to save 
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); // this => User , isModified => a inbuild function 
    // only run when there is a change in password
    this.password = await bcrypt.hash(this.password, 10);
    next();
});
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
    // return true or false
};
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        // this method genetares token
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    );

};
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        // this method genetares token
        {
            // we can access all this from the token (which is saved in cookiess)
            _id: this._id,
        },
        // we will need this secret to verify token,(in auth middleware)
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    );

};
export const User = mongoose.model("User", userSchema);
