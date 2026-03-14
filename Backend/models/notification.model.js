import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    receiver : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    type : {
        type : String,
        enum : ["like", "comment", "connection_accept"]
    },
    relatedUser : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    relatedPost : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Post"
    },
    commentText: {
        type: String
    },
}, {timestamps : true});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;