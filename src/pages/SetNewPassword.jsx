import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../context/supabaseClient";

export default function SetNewPasswordPage({ accessToken }) {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!accessToken) {
      setError("Invalid or missing reset token.");
    }
  }, [accessToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!accessToken) return;

    setLoading(true);
    const { data, error } = await supabase.auth.updateUser(
      { password },
      { accessToken }
    );

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Password updated successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/");
      }, 3000);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-indigo-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
        <h2 className="text-center text-3xl font-bold text-gray-800">Set New Password</h2>
        {error && (
          <div className="text-red-500 text-center mb-4" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="text-green-600 text-center mb-4" role="alert">
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          <div>
            <label htmlFor="password" className="sr-only">
              New Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="sr-only">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              minLength={6}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !accessToken}
            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Updating..." : "Set Password"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Remembered your password?{" "}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
