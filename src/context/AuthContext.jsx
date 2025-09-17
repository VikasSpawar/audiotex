import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // NEW: track session loading

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

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.session) {
      setUser({ ...data.session.user, access_token: data.session.access_token });
    }
    return { data, error };
  };

const signup = async (email, password, firstName, lastName) => {
  const { data, error } = await supabase.auth.signUp({
    email: email,       // <- must be string
    password: password, // <- must be string
  });

  if (!error && data.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      first_name: firstName,
      last_name: lastName,
    });
    setUser({ ...data.user, access_token: data.session?.access_token });
  }

  return { data, error };
};


  const logout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  const resetPassword = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + "/reset-password" // Or your desired route
  });
  return { data, error };
};


  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, signup, logout , resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
