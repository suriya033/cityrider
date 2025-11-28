import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import * as Location from 'expo-location';

export default function LocationPicker({ label, value, onChange, onLocationSelect, placeholder }) {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleGetCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Reverse geocode to get address
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const address = addressResponse[0]
        ? `${addressResponse[0].street || ''}, ${addressResponse[0].city || ''}, ${addressResponse[0].region || ''}`
        : `${latitude}, ${longitude}`;

      const locationData = {
        address: address.trim(),
        coordinates: { lat: latitude, lng: longitude },
      };

      setSelectedLocation(locationData);
      if (onChange) {
        onChange(locationData);
      } else if (onLocationSelect) {
        onLocationSelect(locationData);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
      console.error('Location error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label={label}
        value={value?.address || value || ''}
        onChangeText={(text) => {
          if (onChange) {
            onChange({ address: text, coordinates: {} });
          } else if (onLocationSelect) {
            onLocationSelect({ address: text, coordinates: {} });
          }
        }}
        mode="outlined"
        style={styles.input}
        placeholder={placeholder}
      />
      <Button
        mode="outlined"
        onPress={handleGetCurrentLocation}
        icon="crosshairs-gps"
        style={styles.locationButton}
      >
        Use Current Location
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  locationButton: {
    marginBottom: 8,
  },
});






