import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getCurrentUser } from './supabaseClient';
import { toast } from 'react-hot-toast';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking authentication:', error);
        if (error.message === 'Supabase not configured') {
          setIsConfigured(false);
        }
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          toast.success('Signed in successfully!');
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          toast.success('Signed out successfully!');
        }
      }
    );

    checkUser();

    // Clean up subscription on unmount
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error.message);
      if (error.message === 'Supabase not configured') {
        setIsConfigured(false);
      }
      toast.error('Error signing out');
    }
  };

  // Context value
  const value = {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
    isConfigured,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}