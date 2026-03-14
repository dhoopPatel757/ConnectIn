import Notification from "../models/notification.model.js";


export const getNotifications = async(req,res) => {
    try{
        if(!req.userId){
            console.warn("getNotifications called without req.userId", {cookies: req.cookies});
            return res.status(401).json({message: "User not authenticated"});
        }
        console.log("getNotifications for user:", req.userId);
        let notifications = await Notification.find({receiver : req.userId})
        .populate("relatedUser", "firstname lastname username headline profileImage")
        .populate("relatedPost", "image description");

        res.status(200).json({notifications});
    }catch(err){
        console.error("Error fetching notifications: ", err.stack || err);
        res.status(500).json({message : err.message || "notifications could not be fetched"});
    }
}


export const deleteNotifications = async(req,res) => {
    try{
        let {id} = req.params;
        if(!req.userId){
            return res.status(401).json({message: "User not authenticated"});
        }
        await Notification.findOneAndDelete({
            _id : id,
            receiver : req.userId
        });

        res.status(200).json({message : "notification deleted"});
    }catch(err){
        console.error("Error deleting notification: ", err.stack || err);
        res.status(500).json({message : err.message || "could not delete notification"});
    }
}


export const clearAllNotifications = async(req,res) => {
    try{
        if(!req.userId){
            return res.status(401).json({message: "User not authenticated"});
        }
        await Notification.deleteMany({receiver : req.userId});
        console.log("cleared notifications for user:", req.userId);
        res.status(200).json({message : "all notifications cleared"});
    }catch(err){
        console.error("Error clearing notifications: ", err.stack || err);
        res.status(500).json({message : err.message || "notifications could not be cleared"});
    }
}