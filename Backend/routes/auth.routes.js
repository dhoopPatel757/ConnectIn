import express from "express";
import {signup, login, logout} from "../controllers/auth.controllers.js";

let authRouter = express.Router();  // we have taken Router() function from express to create a router for auth related routes.

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.get("/logout", logout);

export default authRouter;