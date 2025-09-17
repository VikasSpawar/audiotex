import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SignupPage() {
  const { signup } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signup(email, password, firstName, lastName);

    if (res?.error) {
      setError(res.error.message);
      setLoading(false);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="top-0 absolute w-full flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-indigo-100">
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
            Create Your Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please fill in the details below to sign up.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} autoComplete="off">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="first-name" className="sr-only">First Name</label>
              <input
                id="first-name"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                className="appearance-none rounded-t-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="last-name" className="sr-only">Last Name</label>
              <input
                id="last-name"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="appearance-none rounded-b-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign up"}
          </button>
          {error && <div className="text-red-500 text-sm mt-2 text-center">{error}</div>}
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 ml-1">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
