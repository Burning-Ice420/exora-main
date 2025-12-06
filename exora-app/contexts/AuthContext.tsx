import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "expo-router";
import api from "@/lib/api";

interface User {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  bio?: string;
  location?: string;
  age?: number;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (
    userData: any
  ) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (
    profileData: any
  ) => Promise<{ success: boolean; user?: User; error?: string }>;
  updatePreferences: (
    preferences: any
  ) => Promise<{ success: boolean; user?: User; error?: string }>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const token = await api.getToken();
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      const response = await api.getCurrentUser();
      // Backend returns: { status: 'success', user: {...} }
      if (
        response &&
        (response.status === "success" || response.user) &&
        response.user
      ) {
        setUser(response.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        await api.removeToken();
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setIsAuthenticated(false);
      await api.removeToken();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await api.login(email, password);

      // Backend returns: { status: 'success', token, user: {...} }
      if (response && response.status === "success" && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true, user: response.user };
      } else if (response && response.user) {
        // Fallback for backward compatibility
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true, user: response.user };
      } else {
        return { success: false, error: "Invalid response from server" };
      }
    } catch (error: any) {
      console.error("Login error:", error);
      return { success: false, error: error.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setLoading(true);

      // Prepare data exactly as backend expects
      const registerData: any = {
        email: userData.email,
        password: userData.password,
        name: userData.name,
      };

      // Add optional fields if they exist
      if (userData.age) registerData.age = parseInt(userData.age);
      if (userData.location) registerData.location = userData.location;
      if (userData.bio) registerData.bio = userData.bio;
      if (userData.personalityType)
        registerData.personalityType = userData.personalityType;
      if (userData.travelPreferences && userData.travelPreferences.length > 0) {
        registerData.travelPreferences = userData.travelPreferences;
      }
      if (userData.interests && userData.interests.length > 0) {
        registerData.interests = userData.interests;
      }
      if (userData.photos && userData.photos.length > 0) {
        registerData.photos = userData.photos;
      }
      // Backend expects profileImage as an object (from Cloudinary upload)
      if (userData.profileImage) {
        // If it's a string URL, convert to object format
        if (typeof userData.profileImage === "string") {
          registerData.profileImage = { url: userData.profileImage };
        } else {
          registerData.profileImage = userData.profileImage;
        }
      }

      const response = await api.register(registerData);

      // Backend returns: { status: 'success', token, user: {...} }
      if (response && response.status === "success" && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true, user: response.user };
      } else if (response && response.user) {
        // Fallback for backward compatibility
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true, user: response.user };
      } else {
        return { success: false, error: "Invalid response from server" };
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      return { success: false, error: error.message || "Registration failed" };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      await api.removeToken();
      router.replace("/login");
    }
  };

  const updateProfile = async (profileData: any) => {
    try {
      const response = await api.updateProfile(profileData);
      // Backend returns: { status: 'success', user: {...} }
      const updatedUser = response.user || response;

      if (updatedUser) {
        setUser(updatedUser);
        return { success: true, user: updatedUser };
      } else {
        return { success: false, error: "No user data received" };
      }
    } catch (error: any) {
      console.error("Update profile error:", error);
      return { success: false, error: error.message || "Update failed" };
    }
  };

  const updatePreferences = async (preferences: any) => {
    try {
      const updatedUser = await api.updatePreferences(preferences);
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error: any) {
      return { success: false, error: error.message || "Update failed" };
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    updatePreferences,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
