import cors from "cors"
import cookieParser from "cookie-parser";
import express from "express";
const app = express();

// this file is used to configure app variable in express
// CORS setup must allow credentials if you use cookies
app.set("trust proxy", 1);
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json({limit:"50kb"}));
app.use(express.urlencoded({extended:true,limit:"50kb"}))
app.use(express.static("public"));
app.use(cookieParser())


//route import 
import subscriptionRoutes from "./routes/subscription.routes.js";
import likeRoutes from "./routes/like.routes.js";
import userRouter from "./routes/user.routes.js"
import playlistRoutes from "./routes/playlist.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import tweetRoutes from "./routes/tweet.routes.js";
import videoRoutes from "./routes/video.routes.js";


//route declariation
app.use("/api/videos", videoRoutes);
app.use("/api/tweets", tweetRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/v1/users",userRouter)
app.use("/api/comments", commentRoutes);
export { app };
