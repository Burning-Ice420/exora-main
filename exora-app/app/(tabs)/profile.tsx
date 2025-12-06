import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import api from "@/lib/api";
import * as ImagePicker from "expo-image-picker";

export default function ProfileScreen() {
  const { user, logout, updateProfile } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    trips: 0,
    connections: 0,
    experiences: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
    location: "",
    age: "",
  });
  const [connections, setConnections] = useState<any[]>([]);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [tripsData, connectionsData, experiencesData] = await Promise.all([
        api.getTrips(),
        api.getConnections(),
        api.getExperiences({ user: user._id }),
      ]);

      const connections =
        connectionsData.connections ||
        connectionsData.data ||
        connectionsData ||
        [];

      setStats({
        trips: Array.isArray(tripsData) ? tripsData.length : 0,
        connections: connections.length || 0,
        experiences: Array.isArray(experiencesData)
          ? experiencesData.length
          : 0,
      });

      setConnections(
        connections.filter((conn: any) => conn.status === "accepted")
      );
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setEditForm({
      name: user?.name || "",
      bio: user?.bio || "",
      location: user?.location || "",
      age: user?.age?.toString() || "",
    });
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    try {
      setUploading(true);
      const result = await updateProfile(editForm);
      if (result.success) {
        setShowEditModal(false);
        setIsEditMode(false);
        Alert.alert("Success", "Profile updated successfully!");
      } else {
        Alert.alert("Error", result.error || "Failed to update profile");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setUploading(false);
    }
  };

  const handleProfileImageUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setUploading(true);
      try {
        const uploadResult = await api.uploadProfileImage(result.assets[0].uri);
        const updatedUser = await updateProfile({
          profileImage:
            uploadResult.image?.secureUrl || uploadResult.image?.url,
        });
        if (updatedUser.success) {
          Alert.alert("Success", "Profile image updated!");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to upload image");
      } finally {
        setUploading(false);
      }
    }
  };

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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <TouchableOpacity
            onPress={handleProfileImageUpload}
            disabled={uploading}
          >
            <Image
              source={{
                uri:
                  user?.profileImage?.secureUrl ||
                  user?.profileImage?.url ||
                  user?.profileImage ||
                  "https://via.placeholder.com/100",
              }}
              style={styles.profileImage}
            />
            {uploading && (
              <View style={styles.uploadOverlay}>
                <ActivityIndicator color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || "User"}</Text>
            <Text style={styles.profileLocation}>
              {user?.location || "No location set"}
            </Text>
            {user?.bio && <Text style={styles.profileBio}>{user.bio}</Text>}
          </View>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Ionicons name="create-outline" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.trips}</Text>
          <Text style={styles.statLabel}>Trips</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.connections}</Text>
          <Text style={styles.statLabel}>Connections</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.experiences}</Text>
          <Text style={styles.statLabel}>Experiences</Text>
        </View>
      </View>

      {/* Connections */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connections</Text>
        {connections.length === 0 ? (
          <Text style={styles.emptyText}>No connections yet</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {connections.map((conn: any) => {
              const connectedUser =
                conn.userId?._id === user?._id
                  ? conn.connectedUserId
                  : conn.userId;
              return (
                <TouchableOpacity key={conn._id} style={styles.connectionCard}>
                  <Image
                    source={{
                      uri:
                        connectedUser?.profileImage?.secureUrl ||
                        connectedUser?.profileImage?.url ||
                        "https://via.placeholder.com/60",
                    }}
                    style={styles.connectionImage}
                  />
                  <Text style={styles.connectionName} numberOfLines={1}>
                    {connectedUser?.name || "Unknown"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
          <Text style={styles.actionButtonTextDanger}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSaveProfile} disabled={uploading}>
              <Text
                style={[
                  styles.modalSave,
                  uploading && styles.modalSaveDisabled,
                ]}
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={editForm.name}
                onChangeText={(text) =>
                  setEditForm({ ...editForm, name: text })
                }
                placeholder="Enter your name"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editForm.bio}
                onChangeText={(text) => setEditForm({ ...editForm, bio: text })}
                placeholder="Tell us about yourself"
                multiline
                numberOfLines={4}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={editForm.location}
                onChangeText={(text) =>
                  setEditForm({ ...editForm, location: text })
                }
                placeholder="Enter your location"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                value={editForm.age}
                onChangeText={(text) => setEditForm({ ...editForm, age: text })}
                placeholder="Enter your age"
                keyboardType="numeric"
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F5F5F5",
  },
  uploadOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  profileLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 14,
    color: "#000",
    lineHeight: 20,
  },
  editButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    padding: 20,
  },
  connectionCard: {
    alignItems: "center",
    marginRight: 16,
    width: 80,
  },
  connectionImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F5F5F5",
    marginBottom: 8,
  },
  connectionName: {
    fontSize: 12,
    color: "#000",
    textAlign: "center",
  },
  actions: {
    padding: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  actionButtonTextDanger: {
    fontSize: 16,
    color: "#FF3B30",
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  modalCancel: {
    fontSize: 16,
    color: "#666",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  modalSave: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  modalSaveDisabled: {
    opacity: 0.5,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#000",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
});
