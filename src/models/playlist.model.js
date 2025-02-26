import mongoose, { Schema } from "mongoose";
const playlist = new Schema({
    name:{
        type:string,
        required:true,
    }
    description:{
        type:string,
        required:true,
    }
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video",
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{
    timestamps:true
});
