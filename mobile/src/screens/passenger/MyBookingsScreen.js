import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { Card, Text, Button, Chip, ActivityIndicator, Portal, Modal } from 'react-native-paper';
import { bookingsAPI } from '../../services/api';
import { format } from 'date-fns';
import { ListSkeleton } from '../../components/SkeletonLoader';

export default function MyBookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await bookingsAPI.getMyBookings();
      const now = new Date();
      const filtered = response.data.filter(b => {
        if (b.status !== 'completed') return true;
        // Use ride departure time or a completedAt field if available
        const dateStr = b.completedAt || (b.rideId && b.rideId.departureTime);
        if (!dateStr) return false;
        const rideDate = new Date(dateStr);
        const diffHours = (now - rideDate) / (1000 * 60 * 60);
        return diffHours < 24; // keep if less than 24h old
      });
      setBookings(filtered);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await bookingsAPI.cancel(bookingId);
      loadBookings();
    } catch (error) {
      console.error('Error canceling booking:', error);
    }
  };

  const handleCompleteBooking = (bookingId) => {
    setSelectedBookingId(bookingId);
    setPaymentModalVisible(true);
  };

  const confirmCompletion = async (paymentMethod) => {
    try {
      await bookingsAPI.complete(selectedBookingId, { paymentMethod });
      setPaymentModalVisible(false);
      setSelectedBookingId(null);
      loadBookings();
      Alert.alert('Success', 'Payment recorded. Ride will appear in Ride History.');
    } catch (error) {
      console.error('Error completing booking:', error);
      Alert.alert('Error', 'Failed to complete ride');
    }
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return '#4caf50';
      case 'accepted':
        return '#00bcd4';
      case 'registered':
        return '#2196f3';
      case 'pending':
        return '#ff9800';
      case 'canceled':
        return '#f44336';
      case 'completed':
        return '#9e9e9e';
      default:
        return '#666';
    }
  };

  const getStatusBackgroundColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'rgba(76, 175, 80, 0.12)';
      case 'accepted':
        return 'rgba(0, 188, 212, 0.12)';
      case 'registered':
        return 'rgba(33, 150, 243, 0.12)';
      case 'pending':
        return 'rgba(255, 152, 0, 0.12)';
      case 'canceled':
        return 'rgba(244, 67, 54, 0.12)';
      case 'completed':
        return 'rgba(158, 158, 158, 0.12)';
      default:
        return 'rgba(102, 102, 102, 0.12)';
    }
  };

  const renderBookingItem = React.useCallback(({ item }) => {
    if (!item || !item.rideId) return null;

    const ride = item.rideId;

    // Safety checks for required fields
    if (!ride.departureTime || !ride.origin || !ride.destination) return null;

    const formattedDate = format(new Date(ride.departureTime), 'MMM dd, yyyy HH:mm');

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium" style={styles.route}>
              {ride.origin?.address || 'Unknown'} → {ride.destination?.address || 'Unknown'}
            </Text>
            <Chip
              mode="flat"
              style={{ backgroundColor: getStatusBackgroundColor(item.status) }}
              textStyle={{ color: getStatusColor(item.status) }}
            >
              {item.status?.toUpperCase() || 'UNKNOWN'}
            </Chip>
          </View>

          <View style={styles.details}>
            <Text variant="bodyMedium">📅 {formattedDate}</Text>
            <Text variant="bodyMedium">💺 Seats: {item.seatsBooked || 0}</Text>
            <Text variant="bodyMedium">💰 Amount: ₹{item.totalAmount || 0}</Text>
            {ride.driverId && (
              <>
                <Text variant="bodyMedium">👤 Driver: {ride.driverId.name || 'Unknown'}</Text>
                {ride.driverId.uniqueId && (
                  <Text variant="bodyMedium" style={{ fontWeight: 'bold', color: '#1976d2' }}>
                    🆔 Driver ID: {ride.driverId.uniqueId}
                  </Text>
                )}
              </>
            )}
          </View>

          {/* Show OTP for registered or accepted bookings */}
          {(item.status === 'registered' || item.status === 'accepted') && item.verificationCode && (
            <View style={styles.otpContainer}>
              <Text variant="labelSmall" style={styles.otpLabel}>
                {item.status === 'registered' ? 'Verification Code (Share with Driver)' : 'Verification Code'}
              </Text>
              <Text variant="headlineMedium" style={styles.otpCode}>
                {item.verificationCode}
              </Text>
              {item.status === 'accepted' && (
                <Text variant="bodySmall" style={styles.otpHint}>
                  Driver will enter this code to start the ride
                </Text>
              )}
            </View>
          )}

          {(item.status === 'pending' || item.status === 'registered') && (
            <Button
              mode="outlined"
              onPress={() => handleCancelBooking(item._id)}
              style={styles.cancelButton}
            >
              Cancel Booking
            </Button>
          )}

          {item.status === 'confirmed' && (
            <>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('RideProgress', { booking: item })}
                style={styles.progressButton}
                icon="map-marker-path"
              >
                View Ride Progress
              </Button>
              <Button
                mode="contained"
                onPress={() => handleCompleteBooking(item._id)}
                style={styles.completeButton}
                icon="check-circle"
              >
                Complete Ride
              </Button>
            </>
          )}

          {ride.driverId && (
            <Button
              mode="text"
              onPress={() =>
                navigation.navigate('Chat', {
                  userId: ride.driverId._id,
                  rideId: ride._id,
                  userName: ride.driverId?.name || 'Driver',
                })
              }
              icon="message"
            >
              Message Driver
            </Button>
          )}
        </Card.Content>
      </Card>
    );
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>My Bookings</Text>
        <ListSkeleton count={3} type="booking" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../../assets/bg1.jpg')}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: Dimensions.get('window').width,
          height: Dimensions.get('window').height,
        }}
        resizeMode="cover"
      />

      {/* FIXED HEADER - Does not scroll */}
      <View style={styles.headerContainer}>
        <Text variant="headlineMedium" style={styles.headerTitle}>My Trips</Text>
      </View>

      {/* SCROLLABLE BOOKINGS LIST */}
      <FlatList
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Card style={styles.emptyCard}>
              <Card.Content style={{ alignItems: 'center' }}>
                <Text variant="titleMedium" style={{ marginBottom: 8 }}>No bookings yet</Text>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  Search for rides to get started on your journey!
                </Text>
              </Card.Content>
            </Card>
          </View>
        }
      />

      <Portal>
        <Modal
          visible={paymentModalVisible}
          onDismiss={() => setPaymentModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>Select Payment Method</Text>
          <Text variant="bodyMedium" style={{ marginBottom: 20, textAlign: 'center' }}>
            How did you pay for this ride?
          </Text>

          <Button
            mode="contained"
            onPress={() => confirmCompletion('Online Transfer')}
            style={styles.modalButton}
            icon="bank-transfer"
            buttonColor="#2196f3"
          >
            Online Transfer
          </Button>

          <Button
            mode="contained"
            onPress={() => confirmCompletion('Cash on Delivery')}
            style={styles.modalButton}
            icon="cash"
            buttonColor="#4caf50"
          >
            Cash on Delivery
          </Button>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    paddingTop: 30,
    paddingBottom: 5,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(98,0,238,0.9)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 24,
    marginTop: 20,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  route: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  },
  details: {
    gap: 8,
  },
  otpContainer: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2196f3',
    borderStyle: 'dashed',
  },
  otpLabel: {
    color: '#1976d2',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  otpCode: {
    color: '#0d47a1',
    fontWeight: 'bold',
    letterSpacing: 4,
    fontFamily: 'monospace',
  },
  otpHint: {
    color: '#1976d2',
    marginTop: 8,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 16,
    borderColor: '#f44336',
  },
  completeButton: {
    marginTop: 16,
    backgroundColor: '#4caf50',
  },
  progressButton: {
    marginTop: 16,
    backgroundColor: '#2196f3',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  modalButton: {
    marginBottom: 12,
    borderRadius: 8,
  },
});
