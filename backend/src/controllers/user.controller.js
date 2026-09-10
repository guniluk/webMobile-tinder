import User from "../models/user.model.js";
import { uploadFile, deleteFile } from "../utils/file.utils.js";

export const updateProfile = async (req, res) => {
  try {
    const { image, ...otherData } = req.body;
    let updatedData = otherData;

    if (image) {
      if (req.user.image) {
        try {
          await deleteFile(req.user.image);
        } catch (error) {
          return res
            .status(400)
            .json({ message: "Failed to delete existing image" });
        }
      }
      if (image.startsWith("data:image")) {
        try {
          const base64Image = image.split(",")[1];
          updatedData.image = await uploadFile(base64Image);
        } catch (error) {
          return res
            .status(400)
            .json({ message: "Failed to upload new image" });
        }
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updatedData,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
