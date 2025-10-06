import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import skillBridgeLogo from "../assets/cd12bfb4f77c3986715b08d851b34fa45144098e.png";
import "./volunteer.css";
import Button from "./Button";

const VolunteerRegistrationForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    skills: "",
    location: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        { ...formData, userType: "volunteer" } 
      );
      toast.success(res.data.message || "Registered successfully");
      setFormData({
        fullName: "",
        username: "",
        email: "",
        password: "",
        skills: "",
        location: "",
      });
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="main">
      <Button />
      <div className="form-page">
        <div className="header">
          <img src={skillBridgeLogo} alt="SkillBridge logo" className="skillb" />
          <h2>Create an Account</h2>
          <p>Join SkillBridge - An App that connects skills and opportunities</p>
        </div>
        <p className="or-text">OR</p>
        <form onSubmit={handleSubmit}>
          <div className="form-fields">
            <div className="form-group">
              <p>Full Name *</p>
              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                required
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <p>Username *</p>
              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                required
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <p>E-mail *</p>
              <input
                type="email"
                name="email"
                placeholder="Enter your e-mail"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <p>Password *</p>
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <p>Skills *</p>
              <input
                type="text"
                name="skills"
                placeholder="E.g. teaching, design..."
                required
                value={formData.skills}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <p>Location</p>
              <input
                type="text"
                name="location"
                placeholder="Enter your location"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
          </div>
          <button className="createaccount" type="submit">
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default VolunteerRegistrationForm;
