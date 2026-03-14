import express from 'express';
import isAuth from '../middlewares/isAuth.js';
import { sendConnection, acceptConnection, rejectConnection, getConnectionStatus, removeConnection, getConnectionRequest, getUserConnections } from '../controllers/connection.controller.js';

let connectionRouter = express.Router();

connectionRouter.post("/request/:id", isAuth, sendConnection);
connectionRouter.put("/accept/:connectionId", isAuth, acceptConnection);
connectionRouter.put("/reject/:connectionId", isAuth, rejectConnection);
connectionRouter.get("/status/:userId", isAuth, getConnectionStatus);
connectionRouter.delete("/remove/:userId", isAuth, removeConnection);
connectionRouter.get("/requests", isAuth, getConnectionRequest);
connectionRouter.get("/", isAuth, getUserConnections);


export default connectionRouter;



