import User from "../models/User.js";

export const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      username,
      email,
      password,
      organizationType,
      organizationName,
      organizationDescription,
      websiteUrl,
      location,
    } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User with this email or username already exists",
      });
    }

   
    const user = await User.create({
      fullName,
      username,
      email,
      password,
      organizationType,
      organizationName,
      organizationDescription,
      websiteUrl,
      location,
      profilePhotoUrl,
    });

    
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Error in user registration",
      error: error.message,
    });
  }
};
