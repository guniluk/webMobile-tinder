import User from "../models/user.model.js";

export const swipeRight = async (req, res) => {};

export const swipeLeft = async (req, res) => {};

export const getMatches = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "matches",
      "name image",
    );
    return res.status(200).json({ success: true, matches: user.matches });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getUserProfiles = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);

    if (!currentUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: currentUser._id } },
        { _id: { $nin: currentUser.likes } },
        { _id: { $nin: currentUser.dislikes } },
        { _id: { $nin: currentUser.matches } },
        {
          gender:
            currentUser.genderPreference === "both"
              ? { $in: ["male", "female"] }
              : currentUser.genderPreference,
        },
        { genderPreference: { $in: [currentUser.gender, "both"] } },
      ],
    }).select("-password");

    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
