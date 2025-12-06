import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { theme, setTheme, actualTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(false);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Not Available",
              "Account deletion is not available yet."
            );
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="person-outline" size={20} color="#666" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Email</Text>
              <Text style={styles.settingValue}>
                {user?.email || "Not set"}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Change Password</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="moon-outline" size={20} color="#666" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Theme</Text>
              <Text style={styles.settingValue}>
                {theme === "system"
                  ? "System"
                  : theme === "dark"
                  ? "Dark"
                  : "Light"}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              const themes: ("light" | "dark" | "system")[] = [
                "light",
                "dark",
                "system",
              ];
              const currentIndex = themes.indexOf(theme);
              const nextIndex = (currentIndex + 1) % themes.length;
              setTheme(themes[nextIndex]);
            }}
          >
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications-outline" size={20} color="#666" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: "#E5E5E5", true: "#007AFF" }}
            thumbColor="#fff"
          />
        </View>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Location Sharing</Text>
            </View>
          </View>
          <Switch
            value={locationSharing}
            onValueChange={setLocationSharing}
            trackColor={{ false: "#E5E5E5", true: "#007AFF" }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#666"
            />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>App Version</Text>
              <Text style={styles.settingValue}>1.0.0</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="document-text-outline" size={20} color="#666" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Terms of Service</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#666" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Privacy Policy</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <TouchableOpacity
          style={[styles.settingItem, styles.dangerItem]}
          onPress={handleLogout}
        >
          <View style={styles.settingInfo}>
            <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, styles.dangerText]}>
                Logout
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#FF3B30" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.settingItem, styles.dangerItem]}
          onPress={handleDeleteAccount}
        >
          <View style={styles.settingInfo}>
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, styles.dangerText]}>
                Delete Account
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  dangerItem: {
    borderBottomColor: "#FFE5E5",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  settingValue: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  dangerText: {
    color: "#FF3B30",
  },
});
