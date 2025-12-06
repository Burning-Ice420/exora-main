import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import api from "@/lib/api";

const TRAVEL_PREFERENCES = [
  { id: "adventure", label: "Adventure", emoji: "🏔️" },
  { id: "beach", label: "Beach", emoji: "🏖️" },
  { id: "culture", label: "Culture", emoji: "🏛️" },
  { id: "food", label: "Food", emoji: "🍜" },
  { id: "nightlife", label: "Nightlife", emoji: "🌃" },
  { id: "nature", label: "Nature", emoji: "🌿" },
  { id: "photography", label: "Photography", emoji: "📸" },
  { id: "wellness", label: "Wellness", emoji: "🧘" },
];

const PERSONALITY_TYPES = [
  {
    id: "explorer",
    label: "Explorer",
    description: "Always seeking new adventures",
    emoji: "🗺️",
  },
  {
    id: "planner",
    label: "Planner",
    description: "Loves organizing perfect trips",
    emoji: "📋",
  },
  {
    id: "spontaneous",
    label: "Spontaneous",
    description: "Goes with the flow",
    emoji: "🎲",
  },
  {
    id: "social",
    label: "Social",
    description: "Loves meeting new people",
    emoji: "👥",
  },
  {
    id: "solo",
    label: "Solo Traveler",
    description: "Prefers independent journeys",
    emoji: "🧳",
  },
  {
    id: "group",
    label: "Group Leader",
    description: "Enjoys organizing group trips",
    emoji: "👑",
  },
];

export default function SignupScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedProfilePhoto, setSelectedProfilePhoto] = useState<
    string | null
  >(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    age: "",
    location: "",
    bio: "",
    profileImage: null as string | null,
    travelPreferences: [] as string[],
    personalityType: "",
    interests: [] as string[],
  });

  const { register } = useAuth();
  const router = useRouter();

  const steps = [
    { title: "Basic Info", subtitle: "Let's start with the basics" },
    { title: "Profile", subtitle: "Tell us about yourself" },
    { title: "Travel Style", subtitle: "What kind of traveler are you?" },
    { title: "Preferences", subtitle: "What do you love to do?" },
  ];

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return "";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age >= 0 ? age.toString() : "";
  };

  const handleProfilePhoto = async () => {
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
        // Backend returns: { success: true, data: imageData }
        // API client normalizes to: { image: imageData }
        const imageData = uploadResult.image || uploadResult.data;
        const imageUrl = imageData?.secureUrl || imageData?.url;

        if (imageUrl) {
          setSelectedProfilePhoto(imageUrl);
          // Store the full image object for registration
          setFormData({
            ...formData,
            profileImage: imageData, // Send the full image object to backend
          });
        } else {
          throw new Error("Invalid image response");
        }
      } catch (error: any) {
        console.error("Upload failed:", error);
        setError(error.message || "Failed to upload image");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async () => {
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate required fields
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Prepare data exactly as backend expects
      const { dateOfBirth, confirmPassword, ...submitData } = formData;

      // Convert age to number if it exists
      if (formData.age) {
        submitData.age = parseInt(formData.age);
      }

      // Ensure profileImage is sent as object if it exists
      if (
        submitData.profileImage &&
        typeof submitData.profileImage === "string"
      ) {
        // If it's just a URL string, convert to object format
        submitData.profileImage = { url: submitData.profileImage };
      }

      const result = await register(submitData);

      if (result.success) {
        router.replace("/(tabs)/feed");
      } else {
        setError(result.error || "Registration failed");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                  }
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(text) =>
                    setFormData({ ...formData, email: text })
                  }
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
                  secureTextEntry
                  value={formData.password}
                  onChangeText={(text) =>
                    setFormData({ ...formData, password: text })
                  }
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  secureTextEntry
                  value={formData.confirmPassword}
                  onChangeText={(text) =>
                    setFormData({ ...formData, confirmPassword: text })
                  }
                />
              </View>
            </View>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY-MM-DD"
                value={formData.dateOfBirth}
                onChangeText={(text) => {
                  const age = calculateAge(text);
                  setFormData({ ...formData, dateOfBirth: text, age });
                }}
              />
              {formData.age ? (
                <Text style={styles.ageText}>
                  Age: {formData.age} years old
                </Text>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="location-outline"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Where are you based?"
                  value={formData.location}
                  onChangeText={(text) =>
                    setFormData({ ...formData, location: text })
                  }
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Profile Photo</Text>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={handleProfilePhoto}
              >
                {selectedProfilePhoto ? (
                  <Image
                    source={{ uri: selectedProfilePhoto }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="camera-outline" size={32} color="#666" />
                    <Text style={styles.photoText}>Add Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Tell us about yourself..."
                multiline
                numberOfLines={4}
                value={formData.bio}
                onChangeText={(text) => setFormData({ ...formData, bio: text })}
              />
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionTitle}>
              What kind of traveler are you?
            </Text>
            <View style={styles.grid}>
              {PERSONALITY_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.optionCard,
                    formData.personalityType === type.id &&
                      styles.optionCardSelected,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, personalityType: type.id })
                  }
                >
                  <Text style={styles.emoji}>{type.emoji}</Text>
                  <Text style={styles.optionLabel}>{type.label}</Text>
                  <Text style={styles.optionDescription}>
                    {type.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionTitle}>
              What do you love to do while traveling?
            </Text>
            <View style={styles.grid}>
              {TRAVEL_PREFERENCES.map((pref) => (
                <TouchableOpacity
                  key={pref.id}
                  style={[
                    styles.optionCard,
                    formData.travelPreferences.includes(pref.id) &&
                      styles.optionCardSelected,
                  ]}
                  onPress={() => {
                    const isSelected = formData.travelPreferences.includes(
                      pref.id
                    );
                    setFormData({
                      ...formData,
                      travelPreferences: isSelected
                        ? formData.travelPreferences.filter(
                            (id) => id !== pref.id
                          )
                        : [...formData.travelPreferences, pref.id],
                    });
                  }}
                >
                  <Text style={styles.emoji}>{pref.emoji}</Text>
                  <Text style={styles.optionLabel}>{pref.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>exora</Text>
          </View>
          <Text style={styles.title}>{steps[currentStep].title}</Text>
          <Text style={styles.subtitle}>{steps[currentStep].subtitle}</Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentStep + 1) / steps.length) * 100}%` },
            ]}
          />
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {renderStep()}

        <View style={styles.navigation}>
          <TouchableOpacity
            style={[
              styles.navButton,
              currentStep === 0 && styles.navButtonDisabled,
            ]}
            onPress={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={currentStep === 0 ? "#999" : "#007AFF"}
            />
            <Text
              style={[
                styles.navButtonText,
                currentStep === 0 && styles.navButtonTextDisabled,
              ]}
            >
              Previous
            </Text>
          </TouchableOpacity>

          {currentStep === steps.length - 1 ? (
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={() =>
                setCurrentStep(Math.min(steps.length - 1, currentStep + 1))
              }
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?{" "}
            <Text style={styles.linkText} onPress={() => router.push("/login")}>
              Sign in
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoContainer: {
    width: 64,
    height: 64,
    backgroundColor: "#007AFF20",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E5E5E5",
    borderRadius: 2,
    marginBottom: 24,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 2,
  },
  errorContainer: {
    backgroundColor: "#FF3B3020",
    borderColor: "#FF3B30",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
  },
  stepContainer: {
    marginBottom: 24,
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  dateInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#000",
  },
  ageText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  textArea: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#000",
    minHeight: 100,
    textAlignVertical: "top",
  },
  photoButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: "#F5F5F5",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  photoText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  optionCard: {
    width: "47%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E5E5",
    alignItems: "center",
    marginBottom: 12,
  },
  optionCardSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#007AFF10",
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  navButtonTextDisabled: {
    color: "#999",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  footer: {
    marginTop: 24,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#666",
  },
  linkText: {
    color: "#007AFF",
    fontWeight: "600",
  },
});
