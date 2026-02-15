import User from "../models/users.model.js";
import bcrypt from "bcryptjs";
import  genToken  from "../utils/token.js"

export const signup = async (req, res) => {
    try{
     const {fullName, email, password, phoneNumber, role} = req.body;
     const user = await User.findOne({email})
     if(user){
        return res.status(400).json({message: "User already exists"})
     }
     if(password.length < 6){
        return res.status(400).json({message: "Password must be at least 6 characters long"})
     }
     if(phoneNumber.length < 10){
        return res.status(400).json({message: "Phone number must be at least 10 characters long"})
     }
     const passwordHash = await bcrypt.hash(password, 10);
     const newUser = await User.create({
        fullName,
        email,
        password: passwordHash,
        phoneNumber,
        role
     })
     const token = await genToken(newUser._id);
     res.cookie("token", token, {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
     }) 
     
     return res.status(201).json({message: "User created successfully", user: newUser})
    }
    catch(error){
        console.log(error)
    }
}
export const signin = async (req, res) => {
    try{
     const { email, password} = req.body;
     const user = await User.findOne({email})
     if(!user){
        return res.status(400).json({message: "User does not exist"})
     }
     const isMatch = await bcrypt.compare(password, user.password)
     if(!isMatch){
        return res.status(400).json({message: "Invalid credentials"})
     }
     
     const token = await genToken(user._id);
     res.cookie("token", token, {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
     }) 
     
     return res.status(201).json({message: "User signed in successfully", user})
    }
    catch(error){
        console.log(error)
    }
}
export const signout = async (req, res) => {
    try{
     res.clearCookie("token", {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        sameSite: "strict",
     }) 
    return res.status(200).json({message: "User signed out successfully"})
    }
    catch(error){
        console.log(error)
    }
}
export const sendOtp=async (req,res) => {
  try {
    const {email}=req.body
    const user=await User.findOne({email})
    if(!user){
       return res.status(400).json({message:"User does not exist."})
    }
    const otp=Math.floor(1000 + Math.random() * 9000).toString()
    user.resetOtp=otp
    user.otpExpires=Date.now()+5*60*1000
    user.isOtpVerified=false
    await user.save()
    await sendOtpMail(email,otp)
    return res.status(200).json({message:"otp sent successfully"})
  } catch (error) {
     return res.status(500).json(`send otp error ${error}`)
  }  
}

export const verifyOtp=async (req,res) => {
    try {
        const {email,otp}=req.body
        const user=await User.findOne({email})
        if(!user || user.resetOtp!=otp || user.otpExpires<Date.now()){
            return res.status(400).json({message:"invalid/expired otp"})
        }
        user.isOtpVerified=true
        user.resetOtp=undefined
        user.otpExpires=undefined
        await user.save()
        return res.status(200).json({message:"otp verify successfully"})
    } catch (error) {
         return res.status(500).json(`verify otp error ${error}`)
    }
}

export const resetPassword=async (req,res) => {
    try {
        const {email,newPassword}=req.body
        const user=await User.findOne({email})
    if(!user || !user.isOtpVerified){
       return res.status(400).json({message:"otp verification required"})
    }
    const hashedPassword=await bcrypt.hash(newPassword,10)
    user.password=hashedPassword
    user.isOtpVerified=false
    await user.save()
     return res.status(200).json({message:"password reset successfully"})
    } catch (error) {
         return res.status(500).json(`reset password error ${error}`)
    }
}

export const googleAuth=async (req,res) => {
    try {
        const {fullName,email,mobile,role}=req.body
        let user=await User.findOne({email})
        if(!user){
            user=await User.create({
                fullName,email,mobile,role
            })
        }

        const token=await genToken(user._id)
        res.cookie("token",token,{
            secure:false,
            sameSite:"strict",
            maxAge:7*24*60*60*1000,
            httpOnly:true
        })
  
        return res.status(200).json(user)


    } catch (error) {
         return res.status(500).json(`googleAuth error ${error}`)
    }
}