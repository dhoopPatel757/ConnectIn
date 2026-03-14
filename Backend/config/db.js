import mongoose from "mongoose";

const connectDb = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDb Database connected successfully");
    }
    catch(err){
        console.error("MongoDb Database connection failed", err);
    }
}

export default connectDb;
