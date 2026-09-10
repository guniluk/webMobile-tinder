import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFile = async (file) => {
  const result = await cloudinary.uploader.upload(file, {
    folder: "tinder",
    resource_type: "image",
  });
  return result.secure_url;
};

export const deleteFile = async (url) => {
  const publicId = url.split("/").pop().split(".")[0];
  await cloudinary.uploader.destroy(publicId);
};
