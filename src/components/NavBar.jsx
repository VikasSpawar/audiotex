import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { isAuthenticated, logout, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  //get route from router-dom hook to highlight the active link
  const { pathname } = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  return (
    <header className="z-20 flex sticky top-0 items-center justify-between whitespace-nowrap px-6 sm:px-10 py-6 md:py-4 ">
      <div className="flex items-center gap-3">
        <Link className="flex rounded-full px-3 py-2 shadow-md bg-white" to="/">
          <div className="size-8 text-primary">
        <svg
              className="w-8 h-8 text-indigo-600"
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
          </div>
          <h2 className="text-primary text-2xl font-bold tracking-wider ml-2">
            AudioTex
          </h2>
        </Link>
      </div>

      {/* Desktop nav */}
      <nav className="hidden md:flex shadow-md group items-center gap-2 text-sm font-medium rounded-full px-3 py-2 bg-white">
        {isAuthenticated ? (
          <>
            <Link
              to="/"
              className={`text-secondary hover:text-primary transition ${
                pathname === "/"
                  ? " ring-2 ring-primary  "
                  : ""
              }rounded-full font-bold px-4 py-2`}
            >
              Home
            </Link>
            <Link
              to="/history"
              className={`
                text-secondary
                 hover:text-primary
                  transition 
                  ${
                    pathname === "/history"
                      ? " ring-2 ring-primary "
                      : ""
                  } font-bold px-4 py-2 rounded-full` }
            >
              History
            </Link>
            <button
              onClick={logout}
              className="cursor-pointer px-2  py-2 text-secondary hover:text-primary transition"
            >
              Logout
            </button>
            <button className="bg-primary text-white text-3xl h-10 rounded-full px-6 font-semibold hover:opacity-90 shadow-md transition-opacity duration-200">
              {user?.user_metadata?.firstName || user?.email[0].toUpperCase()}
            </button>
            <div
              className="z-20 absolute top-2 -right-20 -translate-x-1/2 px-3 py-1 text-sm text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap"
              aria-hidden="true"
            >
              <div className="text-xs">{user?.email}</div>
            </div>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className={`${pathname=="/login"&&'bg-primary text-white hover:text-white/90'} text-secondary hover:text-primary transition px-6 py-2 border rounded-full`}
            >
              Login
            </Link>
            <Link
              to="/signup"
              className={`${pathname=='/signup'&&'bg-primary text-white hover:text-white/90'} text-secondary hover:text-primary transition px-6 py-2 border rounded-full`}
            >
              Signup
            </Link>
          </>
        )}
      </nav>

      {/* Mobile menu button */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden text-secondary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
        aria-label="Toggle menu"
        aria-expanded={mobileMenuOpen}
      >
        <i className="material-icons">{mobileMenuOpen ? "close" : "menu"}</i>
      </button>

      {/* Mobile nav */}
      {mobileMenuOpen && (
        <nav
          className="absolute top-full left-0 right-0 bg-white shadow-md rounded-b-lg p-4 flex flex-col gap-4 md:hidden z-30"
          role="menu"
        >
          {isAuthenticated ? (
            <>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-secondary hover:text-primary transition px-4 py-2 rounded"
                role="menuitem"
              >
                Home
              </Link>
              <Link
                to="/history"
                onClick={() => setMobileMenuOpen(false)}
                className="text-secondary hover:text-primary transition px-4 py-2 rounded"
                role="menuitem"
              >
                History
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="text-secondary hover:text-primary transition px-4 py-2 text-left rounded"
                role="menuitem"
              >
                Logout
              </button>
              <div className="px-4 py-2 bg-primary text-white rounded text-center font-semibold">
                {user?.user_metadata?.firstName || user?.email[0].toUpperCase()}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-secondary hover:text-primary transition px-4 py-2 border rounded text-center"
                role="menuitem"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="text-secondary hover:text-primary transition px-4 py-2 border rounded text-center"
                role="menuitem"
              >
                Signup
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
