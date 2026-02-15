import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const port = process.env.PORT || 8000;
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());

app.use(cookieParser());


app.listen(port, () => {
    
    console.log(`Server is running on port ${port}`);
});