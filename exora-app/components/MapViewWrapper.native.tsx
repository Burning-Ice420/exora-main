import React, { useEffect, useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface MapViewWrapperProps {
  trips: any[];
  onMarkerPress: (trip: any) => void;
}

export default function MapViewWrapper({
  trips,
  onMarkerPress,
}: MapViewWrapperProps) {
  const [MapView, setMapView] = useState<any>(null);
  const [Marker, setMarker] = useState<any>(null);

  useEffect(() => {
    if (Platform.OS !== "web") {
      try {
        const Maps = require("react-native-maps");
        setMapView(Maps.default || Maps);
        setMarker(Maps.Marker);
      } catch (error) {
        console.warn("react-native-maps not available:", error);
      }
    }
  }, []);

  if (!MapView) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="map-outline" size={64} color="#999" />
      </View>
    );
  }

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: 15.2993,
        longitude: 74.124,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }}
    >
      {trips.map((trip) => {
        const location = trip.location || trip.destination;
        if (location?.coordinates) {
          return (
            <Marker
              key={trip._id}
              coordinate={{
                latitude: location.coordinates[1],
                longitude: location.coordinates[0],
              }}
              onPress={() => onMarkerPress(trip)}
            >
              <View style={styles.markerContainer}>
                <Ionicons name="location" size={32} color="#007AFF" />
              </View>
            </Marker>
          );
        }
        return null;
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});
