import express from "express";
import { getNotifications, deleteNotifications, clearAllNotifications } from "../controllers/notification.controller.js";
import isAuth from '../middlewares/isAuth.js';

let notificationRouter = express.Router();

notificationRouter.get("/", isAuth, getNotifications);
// register the static /clear route before the dynamic /:id route so "clear" isn't treated as an id
notificationRouter.delete("/clear", isAuth, clearAllNotifications);
notificationRouter.delete("/:id", isAuth, deleteNotifications);

export default notificationRouter;