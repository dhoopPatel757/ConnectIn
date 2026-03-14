import express from "express";

import http from "http";
import { Server } from "socket.io";
const app = express();
const server = http.createServer(app);

import connectDb from "./config/db.js";

import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./routes/user.routes.js";
import postRouter from "./routes/post.routes.js";
import connectionRouter from "./routes/connection.routes.js";
import notificationRouter from "./routes/notification.routes.js";

export const io = new Server(server, {
    cors : {
        origin : "https://connectin-frontend.onrender.com",
        credentials : true,
    }
})
// importing env variables. (npm i dotenv)
import dotenv from "dotenv";
dotenv.config();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
    origin : "https://connectin-frontend.onrender.com",
    credentials : true,
}));

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/connection", connectionRouter);
app.use("/api/notifications", notificationRouter);

export const userSocketMap = new Map();

io.on("connection", (socket) => {
    console.log("A user connected: ", socket.id);

    socket.on("register", (userId) => {
        userSocketMap.set(userId, socket.id);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected: ", socket.id);
    });

})

server.listen(port, () => {
    connectDb();
    console.log(`Server is running on port ${port}`);
});



