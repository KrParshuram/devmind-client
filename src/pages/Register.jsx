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

      dispatch(
        setCredentials({
          token: response.data.token,
          user: response.data.user,
        })
      );

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
    <div className="flex justify-center px-4">

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-7">

        {/* Header */}
        <div className="text-center mb-6">

          <div className="flex justify-center mb-3">
            <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-xl">
              🧠
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white">
            Create Your Account
          </h1>

          <p className="text-sm text-slate-400 mt-2">
            Start building your developer second brain
          </p>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              autoComplete="name"
              className="
                w-full
                bg-slate-950
                border border-slate-700
                rounded-lg
                px-4 py-2.5
                text-white
                placeholder:text-slate-600
                outline-none
                transition
                focus:border-indigo-500
                focus:ring-2
                focus:ring-indigo-500/20
              "
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              className="
                w-full
                bg-slate-950
                border border-slate-700
                rounded-lg
                px-4 py-2.5
                text-white
                placeholder:text-slate-600
                outline-none
                transition
                focus:border-indigo-500
                focus:ring-2
                focus:ring-indigo-500/20
              "
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              autoComplete="new-password"
              className="
                w-full
                bg-slate-950
                border border-slate-700
                rounded-lg
                px-4 py-2.5
                text-white
                placeholder:text-slate-600
                outline-none
                transition
                focus:border-indigo-500
                focus:ring-2
                focus:ring-indigo-500/20
              "
            />

            <p className="text-xs text-slate-500 mt-1.5">
              Minimum 6 characters.
            </p>
          </div>

          {/* Register */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-indigo-600
              text-white
              py-2.5
              rounded-lg
              font-medium
              hover:bg-indigo-500
              transition
              disabled:opacity-50
              disabled:cursor-not-allowed
              mt-1
            "
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

        {/* Login */}
        <div className="mt-5 pt-5 border-t border-slate-800 text-center">

          <p className="text-sm text-slate-500">
            Already have an account?
          </p>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="
              mt-1.5
              text-indigo-400
              font-medium
              hover:text-indigo-300
              transition
            "
          >
            Login to Your Account
          </button>

        </div>

      </div>

    </div>
  );
}