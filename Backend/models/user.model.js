import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstname : {
        type : String,
        required : true
    },
    lastname : {
        type : String,
        required : true
    },
    username : {
        type : String,
        required : true,
        unique : true // username should be unique because two person cannot have same username.
    },
    email : {
        type : String,
        required : true,
        unique : true // same for email also, two person cannot have same email.
    },
    password : {
        type : String,
        required : true
    },
    profileImage : {
        type : String,
        default : ""
    },
    coverImage : {
        type : String,
        default : ""
    },
    headline : {
        type : String,
        default : ""
    },
    skills : [
        {
            type : String,
        }
    ],
    education : [
        {
            college : {
                type : String,
            },
            degree : {
                type : String
            },
            fieldOfStudy : {
                type : String
            },
            GPA : {
                type : Number
            }
        }
    ],

    location : {
        type : String,
        default : "United States"
    },

    gender : {
        type : String,
        enum : ["male", "female", "other"]
    },
    experience : [
        {
            jobTitle : {
                type : String,
            },
            company : {
                type : String
            },
            yearsOfExperience : {
                type : Number,
            },
            description : {
                type : String
            },
        }
    ],
    connection : [
        {
            type : Schema.Types.ObjectId,
            ref : "User"
        }
    ],

}, {timestamps: true});


const User = mongoose.model("User", userSchema);

export default User;