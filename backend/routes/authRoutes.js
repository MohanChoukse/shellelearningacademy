import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
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

    await user.save({ validateBeforeSave: false });


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
        await user.save({ validateBeforeSave: false });

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

/**
 * Forgot Password - send reset link
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const emailRaw = req.body?.email;
    const email = typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : "";
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: "If the email exists, a reset link has been sent" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes
    await user.save({ validateBeforeSave: false });


    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `${process.env.FRONTEND_BASE_URL || "http://localhost:5173"}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    const mailOptions = {
      from: `SkillBridge <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset your SkillBridge password",
      html: `<p>Click the link below to reset your password. This link expires in 15 minutes.</p>
             <p><a href="${resetUrl}">${resetUrl}</a></p>`,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Password reset link sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * Reset Password - verify token and set new password
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { email: rawEmail, token, password: newPassword } = req.body || {};
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: "Email, token and new password are required" });
    }

    const user = await User.findOne({ email, resetPasswordToken: token, resetPasswordExpires: { $gt: new Date() } });
    if (!user) return res.status(400).json({ message: "Invalid or expired reset token" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
