// require("dotenv").config({path:"./env"})
import dotenv from "dotenv"
import connectDB from "./db/index.js";

import {app} from "./app.js"
dotenv.config({
    path:'./env'
})
// connectDB() returns a  promise as it uses async and await in db/index.js
connectDB().then(()=>{
    app.on("Error",(err)=>{
        console.log("Error :",err);
        throw err;
    })
    //app.listen() , takes the port and returns a callback function
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`servfer is running at post : ${process.env.PORT}`);
    })
}).catch((err)=>{
    console.log("Mongo db connection failed !!! ",err);
})



// this isth efirst approach wherer all the  
/*
import express from "express"
const app = express()
;( async()=>{
    try{
        await mongoose.connect(`${process.env.MONGOBD_URI}/${DB_NAME}`)
        // listener : (on is a listener ) , listen on the event 
        app.on("error",(error)=>{
            console.log("Error :",error);
            throw error
        })
        app.listen(process.env.PORT,()=>{
            console.log("app s listining on port");
        })
    }
    catch(error){
        console.error("Error:",error)
        throw error
    }
})()
    // iife , directly execute when the program start 
*/