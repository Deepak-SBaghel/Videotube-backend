import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";

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
        fs.unlinkSync(localFilePath);
        // we use unlinkSync instead of unlink bcs , we want to go ahead only when it is done
        return response;
    } catch (error) {
        console.log(
            "error in upload on cloudinary",
            "with file:",
            localFilePath
        );

        fs.unlinkSync(localFilePath);
        console.log(error);
        return null;
    }
};

const deleteOnCloudinary = async (cloudPublicId) => {
    if (!cloudPublicId) return null;

    console.log("cloudPublicId : ", cloudPublicId);

    try {
        const result = await cloudinary.uploader.destroy(cloudPublicId, {
            resource_type: "image",
            // not working on retirn_type:auto
        });
        console.log("the file is deleted :",result);
        return result;
    } catch (error) {
        throw new ApiError(400,"the file is not destoyed")
    }
};
export { uploadOnCloudinary, deleteOnCloudinary };
