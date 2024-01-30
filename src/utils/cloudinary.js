import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadonCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

<<<<<<< HEAD
  fs.unlinkSync(localFilePath)

    // console.log("File is uploaded on cloudinary", response.url);
=======
    console.log("File is uploaded on cloudinary", response.url);
>>>>>>> 5527532a4e1a93a7b1b0bf752007cd4c632c80f1
    return response
  } catch (error) {
    fs.unlinkSync(localFilePath)//it deletes the file because agar file upload nahi hua cloud pe toh fir wo files reh kar storage consume karenge so better to delete it. we use synchronous ye hona hi hona hai uske baad hi age process karenge so that is the reason to use sync.
    return null;
  }
};

export { uploadonCloudinary }