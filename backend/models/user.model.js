import mongoose from "mongoose";

// creating user schema
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    phoneNumber: {
        type: String,
        required: true
    },
    role:{
        type: String,
        enum: ["user", "owner","deliveryBoy"],
        required: true    
    }

},{timestamps: true})

// creating user model using the user schema
const User = mongoose.model("User", userSchema)

export default User