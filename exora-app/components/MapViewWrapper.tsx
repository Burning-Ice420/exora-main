import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface MapViewWrapperProps {
  trips: any[];
  onMarkerPress: (trip: any) => void;
}

// This component will be replaced on native platforms
export default function MapViewWrapper({
  trips,
  onMarkerPress,
}: MapViewWrapperProps) {
  if (Platform.OS === "web") {
    return (
      <View style={styles.webMapPlaceholder}>
        <Ionicons name="map-outline" size={64} color="#999" />
        <Text style={styles.webMapText}>Map view available on mobile</Text>
        <Text style={styles.webMapSubtext}>{trips.length} trips available</Text>
      </View>
    );
  }

  // On native, this will be replaced by the actual map component
  return (
    <View style={styles.webMapPlaceholder}>
      <Ionicons name="map-outline" size={64} color="#999" />
      <Text style={styles.webMapText}>Loading map...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  webMapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  webMapText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  webMapSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#999",
  },
});
