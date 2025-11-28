import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ImageBackground,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  Chip,
  TextInput,
  ActivityIndicator,
  Divider,
  Avatar,
} from 'react-native-paper';
import { ridesAPI, bookingsAPI } from '../../services/api';
import { format } from 'date-fns';
import RideMapView from '../../components/MapView';

export default function RideDetailScreen({ route, navigation }) {
  const { rideId } = route.params;
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingSeats, setBookingSeats] = useState(1);
  const [booking, setBooking] = useState(false);

  // Passenger Details State
  const [contactNumber, setContactNumber] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [numberOfAdults, setNumberOfAdults] = useState(1);
  const [numberOfChildren, setNumberOfChildren] = useState(0);
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [luggage, setLuggage] = useState('none');
  const [showPassengerForm, setShowPassengerForm] = useState(false);


  useEffect(() => {
    loadRideDetails();
  }, []);

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const loadRideDetails = async () => {
    try {
      const response = await ridesAPI.getById(rideId);
      setRide(response.data);
    } catch (error) {
      console.error('Error loading ride:', error);
      Alert.alert('Error', 'Failed to load ride details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookRide = async () => {
    if (!ride) return;

    const availableSeats = ride.seatsAvailable - ride.bookedSeats;
    if (bookingSeats > availableSeats) {
      Alert.alert('Error', `Only ${availableSeats} seat(s) available`);
      return;
    }

    // Validate passenger details
    if (!contactNumber.trim()) {
      Alert.alert('Required', 'Please provide a contact number');
      return;
    }

    setBooking(true);
    try {
      const response = await bookingsAPI.create({
        rideId: ride._id,
        seatsBooked: bookingSeats,
        passengerDetails: {
          contactNumber,
          emergencyContact: {
            name: emergencyName,
            phone: emergencyPhone,
            relation: emergencyRelation
          },
          numberOfAdults,
          numberOfChildren,
          specialRequirements,
          luggage
        }
      });

      const verificationCode = response.data.verificationCode;

      Alert.alert(
        'Ride Registered! 🎉',
        `Your booking has been registered.\n\nYour Verification Code:\n${verificationCode}\n\nShare this code with the driver when you meet. The driver will enter this code to confirm your ride.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Bookings'),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Registration Failed',
        error.response?.data?.message || 'Failed to register ride. Please try again.'
      );
    } finally {
      setBooking(false);
    }
  };

  const handleMessageDriver = () => {
    if (ride && ride.driverId) {
      navigation.navigate('Chat', {
        userId: ride.driverId._id,
        rideId: ride._id,
        userName: ride.driverId?.name || 'Driver',
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!ride) {
    return (
      <View style={styles.centerContainer}>
        <Text>Ride not found</Text>
      </View>
    );
  }

  const availableSeats = ride.seatsAvailable - ride.bookedSeats;
  const formattedDate = format(new Date(ride.departureTime), 'MMM dd, yyyy');
  const formattedTime = format(new Date(ride.departureTime), 'HH:mm');

  const cardStyle = { ...styles.card, backgroundColor: 'rgba(255, 255, 255, 0.95)' };

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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
          <Card style={cardStyle}>
            <Card.Content>
              <View style={styles.header}>
                <View style={styles.routeContainer}>
                  <Text variant="headlineSmall" style={styles.routeText}>
                    {ride.origin?.address || 'Unknown Origin'}
                  </Text>
                  <Avatar.Icon size={40} icon="arrow-down" style={{ backgroundColor: 'transparent' }} color="#6200ee" />
                  <Text variant="headlineSmall" style={styles.routeText}>
                    {ride.destination?.address || 'Unknown Destination'}
                  </Text>
                </View>
              </View>

              <Divider style={styles.divider} />

              <RideMapView
                origin={ride.origin}
                destination={ride.destination}
                route={ride.route}
              />

              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Avatar.Icon size={36} icon="calendar" style={styles.icon} color="#fff" />
                    <View>
                      <Text variant="labelMedium" style={styles.label}>Date</Text>
                      <Text variant="bodyLarge" style={styles.value}>{formattedDate}</Text>
                    </View>
                  </View>
                  <View style={styles.detailItem}>
                    <Avatar.Icon size={36} icon="clock" style={styles.icon} color="#fff" />
                    <View>
                      <Text variant="labelMedium" style={styles.label}>Time</Text>
                      <Text variant="bodyLarge" style={styles.value}>{formattedTime}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Avatar.Icon size={36} icon="car" style={styles.icon} color="#fff" />
                    <View>
                      <Text variant="labelMedium" style={styles.label}>Vehicle</Text>
                      <Text variant="bodyLarge" style={styles.value}>{ride.vehicleType}</Text>
                    </View>
                  </View>
                  <View style={styles.detailItem}>
                    <Avatar.Icon size={36} icon="seat" style={styles.icon} color="#fff" />
                    <View>
                      <Text variant="labelMedium" style={styles.label}>Available</Text>
                      <Text variant="bodyLarge" style={styles.value}>{availableSeats} Seats</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.priceContainer}>
                  <Text variant="titleMedium" style={{ marginBottom: 12, fontWeight: 'bold' }}>Pricing Options (Per Seat)</Text>

                  <View style={styles.priceOption}>
                    <View>
                      <Text variant="bodyLarge" style={{ fontWeight: 'bold', color: '#2e7d32' }}>Online Payment</Text>
                      <Chip icon="check" compact style={{ backgroundColor: '#e8f5e9', marginTop: 4 }} textStyle={{ color: '#2e7d32', fontSize: 10 }}>Best Price</Chip>
                    </View>
                    <Text variant="headlineMedium" style={{ color: '#2e7d32', fontWeight: 'bold' }}>₹{ride.pricePerSeat}</Text>
                  </View>

                  <Divider style={{ marginVertical: 12 }} />

                  <View style={styles.priceOption}>
                    <View>
                      <Text variant="bodyLarge" style={{ fontWeight: 'bold', color: '#555' }}>Cash on Delivery</Text>
                      <Text variant="bodySmall" style={{ color: '#777', marginTop: 2 }}>Online Price + 5%</Text>
                    </View>
                    <Text variant="headlineSmall" style={{ color: '#555', fontWeight: 'bold' }}>
                      ₹{(ride.pricePerSeat * 1.05).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>

              {ride.description && (
                <View style={styles.descriptionContainer}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>Note from Driver</Text>
                  <Text variant="bodyMedium" style={styles.description}>
                    {ride.description}
                  </Text>
                </View>
              )}

              {ride.driverId && (
                <View style={styles.driverContainer}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>Driver</Text>
                  <View style={styles.driverInfo}>
                    {ride.driverId.profilePicture ? (
                      <Avatar.Image
                        size={60}
                        source={{ uri: ride.driverId.profilePicture }}
                        style={{ backgroundColor: '#6200ee' }}
                      />
                    ) : (
                      <Avatar.Text
                        size={60}
                        label={ride.driverId.name?.charAt(0).toUpperCase() || 'D'}
                        style={{ backgroundColor: '#6200ee' }}
                      />
                    )}
                    <View style={{ marginLeft: 16, flex: 1 }}>
                      <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{ride.driverId.name || 'Unknown Driver'}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
                        <Chip icon="star" mode="outlined" style={styles.driverChip} textStyle={styles.driverChipText}>
                          {ride.driverId.rating || 'N/A'}
                        </Chip>
                        {ride.driverId.uniqueId && (
                          <Chip icon="identifier" mode="outlined" style={[styles.driverChip, { backgroundColor: '#e3f2fd' }]} textStyle={[styles.driverChipText, { color: '#1976d2', fontWeight: 'bold' }]}>
                            ID: {ride.driverId.uniqueId}
                          </Chip>
                        )}
                        {ride.driverId.dateOfBirth && (
                          <Chip icon="cake" mode="outlined" style={styles.driverChip} textStyle={styles.driverChipText}>
                            {calculateAge(ride.driverId.dateOfBirth)} yrs
                          </Chip>
                        )}
                        {ride.driverId.city && (
                          <Chip icon="city" mode="outlined" style={styles.driverChip} textStyle={styles.driverChipText}>
                            {ride.driverId.city}
                          </Chip>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </Card.Content>
          </Card>

          {availableSeats > 0 && (
            <Card style={[cardStyle, styles.bookingCard]}>
              <Card.Content>
                <Text variant="titleLarge" style={styles.bookingTitle}>
                  Book Your Ride
                </Text>

                <View style={styles.bookingForm}>
                  <TextInput
                    label="Number of Seats"
                    value={bookingSeats.toString()}
                    onChangeText={(text) => {
                      const seats = parseInt(text) || 1;
                      setBookingSeats(Math.min(Math.max(seats, 1), availableSeats));
                    }}
                    keyboardType="numeric"
                    mode="outlined"
                    style={styles.seatsInput}
                    left={<TextInput.Icon icon="seat-passenger" />}
                  />

                  {/* Passenger Details Section */}
                  <Divider style={{ marginVertical: 16 }} />

                  <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 12, color: '#6200ee' }}>
                    Passenger Details
                  </Text>

                  <TextInput
                    label="Contact Number *"
                    value={contactNumber}
                    onChangeText={setContactNumber}
                    keyboardType="phone-pad"
                    mode="outlined"
                    style={styles.input}
                    left={<TextInput.Icon icon="phone" />}
                    placeholder="Your contact number"
                  />

                  <View style={styles.rowInputs}>
                    <TextInput
                      label="Adults"
                      value={numberOfAdults.toString()}
                      onChangeText={(text) => setNumberOfAdults(parseInt(text) || 0)}
                      keyboardType="numeric"
                      mode="outlined"
                      style={[styles.input, { flex: 1, marginRight: 8 }]}
                      left={<TextInput.Icon icon="account" />}
                    />
                    <TextInput
                      label="Children"
                      value={numberOfChildren.toString()}
                      onChangeText={(text) => setNumberOfChildren(parseInt(text) || 0)}
                      keyboardType="numeric"
                      mode="outlined"
                      style={[styles.input, { flex: 1 }]}
                      left={<TextInput.Icon icon="account-child" />}
                    />
                  </View>

                  <Text variant="labelLarge" style={{ marginTop: 8, marginBottom: 8, color: '#666' }}>
                    Luggage
                  </Text>
                  <View style={styles.luggageContainer}>
                    {['none', 'small', 'medium', 'large'].map((size) => (
                      <Chip
                        key={size}
                        selected={luggage === size}
                        onPress={() => setLuggage(size)}
                        style={styles.luggageChip}
                        mode={luggage === size ? 'flat' : 'outlined'}
                        selectedColor="#6200ee"
                      >
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </Chip>
                    ))}
                  </View>

                  {/* Emergency Contact - Collapsible */}
                  <Button
                    mode="text"
                    onPress={() => setShowPassengerForm(!showPassengerForm)}
                    icon={showPassengerForm ? 'chevron-up' : 'chevron-down'}
                    style={{ marginTop: 8 }}
                  >
                    {showPassengerForm ? 'Hide' : 'Add'} Emergency Contact (Optional)
                  </Button>

                  {showPassengerForm && (
                    <View style={styles.emergencySection}>
                      <TextInput
                        label="Emergency Contact Name"
                        value={emergencyName}
                        onChangeText={setEmergencyName}
                        mode="outlined"
                        style={styles.input}
                        left={<TextInput.Icon icon="account-circle" />}
                      />
                      <TextInput
                        label="Emergency Contact Phone"
                        value={emergencyPhone}
                        onChangeText={setEmergencyPhone}
                        keyboardType="phone-pad"
                        mode="outlined"
                        style={styles.input}
                        left={<TextInput.Icon icon="phone" />}
                      />
                      <TextInput
                        label="Relation"
                        value={emergencyRelation}
                        onChangeText={setEmergencyRelation}
                        mode="outlined"
                        style={styles.input}
                        left={<TextInput.Icon icon="account-heart" />}
                        placeholder="e.g., Spouse, Parent, Friend"
                      />
                    </View>
                  )}

                  <TextInput
                    label="Special Requirements (Optional)"
                    value={specialRequirements}
                    onChangeText={setSpecialRequirements}
                    mode="outlined"
                    multiline
                    numberOfLines={3}
                    style={[styles.input, { marginTop: 12 }]}
                    left={<TextInput.Icon icon="note-text" />}
                    placeholder="Any special needs or requests..."
                  />

                  <View style={styles.totalContainer}>
                    <View style={styles.totalRow}>
                      <Text variant="bodyLarge">Total (Online)</Text>
                      <Text variant="headlineMedium" style={{ color: '#2e7d32', fontWeight: 'bold' }}>
                        ₹{bookingSeats * ride.pricePerSeat}
                      </Text>
                    </View>
                    <Divider style={{ marginVertical: 8, backgroundColor: '#ccc' }} />
                    <View style={styles.totalRow}>
                      <Text variant="bodyMedium" style={{ color: '#555' }}>Total (Cash)</Text>
                      <Text variant="titleLarge" style={{ color: '#555', fontWeight: 'bold' }}>
                        ₹{(bookingSeats * ride.pricePerSeat * 1.05).toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  <Button
                    mode="contained"
                    onPress={handleBookRide}
                    loading={booking}
                    disabled={booking}
                    style={styles.bookButton}
                    contentStyle={{ height: 50 }}
                  >
                    Register Booking
                  </Button>

                  <Button
                    mode="outlined"
                    onPress={handleMessageDriver}
                    style={styles.messageButton}
                    icon="message-text"
                  >
                    Chat with Driver
                  </Button>
                </View>
              </Card.Content>
            </Card>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  card: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 16,
    elevation: 4,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  routeContainer: {
    alignItems: 'center',
    gap: 8,
  },
  routeText: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  divider: {
    marginVertical: 16,
  },
  detailsContainer: {
    marginTop: 16,
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    backgroundColor: '#6200ee',
  },
  label: {
    color: '#666',
  },
  value: {
    fontWeight: 'bold',
  },
  priceContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  priceOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  descriptionContainer: {
    marginTop: 24,
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
  },
  description: {
    color: '#555',
    lineHeight: 20,
  },
  driverContainer: {
    marginTop: 24,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#333',
  },
  bookingCard: {
    marginTop: 16,
  },
  bookingTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#6200ee',
  },
  bookingForm: {
    gap: 16,
  },
  seatsInput: {
    backgroundColor: '#fff',
  },
  totalContainer: {
    backgroundColor: '#e8eaf6',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  messageButton: {
    borderRadius: 8,
  },
  driverChip: {
    marginRight: 8,
    marginBottom: 4,
    height: 32,
    backgroundColor: '#fff',
  },
  driverChipText: {
    fontSize: 12,
    marginRight: 4,
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  luggageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  luggageChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  emergencySection: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 12,
  },
});
