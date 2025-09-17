import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await login(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="absolute top-0 w-full flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-indigo-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center justify-center mb-6">
            <svg
              className="w-10 h-10 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.636 5.636a9 9 0 0112.728 0m-2.828 9.9a5 5 0 01-7.072 0"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            <span className="ml-3 text-3xl font-bold text-gray-800">AudioTex</span>
          </div>
          <h2 className="text-center text-3xl font-bold text-gray-800">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please enter your details to Login.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} autoComplete="off">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label className="sr-only" htmlFor="email-address">Email address</label>
              <input
                autoComplete="email"
                className="appearance-none rounded-t-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                id="email-address"
                name="email"
                placeholder="Email address"
                required
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="sr-only" htmlFor="password">Password</label>
              <input
                autoComplete="current-password"
                className="appearance-none rounded-b-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                id="password"
                name="password"
                placeholder="Password"
                required
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-end">
            <div className="text-sm">
              <Link to="/reset-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </Link>
            </div>
          </div>
          <div>
            <button
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </div>
          {error && <div className="text-red-500 text-sm mt-2 text-center">{error}</div>}
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?
          <Link className="font-medium text-indigo-600 hover:text-indigo-500 ml-1" to="/signup">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
