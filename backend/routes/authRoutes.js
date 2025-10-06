import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();


router.post("/register", async (req, res) => {
  try {
    const {
      username: rawUsername,
      fullName: rawFullName,
      email: rawEmail,
      password,
      userType,
      location: rawLocation,
      organizationName,
      organizationDescription,
      websiteUrl,
      skills,
    } = req.body;

    const username = typeof rawUsername === "string" ? rawUsername.trim() : rawUsername;
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : rawEmail;
    const fullName = typeof rawFullName === "string" ? rawFullName.trim() : rawFullName;
    const location = typeof rawLocation === "string" ? rawLocation.trim() : rawLocation;

  
    if (!username || !email || !password || !fullName || !userType) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

 
    const hashedPassword = await bcrypt.hash(password, 10);

    // New user object
    const user = new User({
      username,
      fullName,
      email,
      password: hashedPassword,
      userType,
      location,
      organizationName: userType === "ngo" ? organizationName : undefined,
      organizationDescription: userType === "ngo" ? organizationDescription : undefined,
      websiteUrl: userType === "ngo" ? websiteUrl : undefined,
      skills: userType === "volunteer" ? skills : undefined,
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully ✅",
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * 🔹 LOGIN
 */
router.post("/login", async (req, res) => {
  try {
    const { username: rawUsername, email: rawEmail, password } = req.body;
    const username = typeof rawUsername === "string" ? rawUsername.trim() : rawUsername;
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : rawEmail;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const query = [];
    if (username) query.push({ username });
    if (email) query.push({ email });
    if (!query.length) {
      return res.status(400).json({ message: "Provide username or email" });
    }
    const user = await User.findOne({ $or: query });
    if (!user) return res.status(404).json({ message: "User not found" });

    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (_) {
      isMatch = false;
    }
    if (!isMatch) {
     
      const looksPlaintext = typeof user.password === "string" && !user.password.startsWith("$2");
      if (looksPlaintext && password === user.password) {
        const hashed = await bcrypt.hash(password, 10);
        user.password = hashed;
        await user.save();
        isMatch = true;
      }
    }
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful 🎉",
      token,
      user: {
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        userType: user.userType,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
