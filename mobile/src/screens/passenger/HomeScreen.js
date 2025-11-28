import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ImageBackground, Dimensions, RefreshControl } from 'react-native';
import { Text, Button, Card, ActivityIndicator, Dialog, Portal } from 'react-native-paper';
import { bookingsAPI } from '../../services/api';
import { format } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen({ navigation }) {
  const [activeBookings, setActiveBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentDialogVisible, setPaymentDialogVisible] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      loadActiveBookings();
    }, [])
  );

  const loadActiveBookings = async () => {
    try {
      const response = await bookingsAPI.getMyBookings();
      // Filter for confirmed or payment_processing bookings
      const active = response.data.filter(b => b.status === 'confirmed' || b.status === 'payment_processing');
      setActiveBookings(active);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadActiveBookings();
  };

  const openPaymentDialog = (bookingId) => {
    setSelectedBookingId(bookingId);
    setPaymentDialogVisible(true);
  };

  const handlePaymentSelection = async (method) => {
    try {
      // In a real app, you might navigate to a payment gateway here for 'Online'
      // For now, we just update the booking with the payment method and complete it
      await bookingsAPI.complete(selectedBookingId, { paymentMethod: method });
      setPaymentDialogVisible(false);
      loadActiveBookings();
      alert('Payment successful! Waiting for driver confirmation.');
    } catch (error) {
      console.error('Error completing booking:', error);
      alert('Failed to complete payment. Please try again.');
    }
  };

  const renderActiveBooking = ({ item }) => {
    if (!item?.rideId) return null;
    const ride = item.rideId;
    const formattedDate = ride.departureTime ? format(new Date(ride.departureTime), 'MMM dd, yyyy HH:mm') : 'N/A';
    const isPaymentProcessing = item.status === 'payment_processing';

    return (
      <Card style={styles.activeCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>Current Ride</Text>
          <View style={styles.routeContainer}>
            <Text variant="bodyLarge" style={styles.routeText}>
              {ride.origin?.address || 'Unknown'} → {ride.destination?.address || 'Unknown'}
            </Text>
          </View>
          <Text variant="bodyMedium" style={styles.dateText}>📅 {formattedDate}</Text>

          {ride.driverId && (
            <View style={styles.driverInfo}>
              <Text variant="bodyMedium">👤 Driver: {ride.driverId.name || 'Unknown Driver'}</Text>
            </View>
          )}

          {isPaymentProcessing ? (
            <Button
              mode="contained"
              disabled
              style={[styles.completeButton, { backgroundColor: '#9c27b0' }]}
              icon="clock-outline"
            >
              Waiting for Driver...
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={() => openPaymentDialog(item._id)}
              style={styles.completeButton}
              icon="check-circle"
            >
              Complete Ride
            </Button>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../../assets/bg1.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <View style={styles.content}>
        {/* Active Bookings Section - NOW AT THE TOP */}
        {!loading && activeBookings.length > 0 && (
          <View style={styles.activeBookingsContainer}>
            <Text variant="titleLarge" style={styles.sectionTitle}>Active Ride</Text>
            <FlatList
              data={activeBookings}
              renderItem={renderActiveBooking}
              keyExtractor={item => item._id}
              scrollEnabled={false} // Disable scrolling for this list so it fits in the parent view
              contentContainerStyle={styles.listContent}
            />
          </View>
        )}

        <Text variant="headlineMedium" style={styles.welcomeText}>Welcome to CityRider</Text>

        <Button
          mode="contained"
          onPress={() => navigation.navigate('Search')}
          style={styles.searchButton}
          icon="magnify"
        >
          Search for a Ride
        </Button>

        {loading && <ActivityIndicator style={{ marginTop: 20 }} />}
      </View>

      {/* Payment Selection Dialog */}
      <Portal>
        <Dialog visible={paymentDialogVisible} onDismiss={() => setPaymentDialogVisible(false)}>
          <Dialog.Title>Select Payment Method</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
              How would you like to pay for this ride?
            </Text>
            <Button
              mode="contained"
              onPress={() => handlePaymentSelection('Online')}
              style={{ marginBottom: 12, backgroundColor: '#6200ee' }}
              icon="credit-card"
            >
              Online Transaction
            </Button>
            <Button
              mode="contained"
              onPress={() => handlePaymentSelection('Cash')}
              style={{ backgroundColor: '#4caf50' }}
              icon="cash"
            >
              Cash on Delivery
            </Button>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPaymentDialogVisible(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  welcomeText: {
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  searchButton: {
    marginBottom: 30,
    backgroundColor: '#6200ee',
    paddingVertical: 6,
  },
  activeBookingsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  activeCard: {
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    color: '#6200ee',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  routeContainer: {
    marginBottom: 8,
  },
  routeText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  dateText: {
    color: '#666',
    marginBottom: 8,
  },
  driverInfo: {
    marginBottom: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  completeButton: {
    backgroundColor: '#4caf50',
  },
  listContent: {
    paddingBottom: 0,
  },
});
