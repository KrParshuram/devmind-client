import { useState } from "react";
import api from "../api/axios.js";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post(
        "/api/auth/login",
        formData
      );

      dispatch(
        setCredentials({
          token: response.data.token,
          user: response.data.user || response.data.email,
        })
      );

      navigate("/dashboard");

    } catch (err) {
      console.error("Login Error:", err.response?.data || err.message);

      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center px-4">

      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-6">

          <div className="mx-auto mb-3 w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-xl">
            🧠
          </div>

          <h1 className="text-2xl font-bold text-white">
            Welcome back
          </h1>

          <p className="text-sm text-slate-400 mt-1">
            Sign in to DevMind
          </p>

        </div>


        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

          {/* Error */}
          {error && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* Email */}
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">
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
                  px-3.5 py-2.5
                  rounded-lg
                  bg-slate-950
                  border border-slate-700
                  text-white
                  text-sm
                  placeholder:text-slate-600
                  outline-none
                  focus:border-indigo-500
                  focus:ring-1
                  focus:ring-indigo-500
                "
              />
            </div>


            {/* Password */}
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="
                  w-full
                  px-3.5 py-2.5
                  rounded-lg
                  bg-slate-950
                  border border-slate-700
                  text-white
                  text-sm
                  placeholder:text-slate-600
                  outline-none
                  focus:border-indigo-500
                  focus:ring-1
                  focus:ring-indigo-500
                "
              />
            </div>


            {/* Login */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                py-2.5
                rounded-lg
                bg-indigo-600
                hover:bg-indigo-500
                text-white
                text-sm
                font-medium
                transition
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

          </form>


          {/* Register */}
          <div className="mt-5 pt-4 border-t border-slate-800 text-center">

            <span className="text-sm text-slate-500">
              Don't have an account?
            </span>

            <button
              type="button"
              onClick={() => navigate("/register")}
              className="ml-1 text-sm text-indigo-400 hover:text-indigo-300"
            >
              Create account
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}