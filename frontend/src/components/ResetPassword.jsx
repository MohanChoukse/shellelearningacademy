import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token") || "";
    const e = params.get("email") || "";
    setToken(t);
    setEmail(e);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    if (password !== confirm) {
      return toast.error("Passwords do not match");
    }
    setSubmitting(true);
    try {
      const body = { email, token, password };
      const res = await axios.post("http://localhost:5000/api/auth/reset-password", body);
      toast.success(res.data?.message || "Password reset successfully");
      navigate("/");
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to reset password";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="Enter new password"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="Confirm new password"
            required
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-60"
        >
          {submitting ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}


