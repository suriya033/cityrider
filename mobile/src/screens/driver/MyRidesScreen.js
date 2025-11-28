// MyRidesScreen.js – Enhanced UI for Driver's Rides
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  ImageBackground,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  Chip,
  ActivityIndicator,
  FAB,
  Avatar,
  Divider,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { ridesAPI } from '../../services/api';
import { format } from 'date-fns';
import driverTheme from '../../theme/driverTheme';
import { ListSkeleton } from '../../components/SkeletonLoader';

const { width } = Dimensions.get('window');

export default function MyRidesScreen({ navigation }) {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadRides();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const loadRides = async () => {
    try {
      const response = await ridesAPI.getMyRides();
      const now = new Date();
      const filteredRides = response.data.filter(ride => {
        const status = ride.status ? ride.status.toLowerCase() : '';
        if (status !== 'completed') return true;
        const rideDate = new Date(ride.departureTime);
        const diffHours = (now - rideDate) / (1000 * 60 * 60);
        return diffHours < 24;
      });
      setRides(filteredRides);
    } catch (error) {
      console.error('Error loading rides:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRides();
  };

  const handleCancelRide = async (rideId) => {
    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride? All bookings will be canceled.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await ridesAPI.cancel(rideId);
              loadRides();
              Alert.alert('Success', 'Ride canceled successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel ride');
            }
          },
        },
      ]
    );
  };

  const handleCompleteRide = async (rideId) => {
    Alert.alert(
      'Complete Ride',
      'Mark this ride as completed?\n\nNote: All passengers must have completed their bookings first.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              await ridesAPI.complete(rideId);
              loadRides();
              Alert.alert('Success', 'Ride marked as completed! It will now appear in your ride history.');
            } catch (error) {
              const errorMessage = error.response?.data?.message || 'Failed to complete ride';
              const errorDetails = error.response?.data?.details;

              Alert.alert(
                'Cannot Complete Ride',
                errorDetails || errorMessage,
                [{ text: 'OK', style: 'default' }]
              );
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    const s = status ? status.toLowerCase() : '';
    switch (s) {
      case 'active':
        return { bg: '#4caf50', text: '#fff', icon: 'check-circle' };
      case 'completed':
        return { bg: '#2196f3', text: '#fff', icon: 'flag-checkered' };
      case 'canceled':
        return { bg: '#f44336', text: '#fff', icon: 'close-circle' };
      default:
        return { bg: '#666', text: '#fff', icon: 'help-circle' };
    }
  };

  const renderRideItem = ({ item, index }) => {
    const availableSeats = item.seatsAvailable - item.bookedSeats;
    const formattedDate = format(new Date(item.departureTime), 'MMM dd, yyyy');
    const formattedTime = format(new Date(item.departureTime), 'hh:mm a');
    const statusInfo = getStatusColor(item.status);

    // Staggered animation for list items
    const translateY = new Animated.Value(50);
    const opacity = new Animated.Value(0);

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();

    return (
      <Animated.View style={{ opacity, transform: [{ translateY }] }}>
        <Card style={styles.card}>
          <LinearGradient
            colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
            style={styles.cardGradient}
          >
            <Card.Content style={styles.cardContent}>
              {/* Header: Date & Status */}
              <View style={styles.cardHeader}>
                <View style={styles.dateContainer}>
                  <Avatar.Icon size={32} icon="calendar-clock" style={styles.dateIcon} color="#fff" />
                  <View>
                    <Text variant="labelSmall" style={styles.dateLabel}>DEPARTURE</Text>
                    <Text variant="bodyMedium" style={styles.dateText}>
                      {formattedDate} • {formattedTime}
                    </Text>
                  </View>
                </View>
                <Chip
                  mode="flat"
                  icon={statusInfo.icon}
                  style={{ backgroundColor: statusInfo.bg + '20' }}
                  textStyle={{ color: statusInfo.bg, fontWeight: 'bold', fontSize: 11 }}
                  compact
                >
                  {item.status.toUpperCase()}
                </Chip>
              </View>

              <Divider style={styles.divider} />

              {/* Route Section */}
              <View style={styles.routeContainer}>
                <View style={styles.routeRow}>
                  <View style={styles.timelineContainer}>
                    <View style={[styles.dot, { backgroundColor: '#4caf50' }]} />
                    <View style={styles.line} />
                    <View style={[styles.dot, { backgroundColor: '#f44336' }]} />
                  </View>
                  <View style={styles.locationsContainer}>
                    <View style={styles.locationItem}>
                      <Text variant="titleMedium" style={styles.cityText} numberOfLines={1}>
                        {item.origin?.city || item.origin?.address?.split(',')[0] || 'Unknown City'}
                      </Text>
                      <Text variant="bodySmall" style={styles.addressText} numberOfLines={1}>
                        {item.origin?.address || 'Unknown Address'}
                      </Text>
                    </View>
                    <View style={[styles.locationItem, { marginTop: 16 }]}>
                      <Text variant="titleMedium" style={styles.cityText} numberOfLines={1}>
                        {item.destination?.city || item.destination?.address?.split(',')[0] || 'Unknown City'}
                      </Text>
                      <Text variant="bodySmall" style={styles.addressText} numberOfLines={1}>
                        {item.destination?.address || 'Unknown Address'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Info Grid */}
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>SEATS</Text>
                  <Text style={styles.infoValue}>{availableSeats} left</Text>
                </View>
                <View style={styles.verticalDivider} />
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>PRICE</Text>
                  <Text style={styles.infoValue}>₹{item.pricePerSeat}</Text>
                </View>
                <View style={styles.verticalDivider} />
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>VEHICLE</Text>
                  <Text style={styles.infoValue}>{item.vehicleType}</Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actionContainer}>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('ManageRide', { rideId: item._id })}
                  style={styles.manageButton}
                  contentStyle={{ height: 44 }}
                  labelStyle={{ fontWeight: 'bold' }}
                  icon="cog"
                >
                  Manage Ride
                </Button>
                {item.status === 'active' && (
                  <>
                    <Button
                      mode="contained"
                      onPress={() => handleCompleteRide(item._id)}
                      style={styles.completeButton}
                      buttonColor="#4caf50"
                      contentStyle={{ height: 44 }}
                      icon="check-circle"
                    >
                      Complete
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => handleCancelRide(item._id)}
                      style={styles.cancelButton}
                      textColor="#f44336"
                      contentStyle={{ height: 44 }}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </View>
            </Card.Content>
          </LinearGradient>
        </Card>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ImageBackground
          source={require('../../../assets/bg1.jpg')}
          style={styles.background}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.header}>
            <Text variant="headlineMedium" style={styles.headerTitle}>My Rides</Text>
            <Text variant="bodyMedium" style={styles.headerSubtitle}>
              Manage your posted journeys
            </Text>
          </View>
          <ListSkeleton count={3} type="ride" />
        </ImageBackground>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../../assets/bg1.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)']}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.headerTitle}>My Rides</Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            Manage your posted journeys
          </Text>
        </View>

        <FlatList
          data={rides}
          renderItem={renderRideItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#fff"
              colors={['#6200ee']}
            />
          }
          ListEmptyComponent={
            <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: fadeAnim }] }}>
              <Card style={styles.emptyCard}>
                <Card.Content style={styles.emptyContent}>
                  <View style={styles.emptyIconContainer}>
                    <Avatar.Icon size={80} icon="car-off" style={{ backgroundColor: 'transparent' }} color="#fff" />
                  </View>
                  <Text variant="headlineSmall" style={styles.emptyTitle}>No Rides Posted</Text>
                  <Text variant="bodyMedium" style={styles.emptyText}>
                    You haven't posted any rides yet. Share your journey and start earning!
                  </Text>
                  <Button
                    mode="contained"
                    onPress={() => navigation.navigate('PostRideCommon')}
                    style={styles.postButton}
                    icon="plus"
                    contentStyle={{ height: 48 }}
                  >
                    Post a Ride
                  </Button>
                </Card.Content>
              </Card>
            </Animated.View>
          }
        />

        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate('PostRideCommon')}
          label="Post Ride"
          color="#fff"
        />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: width,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 28,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
    borderRadius: 20,
    elevation: 4,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  cardGradient: {
    borderRadius: 20,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateIcon: {
    backgroundColor: '#6200ee',
  },
  dateLabel: {
    color: '#666',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  dateText: {
    fontWeight: 'bold',
    color: '#333',
  },
  divider: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    height: 1,
    marginVertical: 12,
  },
  routeContainer: {
    marginVertical: 8,
  },
  routeRow: {
    flexDirection: 'row',
  },
  timelineContainer: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
    paddingVertical: 6,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 2,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 4,
  },
  locationsContainer: {
    flex: 1,
  },
  locationItem: {
    height: 44,
    justifyContent: 'center',
  },
  cityText: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 16,
  },
  addressText: {
    color: '#666',
  },
  infoGrid: {
    flexDirection: 'row',
    backgroundColor: 'rgba(98,0,238,0.05)',
    borderRadius: 12,
    padding: 12,
    marginVertical: 16,
    justifyContent: 'space-between',
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    height: '100%',
  },
  infoLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoValue: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 14,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  manageButton: {
    flex: 1,
    minWidth: '100%',
    backgroundColor: 'rgba(0, 151, 238, 1)',
    borderRadius: 12,
  },
  completeButton: {
    flex: 1,
    borderRadius: 12,
  },
  cancelButton: {
    flex: 1,
    borderColor: '#f44336',
    borderRadius: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
  emptyCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    marginTop: 20,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 30,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  postButton: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#6200ee',
  },
});
