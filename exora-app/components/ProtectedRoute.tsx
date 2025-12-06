import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!loading) {
      // Check if we're in auth screens (login, signup)
      const isAuthScreen = segments[0] === "login" || segments[0] === "signup";

      if (!isAuthenticated && !isAuthScreen) {
        // Redirect to login if not authenticated and not already on auth screen
        router.replace("/login");
      } else if (isAuthenticated && isAuthScreen) {
        // Redirect to feed if authenticated and trying to access auth pages
        router.replace("/(tabs)/feed");
      }
    }
  }, [isAuthenticated, loading, segments]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Don't render protected content if not authenticated (unless on auth screen)
  const isAuthScreen = segments[0] === "login" || segments[0] === "signup";
  if (!isAuthenticated && !isAuthScreen) {
    return null;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
