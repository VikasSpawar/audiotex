import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Track session loading
  const [authLoading, setAuthLoading] = useState(false); // For login/signup/reset actions

  // Fetch current session on mount and listen to auth state changes
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ? { ...session.user, access_token: session.access_token } : null);
      setLoading(false);
    };

    fetchSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { ...session.user, access_token: session.access_token } : null);
      setLoading(false);
    });

    return () => listener?.subscription?.unsubscribe();
  }, []);

  // Login with email and password
  const login = async (email, password) => {
    setAuthLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.session) {
      setUser({ ...data.session.user, access_token: data.session.access_token });
    }
    setAuthLoading(false);
    return { data, error };
  };

  // Signup with profile creation
  const signup = async (email, password, firstName, lastName) => {
    setAuthLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (!error && data.user) {
      // Upsert profile info
      await supabase.from("profiles").upsert({
        id: data.user.id,
        first_name: firstName,
        last_name: lastName,
      });
      // Note: access_token may be undefined until email confirmed/login
      setUser({ ...data.user, access_token: data.session?.access_token });
    }
    setAuthLoading(false);
    return { data, error };
  };

  // Logout user
  const logout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  // Request password reset link via email
  const resetPassword = async (email) => {
    setAuthLoading(true);
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password"
    });
    setAuthLoading(false);
    return { data, error };
  };

  // Change password for logged-in users
  const changePassword = async (newPassword) => {
    setAuthLoading(true);
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    // Optionally refresh user state or fetch updated user data if needed here
    setAuthLoading(false);
    return { data, error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,         // Session loading state
        authLoading,     // Action loading (login/signup/reset/change)
        login,
        signup,
        logout,
        resetPassword,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook for consuming auth context
export function useAuth() {
  return useContext(AuthContext);
}
