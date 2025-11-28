import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
  ImageBackground,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Chip,
  Card,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { ridesAPI } from '../../services/api';
import LocationPicker from '../../components/LocationPicker';
import driverTheme from '../../theme/driverTheme';


export default function PostRideScreen({ navigation }) {
  const [origin, setOrigin] = useState({ address: '', coordinates: {} });
  const [destination, setDestination] = useState({ address: '', coordinates: {} });
  const [departureTime, setDepartureTime] = useState(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [seatsAvailable, setSeatsAvailable] = useState('1');
  const [vehicleType, setVehicleType] = useState('Car');
  const [pricePerSeat, setPricePerSeat] = useState('');
  const [paymentMethods, setPaymentMethods] = useState(['Online', 'Cash on Delivery']);
  const [cashPrice, setCashPrice] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const vehicleTypes = ['Car', 'Bike', 'Bus', 'Van', 'SUV', 'Auto', 'Other'];

  const handlePostRide = async () => {
    if (!origin.address || !destination.address || !pricePerSeat) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (departureTime < new Date()) {
      Alert.alert('Error', 'Departure time must be in the future');
      return;
    }

    if (paymentMethods.length === 0) {
      Alert.alert('Error', 'Please select at least one payment method');
      return;
    }

    setLoading(true);
    try {
      // If only Cash is selected, use cashPrice. Otherwise (Online or Both), use base price.
      const isCashOnly = paymentMethods.length === 1 && paymentMethods.includes('Cash on Delivery');
      const finalPrice = isCashOnly ? parseFloat(cashPrice) : parseFloat(pricePerSeat);

      const rideData = {
        origin,
        destination,
        departureTime: departureTime.toISOString(),
        seatsAvailable: parseInt(seatsAvailable, 10),
        vehicleType,
        pricePerSeat: finalPrice,
        paymentMethod: paymentMethods.join(', '),
        description: `${description}\nPayment Methods: ${paymentMethods.join(', ')}`,
      };

      await ridesAPI.create(rideData);
      Alert.alert('Success', 'Ride posted successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to post ride. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const togglePaymentMethod = (method) => {
    const newMethods = paymentMethods.includes(method)
      ? paymentMethods.filter(m => m !== method)
      : [...paymentMethods, method];
    setPaymentMethods(newMethods);
  };

  return (
    <ImageBackground
      source={require('../../../assets/bg1.jpg')}
      style={styles.bgImage}
    >
      <ScrollView
        style={styles.container}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <Card.Content style={styles.headerContent}>
            <Text variant="headlineMedium" style={styles.headerTitle}>Post a New Ride</Text>
            <Text variant="bodyMedium" style={styles.headerSubtitle}>
              Share your journey and earn money
            </Text>
          </Card.Content>
        </Card>

        {/* Route Details Section */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>📍 Route Details</Text>
            </View>

            <LocationPicker
              label="From *"
              value={origin}
              onChange={setOrigin}
              placeholder="Enter pickup location"
            />
            <LocationPicker
              label="To *"
              value={destination}
              onChange={setDestination}
              placeholder="Enter drop-off location"
            />
          </Card.Content>
        </Card>

        {/* Schedule Section */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>🕐 Schedule</Text>
            </View>

            <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
              <TextInput
                label="Departure Date & Time *"
                value={format(departureTime, 'MMM dd, yyyy HH:mm')}
                mode="outlined"
                editable={false}
                style={styles.input}
                left={<TextInput.Icon icon="calendar-clock" />}
                theme={{ roundness: 12 }}
              />
            </TouchableOpacity>
          </Card.Content>
        </Card>

        {/* Vehicle Details Section */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>🚗 Vehicle Details</Text>
            </View>

            <View style={styles.vehicleTypeSection}>
              <Text variant="bodyMedium" style={styles.label}>Vehicle Type *</Text>
              <View style={styles.chipContainer}>
                {vehicleTypes.map((type) => (
                  <Chip
                    key={type}
                    selected={vehicleType === type}
                    onPress={() => setVehicleType(type)}
                    style={[
                      styles.chip,
                      vehicleType === type && styles.chipSelected
                    ]}
                    mode={vehicleType === type ? 'flat' : 'outlined'}
                    selectedColor="#fff"
                  >
                    {type}
                  </Chip>
                ))}
              </View>
            </View>

            <TextInput
              label="Available Seats *"
              value={seatsAvailable}
              onChangeText={setSeatsAvailable}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              left={<TextInput.Icon icon="seat-passenger" />}
              theme={{ roundness: 12 }}
            />
          </Card.Content>
        </Card>

        {/* Pricing Section */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>💰 Pricing</Text>
            </View>

            <View style={styles.vehicleTypeSection}>
              <Text variant="bodyMedium" style={styles.label}>Payment Methods</Text>
              <Text variant="bodySmall" style={styles.helperText}>
                💡 Online payment is mandatory. You can optionally accept cash.
              </Text>

              {/* Online Payment - Fixed */}
              <View style={styles.paymentMethodRow}>
                <Chip
                  selected={true}
                  style={[styles.chip, styles.chipSelected, styles.chipFixed]}
                  mode="flat"
                  selectedColor="#fff"
                  icon="bank-transfer"
                >
                  Online Payment (Required)
                </Chip>
              </View>

              {/* Cash on Delivery - Optional */}
              <View style={styles.paymentMethodRow}>
                <Chip
                  selected={paymentMethods.includes('Cash on Delivery')}
                  onPress={() => {
                    if (paymentMethods.includes('Cash on Delivery')) {
                      setPaymentMethods(['Online']);
                    } else {
                      setPaymentMethods(['Online', 'Cash on Delivery']);
                    }
                  }}
                  style={[
                    styles.chip,
                    paymentMethods.includes('Cash on Delivery') && styles.chipSelected
                  ]}
                  mode={paymentMethods.includes('Cash on Delivery') ? 'flat' : 'outlined'}
                  selectedColor="#03020213"
                  icon="cash"
                >
                  Cash on Delivery (Optional)
                </Chip>
              </View>
            </View>

            <TextInput
              label="Price Per Seat (₹) *"
              value={pricePerSeat}
              onChangeText={(text) => {
                setPricePerSeat(text);
                const basePrice = parseFloat(text);
                if (!isNaN(basePrice)) {
                  setCashPrice((basePrice * 1.05).toFixed(2));
                } else {
                  setCashPrice('');
                }
              }}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              left={<TextInput.Icon icon="currency-inr" />}
              right={<TextInput.Affix text="per seat" />}
              theme={{ roundness: 12 }}
            />

            {paymentMethods.includes('Cash on Delivery') && (
              <View style={styles.cashPriceContainer}>
                <Text variant="bodySmall" style={styles.cashPriceLabel}>
                  💵 Cash on Delivery Price (Online + 5%)
                </Text>
                <TextInput
                  label="Cash Price (Auto-calculated)"
                  value={cashPrice}
                  mode="outlined"
                  editable={false}
                  style={[styles.input, styles.cashPriceInput]}
                  left={<TextInput.Icon icon="cash" />}
                  right={<TextInput.Affix text="per seat" />}
                  theme={{ roundness: 12 }}
                />
              </View>
            )}

            <TextInput
              label="Additional Notes (Optional)"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.input}
              placeholder="e.g., AC available, luggage space, music preferences"
              left={<TextInput.Icon icon="note-text" />}
              theme={{ roundness: 12 }}
            />
          </Card.Content>
        </Card>

        {/* Post Button */}
        <Button
          mode="contained"
          onPress={handlePostRide}
          loading={loading}
          disabled={loading}
          style={styles.postButton}
          contentStyle={{ height: 56 }}
          icon="send"
        >
          Post Ride
        </Button>

        {/* DateTimePicker */}
        {datePickerVisible && (
          <DateTimePicker
            value={departureTime}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              // Handle Android (auto-dismiss)
              if (Platform.OS === 'android') {
                setDatePickerVisible(false);
                if (event.type === 'set' && selectedDate) {
                  setDepartureTime(selectedDate);
                }
              }
              // Handle iOS (manual dismiss)
              else {
                if (event.type === 'set' && selectedDate) {
                  setDepartureTime(selectedDate);
                  setDatePickerVisible(false);
                } else if (event.type === 'dismissed') {
                  setDatePickerVisible(false);
                }
              }
            }}
            minimumDate={new Date()}
          />
        )}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    resizeMode: 'cover'
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  headerCard: {
    margin: 16,
    marginBottom: 12,
    borderRadius: 20,
    elevation: 4,
    backgroundColor: 'rgba(98, 0, 238, 0.95)',
  },
  headerContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  card: {
    margin: 16,
    marginTop: 0,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  vehicleTypeSection: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 12,
    fontWeight: '600',
    color: '#333',
  },
  helperText: {
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: '#6200ee',
  },
  chipFixed: {
    opacity: 0.9,
  },
  paymentMethodRow: {
    marginBottom: 8,
  },
  cashPriceContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cashPriceLabel: {
    color: '#4caf50',
    fontWeight: '600',
    marginBottom: 8,
  },
  cashPriceInput: {
    backgroundColor: '#fff',
  },
  postButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#6200ee',
  },
});
