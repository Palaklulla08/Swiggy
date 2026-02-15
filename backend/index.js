import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import connectDb from './config/db.js';
import authRouter from "./routes/auth.route.js";
import cookieParser from 'cookie-parser';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());

app.use(cookieParser());

app.use(express.urlencoded({extended: true}))

app.use("/api/auth", authRouter)
app.listen(port,()=>{
    connectDb();
    console.log(`Server is running on port ${port}`);
})