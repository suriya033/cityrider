import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Alert,
    Platform,
    ImageBackground,
    TouchableOpacity,
    Dimensions,
    KeyboardAvoidingView,
} from 'react-native';
import {
    TextInput,
    Button,
    Text,
    Chip,
    Card,
    Avatar,
    Divider,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { ridesAPI } from '../../services/api';
import LocationPicker from '../../components/LocationPicker';

export default function PostRideScreen({ navigation }) {
    const [origin, setOrigin] = useState({ address: '', coordinates: {} });
    const [destination, setDestination] = useState({ address: '', coordinates: {} });
    const [departureTime, setDepartureTime] = useState(new Date());
    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const [seatsAvailable, setSeatsAvailable] = useState('1');
    const [vehicleType, setVehicleType] = useState('Car');
    const [pricePerSeat, setPricePerSeat] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [mode, setMode] = useState('date');
    const [paymentMethods, setPaymentMethods] = useState(['Online']);
    const [cashPrice, setCashPrice] = useState('');

    const vehicleTypes = ['Car', 'Bike', 'Bus', 'Van', 'SUV','Auto', 'Other'];

    const handlePostRide = async () => {
        if (!origin.address || !destination.address || !pricePerSeat) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }
        if (paymentMethods.length === 0) {
            Alert.alert('Error', 'Please select at least one payment method');
            return;
        }
        if (departureTime < new Date()) {
            Alert.alert('Error', 'Departure time must be in the future');
            return;
        }
        setLoading(true);
        try {
            const rideData = {
                origin,
                destination,
                departureTime: departureTime.toISOString(),
                seatsAvailable: parseInt(seatsAvailable, 10),
                vehicleType,
                vehicleNumber,
                pricePerSeat: parseFloat(pricePerSeat),
                paymentMethod: paymentMethods.join(', '),
                description: `${description}\nPayment Methods: ${paymentMethods.join(', ')}`,
            };
            await ridesAPI.create(rideData);
            Alert.alert('Success', 'Ride posted successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to post ride. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const showMode = (currentMode) => {
        setDatePickerVisible(true);
        setMode(currentMode);
    };

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || departureTime;
        setDatePickerVisible(Platform.OS === 'ios');
        setDepartureTime(currentDate);

        if (Platform.OS === 'android' && event.type === 'set') {
            if (mode === 'date') {
                setMode('time');
                setDatePickerVisible(true);
            } else {
                setMode('date');
                setDatePickerVisible(false);
            }
        } else if (Platform.OS === 'android' && event.type === 'dismissed') {
            setMode('date');
        }
    };

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
                <ScrollView
                    style={{ flex: 1 }}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    {/* Header Card */}
                    <Card style={styles.headerCard}>
                        <Card.Content style={styles.headerContent}>
                            <Avatar.Icon size={60} icon="car-plus" style={styles.headerIcon} color="#fff" />
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
                                <Avatar.Icon size={36} icon="map-marker-path" style={styles.sectionIcon} color="#fff" />
                                <Text variant="titleMedium" style={styles.sectionTitle}>Route Details</Text>
                            </View>
                            <Divider style={styles.divider} />

                            <LocationPicker
                                label="From *"
                                value={origin}
                                onLocationSelect={setOrigin}
                                placeholder="Enter pickup location"
                            />

                            <LocationPicker
                                label="To *"
                                value={destination}
                                onLocationSelect={setDestination}
                                placeholder="Enter drop-off location"
                            />
                        </Card.Content>
                    </Card>

                    {/* Schedule Section */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <View style={styles.sectionHeader}>
                                <Avatar.Icon size={36} icon="clock-outline" style={styles.sectionIcon} color="#fff" />
                                <Text variant="titleMedium" style={styles.sectionTitle}>Schedule</Text>
                            </View>
                            <Divider style={styles.divider} />

                            <TouchableOpacity onPress={() => showMode('date')}>
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
                                <Avatar.Icon size={36} icon="car-info" style={styles.sectionIcon} color="#fff" />
                                <Text variant="titleMedium" style={styles.sectionTitle}>Vehicle Details</Text>
                            </View>
                            <Divider style={styles.divider} />

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
                                            selectedColor="#050404d5"
                                        >
                                            {type}
                                        </Chip>
                                    ))}
                                </View>
                            </View>

                            <TextInput
                                label="Vehicle Number"
                                value={vehicleNumber}
                                onChangeText={setVehicleNumber}
                                mode="outlined"
                                style={styles.input}
                                placeholder="e.g., KA 01 AB 1234"
                                left={<TextInput.Icon icon="car" />}
                                theme={{ roundness: 12 }}
                            />

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
                                <Avatar.Icon size={36} icon="cash" style={styles.sectionIcon} color="#fff" />
                                <Text variant="titleMedium" style={styles.sectionTitle}>Pricing</Text>
                            </View>
                            <Divider style={styles.divider} />

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

                    {datePickerVisible && (
                        <DateTimePicker
                            value={departureTime}
                            mode={mode}
                            is24Hour={true}
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onDateChange}
                            minimumDate={new Date()}
                        />
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
    headerIcon: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginBottom: 12,
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
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionIcon: {
        backgroundColor: '#6200ee',
        marginRight: 12,
    },
    sectionTitle: {
        fontWeight: 'bold',
        color: '#333',
    },
    divider: {
        marginBottom: 16,
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
    helperText: {
        color: '#666',
        marginBottom: 12,
        fontStyle: 'italic',
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
    },
});
