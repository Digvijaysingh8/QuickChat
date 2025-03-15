import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
dotenv.config();
const PORT = process.env.PORT;

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app,server } from "./lib/socket.js";
import path from "path";
const __dirname = path.resolve();

app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173","https://quickchat-7zfh.onrender.com"], // ✅ Set your frontend URL, NOT "*"
    credentials: true, // ✅ Required to allow cookies/sessions
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow necessary methods
    allowedHeaders: ["Content-Type", "Authorization"], // Optional
  })
);
app.use(express.json());
app.use("/api/auth",authRoutes);
app.use("/api/messages",messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}


server.listen(PORT,()=>{
  console.log(`Server is running on port ${PORT}`);
  connectDB();
})
