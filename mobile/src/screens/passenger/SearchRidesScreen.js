import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { TextInput, Card, Text, Button, Chip, FAB } from 'react-native-paper';
import { ridesAPI } from '../../services/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

export default function SearchRidesScreen({ navigation }) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRides();
  }, []);

  const loadRides = async () => {
    setLoading(true);
    try {
      const params = {};
      if (origin) params.origin = origin;
      if (destination) params.destination = destination;
      if (date) {
        params.date = format(date, 'yyyy-MM-dd');
      }

      const response = await ridesAPI.getAll(params);
      setRides(response.data);
    } catch (error) {
      console.error('Error loading rides:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    loadRides();
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRides();
  };

  const renderRideItem = ({ item }) => {
    const availableSeats = item.seatsAvailable - item.bookedSeats;
    const formattedDate = format(new Date(item.departureTime), 'MMM dd, yyyy HH:mm');

    return (
      <Card
        style={styles.card}
        onPress={() => navigation.navigate('RideDetail', { rideId: item._id })}
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium" style={styles.route}>
              {item.origin?.address || 'Unknown'} → {item.destination?.address || 'Unknown'}
            </Text>
            <Chip mode="outlined" compact>
              {item.vehicleType}
            </Chip>
          </View>

          <View style={styles.cardDetails}>
            <Text variant="bodyMedium" style={styles.date}>
              📅 {formattedDate}
            </Text>
            <Text variant="bodyMedium" style={styles.seats}>
              💺 {availableSeats} seats available
            </Text>
            <Text variant="titleLarge" style={styles.price}>
              ₹{item.pricePerSeat}/seat
            </Text>
          </View>

          {item.driverId && (
            <View style={styles.driverInfo}>
              <Text variant="bodySmall">
                👤 {item.driverId?.name || 'Unknown Driver'} ⭐ {item.driverId?.rating || 'N/A'}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <TextInput
          label="From"
          value={origin}
          onChangeText={setOrigin}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="map-marker" />}
        />

        <TextInput
          label="To"
          value={destination}
          onChangeText={setDestination}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="map-marker-check" />}
        />

        <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
          <TextInput
            label="Date"
            value={date ? format(date, 'MMM dd, yyyy') : ''}
            mode="outlined"
            editable={false}
            style={styles.input}
            left={<TextInput.Icon icon="calendar" />}
          />
        </TouchableOpacity>

        <Button
          mode="contained"
          onPress={handleSearch}
          loading={loading}
          style={styles.searchButton}
          icon="magnify"
        >
          Search Rides
        </Button>
      </View>

      <FlatList
        data={rides}
        renderItem={renderRideItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No rides found. Try different search criteria.
            </Text>
          </View>
        }
      />

      {datePickerVisible && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            // Handle Android (auto-dismiss)
            if (Platform.OS === 'android') {
              setDatePickerVisible(false);
              if (event.type === 'set' && selectedDate) {
                setDate(selectedDate);
              }
            }
            // Handle iOS (manual dismiss)
            else {
              if (event.type === 'set' && selectedDate) {
                setDate(selectedDate);
                setDatePickerVisible(false);
              } else if (event.type === 'dismissed') {
                setDatePickerVisible(false);
              }
            }
          }}
          minimumDate={new Date()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchSection: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  input: {
    marginBottom: 12,
  },
  searchButton: {
    marginTop: 8,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  route: {
    flex: 1,
    fontWeight: 'bold',
  },
  cardDetails: {
    marginTop: 8,
  },
  date: {
    marginBottom: 4,
  },
  seats: {
    marginBottom: 4,
  },
  price: {
    color: '#6200ee',
    fontWeight: 'bold',
    marginTop: 8,
  },
  driverInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
  },
});
