
import { useState } from "react";
import api from "../api/axios.js";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // Handle registration
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post(
        "/api/auth/signup",
        formData
      );

      console.log("Registration response:", response.data);

      // Save authentication information
      dispatch(
        setCredentials({
          token: response.data.token,
          user: response.data.user,
        })
      );

      // Redirect to dashboard
      navigate("/dashboard");

    } catch (err) {
      console.error(
        "Registration Error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center  px-4">

      {/* Register Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">

        {/* Header */}
        <div className="text-center mb-8">

          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl">
              🧠
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-800">
            Create Your Account
          </h1>

          <p className="text-gray-500 mt-2">
            Start building your personal knowledge base
          </p>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form
          className="flex flex-col gap-5"
          onSubmit={handleSubmit}
        >

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              autoComplete="new-password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

            <p className="text-xs text-gray-400 mt-2">
              Password must contain at least 6 characters.
            </p>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        {/* Login */}
        <div className="mt-6 text-center">

          <p className="text-sm text-gray-500">
            Already have an account?
          </p>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-2 text-indigo-600 font-medium hover:text-indigo-700 transition"
          >
            Login to Your Account
          </button>

        </div>

      </div>
    </div>
  );
}

