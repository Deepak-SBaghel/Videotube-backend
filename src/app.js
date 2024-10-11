import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors"
const app = express();

// this file is used to configure app variable in express
app.use(
  cors({
   "origin": process.env.CORS_ORIGIN,
    "credential": true,
  })
);
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"));
app.use(cookieParser())

//route import 
import userRouter from "./routes/user.routes.js"

//route declariation
app.use("/api/v1/users",userRouter)
export { app };
