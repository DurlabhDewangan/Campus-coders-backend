import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload function
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload file to cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log(" Upload(on cloudinary) success:", response.url);

    // Delete local file after upload
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    fs.linkSync(localFilePath)//remove the locally saved temp file as the upload operation got failed
    console.error("Cloudinary upload error:", error);
    return null;
  }
};

export {uploadOnCloudinary};
   