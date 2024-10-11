import { Router } from "express";
import {registerUser} from "../controllers/user.controller.js"
const router = Router()


router.route("/register").post(registerUser)
export default router;


// dafault keyword is used to export a single variable 