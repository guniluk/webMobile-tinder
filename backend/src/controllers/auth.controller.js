import User from "../models/user.model.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";
import { getIO } from "../socket/socket.server.js";

export const signup = async (req, res) => {
  const { name, email, password, gender, age, genderPreference } = req.body;
  try {
    if (!name || !email || !password || !gender || !age || !genderPreference) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (gender !== "male" && gender !== "female") {
      return res.status(400).json({ message: "Invalid gender" });
    }
    if (
      genderPreference !== "male" &&
      genderPreference !== "female" &&
      genderPreference !== "both"
    ) {
      return res.status(400).json({ message: "Invalid gender preference" });
    }
    if (age < 18 || age > 100) {
      return res
        .status(400)
        .json({ message: "You must be between 18 and 100 years old." });
    }
    if (password.length < 4) {
      return res
        .status(400)
        .json({ message: "Password must be at least 4 characters long." });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      name,
      email,
      password,
      gender,
      age,
      genderPreference,
    });
    await newUser.save();

    // Broadcast new user creation in real-time via Socket.IO
    try {
      const io = getIO();
      io.emit("newUserRegistered", {
        _id: newUser._id,
        name: newUser.name,
        gender: newUser.gender,
        genderPreference: newUser.genderPreference,
        age: newUser.age,
      });
    } catch (socketError) {
      console.log("Socket emit error on signup:", socketError.message);
    }

    const token = generateTokenAndSetCookie(newUser._id, res);
    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      gender: newUser.gender,
      age: newUser.age,
      genderPreference: newUser.genderPreference,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const token = generateTokenAndSetCookie(user._id, res);
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      gender: user.gender,
      age: user.age,
      bio: user.bio,
      image: user.image,
      genderPreference: user.genderPreference,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
    });
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Error in logout controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getMe = (req, res) => {
  res.send({ user: req.user });
};
