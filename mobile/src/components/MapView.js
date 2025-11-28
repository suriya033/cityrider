import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';

export default function RideMapView({ origin, destination, route }) {
  const [userLocation, setUserLocation] = useState(null);
  const [region, setRegion] = useState(null);

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (origin.coordinates?.lat && destination.coordinates?.lng) {
      const coordinates = [
        {
          latitude: origin.coordinates.lat,
          longitude: origin.coordinates.lng,
        },
        {
          latitude: destination.coordinates.lat,
          longitude: destination.coordinates.lng,
        },
      ];

      const midLat = (origin.coordinates.lat + destination.coordinates.lat) / 2;
      const midLng = (origin.coordinates.lng + destination.coordinates.lng) / 2;

      setRegion({
        latitude: midLat,
        longitude: midLng,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      });
    }
  }, [origin, destination]);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  if (!region) {
    return null;
  }

  const originCoords = origin.coordinates?.lat
    ? {
        latitude: origin.coordinates.lat,
        longitude: origin.coordinates.lng,
      }
    : null;

  const destinationCoords = destination.coordinates?.lat
    ? {
        latitude: destination.coordinates.lat,
        longitude: destination.coordinates.lng,
      }
    : null;

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={region} showsUserLocation={true}>
        {originCoords && (
          <Marker
            coordinate={originCoords}
            title="Origin"
            description={origin.address}
            pinColor="green"
          />
        )}
        {destinationCoords && (
          <Marker
            coordinate={destinationCoords}
            title="Destination"
            description={destination.address}
            pinColor="red"
          />
        )}
        {originCoords && destinationCoords && (
          <Polyline
            coordinates={[originCoords, destinationCoords]}
            strokeColor="#6200ee"
            strokeWidth={3}
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    width: '100%',
    marginVertical: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
});






