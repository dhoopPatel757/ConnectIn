import User from "../models/user.model.js";
import Connection from "../models/connection.model.js";
import Notification from "../models/notification.model.js";
import {io, userSocketMap} from "../index.js";

export const sendConnection = async(req,res) => {
    try{
        let {id} = req.params;
        let sender = req.userId;
        let user = await User.findById(sender);

        if(sender == id){
            return res.status(400).json({message : "You cannot send connection request to yourself"});
        }

        if(user.connection.includes(id)){
            return res.status(400).json({message : "You are already connected"});
        }

        let existingConnection = await Connection.findOne({
            sender,
            receiver : id,
            status : "pending"
        })

        if(existingConnection){
            return res.status(400).json({message : "Connection request already sent"});
        }

        let newRequest = await Connection.create({
            sender : sender,
            receiver : id,
        });

        let receiverSocketId = userSocketMap.get(id);
        let senderSocketId = userSocketMap.get(sender);

        if(receiverSocketId){
            io.to(receiverSocketId).emit("statusUpdate", {updatedUserId : sender, newStatus : "received"});
        }

        if(senderSocketId){
            io.to(senderSocketId).emit("statusUpdate", {updatedUserId : id, newStatus : "pending"});
        }
        
        res.status(200).json(newRequest);
    }catch(err){
        console.log(err);
        res.status(500).json({message : "Internal Server Error"});
    }
}

export const acceptConnection = async(req,res) => {
    try{
        let {connectionId} = req.params;
        let userId = req.userId;

        let connection = await Connection.findById(connectionId);
        
        if(!connection){
            return res.status(404).json({message : "Connection request not found"});
        }

        if(connection.status !== "pending"){
            return res.status(400).json({message : "Connection request under process"});
        }

        connection.status = "accepted";

        let created = await Notification.create({
            receiver : connection.sender,
            type : "connection_accept",
            relatedUser : userId,
        });
        try{
            let populated = await Notification.findById(created._id)
                .populate("relatedUser", "firstname lastname username profileImage headline");
            let senderSocketId = userSocketMap.get(connection.sender.toString());
            if(senderSocketId){
                io.to(senderSocketId).emit('newNotification', populated);
            }
        }catch(e){
            console.error('emit notification error', e);
        }

        await connection.save();

        await User.findByIdAndUpdate(req.userId, {
            $addToSet : {connection : connection.sender}
        });

        await User.findByIdAndUpdate(connection.sender, {
            $addToSet : {connection : req.userId}
        });

        let receiverSocketId = userSocketMap.get(connection.receiver.toString());
        let senderSocketId = userSocketMap.get(connection.sender.toString());

        if(receiverSocketId){
            // io.to(receiverSocketId).emit("statusUpdate", {updatedUserId : connection.sender._id, newStatus : "Connected"});
            io.to(receiverSocketId).emit("statusUpdate", {
                updatedUserId: connection.sender.toString(),
                newStatus: "Connected"
            });
        }

        if(senderSocketId){
            // io.to(senderSocketId).emit("statusUpdate", {updatedUserId : req.userId, newStatus : "Connected"});
            io.to(senderSocketId).emit("statusUpdate", {
                updatedUserId: req.userId,
                newStatus: "Connected"
            });
        }
        res.status(200).json({message : "Connection request accepted"});

    }catch(err){
        console.log(err);
        res.status(500).json({message : "Internal Server Error"});
    }
}


export const rejectConnection = async(req,res) => {
    try{
        let {connectionId} = req.params;
        let userId = req.userId;

        let connection = await Connection.findById(connectionId);
        
        if(!connection){
            return res.status(404).json({message : "Connection request not found"});
        }

        if(connection.status !== "pending"){
            return res.status(400).json({message : "Connection request under process"});
        }

        connection.status = "rejected";
        await connection.save();  

        res.status(200).json({message : "Connection request rejected"});

    }catch(err){
        console.log(err);
        res.status(500).json({message : "Internal Server Error"});
    }
}


export const getConnectionStatus = async(req,res) => {
    try{
        const targetUserId = req.params.userId;
        const currentUserId = req.userId;
        
        let currentUser = await User.findById(currentUserId);

        if(currentUser.connection.includes(targetUserId)){
            return res.status(200).json({status : "Connected"});
        }

        const pendingRequest = await Connection.findOne({
            $or : [
                {sender : currentUserId, receiver : targetUserId},
                {sender : targetUserId, receiver : currentUserId}
            ],
            status : "pending"
        });

        if(pendingRequest){
            if(pendingRequest.sender.toString() === currentUserId.toString()){
                return res.status(200).json({status : "pending"});
            }else{
                return res.status(200).json({status : "received", requestId : pendingRequest._id});
            }
        }

        return res.json({status : "Connect"});
    }catch(err){
        console.log(err);
        res.status(500).json({message : "Internal Server Error"});
    }
}


export const removeConnection = async(req,res) => {
    try{
        const targetUserId = req.params.userId;
        const currentUserId = req.userId;

        await User.findByIdAndUpdate(currentUserId, {
            $pull : {connection : targetUserId}
        });

        await User.findByIdAndUpdate(targetUserId, {
            $pull : {connection : currentUserId}
        });

        let receiverSocketId = userSocketMap.get(targetUserId);
        let senderSocketId = userSocketMap.get(currentUserId);

        if(receiverSocketId){
            io.to(receiverSocketId).emit("statusUpdate", {updatedUserId : currentUserId, newStatus : "Connect"});
        }

        if(senderSocketId){
            io.to(senderSocketId).emit("statusUpdate", {updatedUserId : targetUserId, newStatus : "Connect"});
        }

        return res.status(200).json({message : "Connection removed successfully"});
    }catch(err){
        console.log(err);
        return res.status(500).json({message : "Internal Server Error"});
    }
}

// badlyu hatu
export const getConnectionRequest = async(req,res) => {
    try{
        const userId = req.userId;

        const requests = await Connection.find({
            receiver : userId,
            status : "pending"
        }).populate("sender", "firstname lastname profileImage headline connection")
        .populate("receiver", "name headline profileImage connection");
        
        return res.status(200).json(requests);
    }catch(err){
        console.log(err);
        return res.status(500).json({message : "Internal Server Error"});
    }
}

export const getSuggestedUser = async(req,res) => {
    try{ 
        let currentUser = await User.findById(req.userId).select("connection");
        
        let suggestedUsers = await User.find({
            _id : {
                $ne : req.userId,
                $nin : currentUser.connection
            }
        }).select("-password");
        return res.status(200).json(suggestedUsers);
    }catch(err){
        console.log(err);
        return res.status(500).json({message : "Internal Server Error"});
    }
}


export const getUserConnections = async(req,res) => {
    try{
        const userId = req.userId;

        const user = await User.findById(userId).populate("connection", "firstname lastname profileImage headline connection");
        return res.status(200).json(user.connection);
    }catch(err){
        console.log(err);
        return res.status(500).json({message : "Internal Server Error"});
    }
}

