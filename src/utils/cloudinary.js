import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

// Upload an image
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        //console.log("file is uploaded on cloudinary", response.url);
        fs.unlinkSync(localFilePath)
        // we use unlinkSync instead of unlink bcs , we want to go ahead only when it is done
        return response;
    } catch (error) {
        console.log("error in upload on cloudinary", "with file:",localFilePath);
        
        fs.unlinkSync(localFilePath)
        console.log(error);
        return null;
    }
}; 
export{uploadOnCloudinary}