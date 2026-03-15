import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    author : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description : {
        type: String,
    },
    image : {
        type: String
    },
    likes : [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        }
    ],
    comments : [
        {
            content : {
                type : String,
                required : true
            },
            user : {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            createdAt : { type: Date, default: Date.now }
        }
]
}, {timestamps : true});

const Post = mongoose.model("Post", postSchema);

export default Post;
