import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFile = async (req, res) => {
  try {
    const { fileData } = req.body; // base64 data URL
    if (!fileData) {
      return res.status(400).json({ message: "No file data provided" });
    }

    console.log("Uploading file to Cloudinary...");
    const uploadResult = await cloudinary.uploader.upload(fileData, {
      resource_type: "auto", // automatically detect image, video, audio, or raw files (documents)
    });

    console.log("Cloudinary upload successful:", uploadResult.secure_url);
    res.json({ fileUrl: uploadResult.secure_url });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    res.status(500).json({ message: error.message || "Failed to upload file to Cloudinary" });
  }
};

export default uploadFile;
