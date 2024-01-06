import dotenv from "dotenv";
import connectDB from "./db/index.js";
// import express from "express";
// const app=express()
// ;(async function connectDB(){
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.listen(process.env.PORT,()=>{
//             console.log(`App running on PORT ${process.env.PORT}`);
//         })
//     }catch(err){
//         console.log(err);
//     }
// })()//IIFE always starts for semicolon for better readability.
dotenv.config({ path: "./env" });
connectDB();
