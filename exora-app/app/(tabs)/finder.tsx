import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import MapViewWrapper from "@/components/MapViewWrapper";

export default function FinderScreen() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [showTripModal, setShowTripModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "all",
    priceRange: "all",
  });

  useEffect(() => {
    loadPublicTrips();
  }, []);

  const loadPublicTrips = async () => {
    try {
      setLoading(true);
      const response = await api.getPublicTrips();
      if (response.success || Array.isArray(response)) {
        setTrips(Array.isArray(response) ? response : response.data || []);
      }
    } catch (error) {
      console.error("Failed to load trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerPress = (trip: any) => {
    setSelectedTrip(trip);
    setShowTripModal(true);
  };

  const handleJoinRequest = async (tripId: string) => {
    try {
      const response = await api.sendTripJoinRequest(tripId, "");
      if (response.success) {
        Alert.alert("Success", "Join request sent!");
        setShowTripModal(false);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send join request");
    }
  };

  const filteredTrips = trips.filter((trip) => {
    if (filters.category !== "all" && trip.category !== filters.category) {
      return false;
    }
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>exora finder</Text>
          <Text style={styles.headerSubtitle}>
            Discover experiences near you
          </Text>
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="filter" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : (
          <MapViewWrapper
            trips={filteredTrips}
            onMarkerPress={handleMarkerPress}
          />
        )}
      </View>

      {/* Trip List */}
      <View style={styles.tripList}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filteredTrips.map((trip) => (
            <TouchableOpacity
              key={trip._id}
              style={styles.tripCard}
              onPress={() => {
                setSelectedTrip(trip);
                setShowTripModal(true);
              }}
            >
              <View style={styles.tripCardHeader}>
                <Text style={styles.tripTitle} numberOfLines={1}>
                  {trip.title || trip.name}
                </Text>
                <Text style={styles.tripLocation} numberOfLines={1}>
                  {trip.location?.name || trip.destination || "Unknown"}
                </Text>
              </View>
              <View style={styles.tripCardFooter}>
                <View style={styles.tripInfo}>
                  <Ionicons name="people" size={16} color="#666" />
                  <Text style={styles.tripInfoText}>
                    {trip.participants?.length || 0} participants
                  </Text>
                </View>
                <View style={styles.tripInfo}>
                  <Ionicons name="calendar" size={16} color="#666" />
                  <Text style={styles.tripInfoText}>
                    {trip.startDate
                      ? new Date(trip.startDate).toLocaleDateString()
                      : "TBD"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Trip Details Modal */}
      <Modal
        visible={showTripModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTripModal(false)}
      >
        {selectedTrip && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Trip Details</Text>
              <TouchableOpacity onPress={() => setShowTripModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalTripTitle}>
                {selectedTrip.title || selectedTrip.name}
              </Text>
              <View style={styles.modalTripInfo}>
                <View style={styles.modalInfoRow}>
                  <Ionicons name="location" size={20} color="#666" />
                  <Text style={styles.modalInfoText}>
                    {selectedTrip.location?.name ||
                      selectedTrip.destination ||
                      "Unknown"}
                  </Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <Ionicons name="calendar" size={20} color="#666" />
                  <Text style={styles.modalInfoText}>
                    {selectedTrip.startDate
                      ? new Date(selectedTrip.startDate).toLocaleDateString()
                      : "TBD"}
                  </Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <Ionicons name="people" size={20} color="#666" />
                  <Text style={styles.modalInfoText}>
                    {selectedTrip.participants?.length || 0} participants
                  </Text>
                </View>
              </View>
              {selectedTrip.description && (
                <Text style={styles.modalDescription}>
                  {selectedTrip.description}
                </Text>
              )}
              <TouchableOpacity
                style={styles.joinButton}
                onPress={() => handleJoinRequest(selectedTrip._id)}
              >
                <Text style={styles.joinButtonText}>Request to Join</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  filterButton: {
    padding: 4,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tripList: {
    height: 150,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  tripCard: {
    width: 280,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    marginLeft: 12,
  },
  tripCardHeader: {
    marginBottom: 12,
  },
  tripTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  tripLocation: {
    fontSize: 14,
    color: "#666",
  },
  tripCardFooter: {
    flexDirection: "row",
    gap: 16,
  },
  tripInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tripInfoText: {
    fontSize: 12,
    color: "#666",
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalTripTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 16,
  },
  modalTripInfo: {
    gap: 12,
    marginBottom: 16,
  },
  modalInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalInfoText: {
    fontSize: 16,
    color: "#000",
  },
  modalDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 24,
  },
  joinButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  joinButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
