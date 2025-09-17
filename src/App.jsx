import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import './App.css';
import NavBar from "./components/NavBar";
import { AuthProvider } from "./context/AuthContext";
import HistoryPage from "./pages/HistoryPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ResetPasswordWrapper from "./pages/ResetPassword";
import SignupPage from "./pages/SignupPage";
import PrivateRoute from "./routes/PrivateRoute";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <NavBar />
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/history"
            element={
              <PrivateRoute>
                <HistoryPage />
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/reset-password" element={<ResetPasswordWrapper />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
