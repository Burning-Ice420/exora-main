import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

export default function LabsScreen() {
  const { user } = useAuth();
  const [savedTrips, setSavedTrips] = useState<any[]>([]);
  const [savedBlocks, setSavedBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);

  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      setLoading(true);
      const [tripsResponse, blocksResponse] = await Promise.all([
        api.getTrips(),
        api.getMyBlocks(),
      ]);

      if (Array.isArray(tripsResponse)) {
        setSavedTrips(tripsResponse);
      } else if (tripsResponse.success) {
        setSavedTrips(tripsResponse.data || []);
      }

      if (Array.isArray(blocksResponse)) {
        setSavedBlocks(blocksResponse);
      } else if (blocksResponse.success) {
        setSavedBlocks(blocksResponse.data || []);
      }
    } catch (error) {
      console.error("Failed to load saved data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = () => {
    Alert.alert("Create Trip", "Trip creation feature coming soon!");
  };

  const handleCreateBlock = () => {
    Alert.alert("Create Block", "Block creation feature coming soon!");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>exora labs</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateTrip}
          >
            <Ionicons name="add" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Saved Trips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Trips</Text>
            {savedTrips.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="map-outline" size={48} color="#999" />
                <Text style={styles.emptyText}>No trips yet</Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={handleCreateTrip}
                >
                  <Text style={styles.emptyButtonText}>
                    Create Your First Trip
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {savedTrips.map((trip) => (
                  <TouchableOpacity
                    key={trip._id}
                    style={styles.tripCard}
                    onPress={() => setSelectedTrip(trip)}
                  >
                    <View style={styles.tripCardHeader}>
                      <Text style={styles.tripCardTitle} numberOfLines={1}>
                        {trip.title || trip.name || "Untitled Trip"}
                      </Text>
                      <Text style={styles.tripCardLocation} numberOfLines={1}>
                        {trip.location?.name || trip.destination || "Unknown"}
                      </Text>
                    </View>
                    <View style={styles.tripCardFooter}>
                      <View style={styles.tripCardInfo}>
                        <Ionicons name="calendar" size={14} color="#666" />
                        <Text style={styles.tripCardInfoText}>
                          {trip.startDate
                            ? new Date(trip.startDate).toLocaleDateString()
                            : "TBD"}
                        </Text>
                      </View>
                      {trip.budget && (
                        <View style={styles.tripCardInfo}>
                          <Ionicons name="cash" size={14} color="#666" />
                          <Text style={styles.tripCardInfoText}>
                            ₹{trip.budget}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Saved Blocks */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Blocks</Text>
            {savedBlocks.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="cube-outline" size={48} color="#999" />
                <Text style={styles.emptyText}>No blocks yet</Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={handleCreateBlock}
                >
                  <Text style={styles.emptyButtonText}>
                    Create Your First Block
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.blocksGrid}>
                {savedBlocks.map((block) => (
                  <TouchableOpacity key={block._id} style={styles.blockCard}>
                    <Text style={styles.blockCardTitle} numberOfLines={2}>
                      {block.title || block.name || "Untitled Block"}
                    </Text>
                    <Text style={styles.blockCardDescription} numberOfLines={2}>
                      {block.description || "No description"}
                    </Text>
                    <View style={styles.blockCardFooter}>
                      <Ionicons name="location" size={14} color="#666" />
                      <Text style={styles.blockCardLocation} numberOfLines={1}>
                        {block.location?.name || "Unknown"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}
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
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  createButton: {
    padding: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  tripCard: {
    width: 280,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
  },
  tripCardHeader: {
    marginBottom: 12,
  },
  tripCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  tripCardLocation: {
    fontSize: 14,
    color: "#666",
  },
  tripCardFooter: {
    flexDirection: "row",
    gap: 16,
  },
  tripCardInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tripCardInfoText: {
    fontSize: 12,
    color: "#666",
  },
  blocksGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  blockCard: {
    width: "47%",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
  },
  blockCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  blockCardDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 12,
  },
  blockCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  blockCardLocation: {
    fontSize: 12,
    color: "#666",
  },
});
