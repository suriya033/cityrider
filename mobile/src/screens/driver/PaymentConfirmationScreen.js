import React, { useState } from 'react';
import { View, StyleSheet, ImageBackground, Dimensions, Alert } from 'react-native';
import { Text, Button, Avatar, Card, ActivityIndicator } from 'react-native-paper';
import { bookingsAPI } from '../../services/api';

export default function PaymentConfirmationScreen({ route, navigation }) {
    const { booking, rideId } = route.params;
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await bookingsAPI.finalize(booking._id);
            Alert.alert('Success', 'Ride completed successfully!', [
                {
                    text: 'OK',
                    onPress: () => {
                        // Navigate back to ManageRide or Home, ensuring we refresh
                        navigation.navigate('ManageRide', { rideId: rideId, refresh: true });
                    }
                }
            ]);
        } catch (error) {
            console.error('Error finalizing booking:', error);
            Alert.alert('Error', 'Failed to confirm payment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../../../assets/bg1.jpg')}
                style={styles.background}
                resizeMode="cover"
            >
                <View style={styles.overlay}>
                    <Card style={styles.card}>
                        <Card.Content style={styles.content}>
                            <Avatar.Icon
                                size={80}
                                icon="check-decagram"
                                style={{ backgroundColor: '#4caf50', marginBottom: 20 }}
                            />

                            <Text variant="headlineMedium" style={styles.title}>
                                Ride Completed!
                            </Text>

                            <Text variant="bodyLarge" style={styles.subtitle}>
                                Passenger <Text style={{ fontWeight: 'bold' }}>{booking.passengerId?.name || 'Unknown'}</Text> has completed the ride.
                            </Text>

                            <View style={styles.detailsBox}>
                                <Text variant="titleMedium" style={styles.detailsTitle}>
                                    Payment Details
                                </Text>

                                <View style={styles.row}>
                                    <Text variant="bodyLarge" style={styles.label}>Method:</Text>
                                    <Text variant="bodyLarge" style={styles.value}>
                                        {booking.paymentMethod || 'Online'}
                                    </Text>
                                </View>

                                <View style={styles.row}>
                                    <Text variant="bodyLarge" style={styles.label}>Amount:</Text>
                                    <Text variant="headlineSmall" style={styles.amount}>
                                        ₹{booking.totalAmount}
                                    </Text>
                                </View>

                                {(booking.paymentMethod === 'Online Transfer' || !booking.paymentMethod) && (
                                    <View style={styles.qrContainer}>
                                        <Text variant="bodyMedium" style={{ marginBottom: 8, textAlign: 'center' }}>
                                            Scan QR to Receive Payment
                                        </Text>
                                        <ImageBackground
                                            source={require('../../../assets/qr.png')}
                                            style={{ width: 200, height: 200 }}
                                        />
                                    </View>
                                )}

                                {booking.paymentMethod === 'Cash on Delivery' && (
                                    <View style={styles.warningBox}>
                                        <Avatar.Icon size={24} icon="cash" style={{ backgroundColor: 'transparent' }} color="#d32f2f" />
                                        <Text variant="bodyMedium" style={styles.warningText}>
                                            Please collect cash from passenger.
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <Button
                                mode="contained"
                                onPress={handleConfirm}
                                loading={loading}
                                disabled={loading}
                                style={styles.button}
                                contentStyle={{ height: 56 }}
                                labelStyle={{ fontSize: 18, fontWeight: 'bold' }}
                            >
                                Confirm & Finish
                            </Button>
                        </Card.Content>
                    </Card>
                </View>
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
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        padding: 20,
    },
    card: {
        borderRadius: 20,
        elevation: 8,
        backgroundColor: '#fff',
    },
    content: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    title: {
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        textAlign: 'center',
        color: '#666',
        marginBottom: 24,
        paddingHorizontal: 10,
    },
    detailsBox: {
        width: '100%',
        backgroundColor: '#f5f5f5',
        padding: 20,
        borderRadius: 12,
        marginBottom: 24,
    },
    detailsTitle: {
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    label: {
        color: '#666',
    },
    value: {
        fontWeight: 'bold',
        color: '#333',
    },
    amount: {
        fontWeight: 'bold',
        color: '#2e7d32',
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffebee',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
        gap: 8,
    },
    warningText: {
        color: '#d32f2f',
        fontWeight: 'bold',
        flex: 1,
    },
    qrContainer: {
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 8,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
    },
    button: {
        width: '100%',
        borderRadius: 12,
        backgroundColor: '#6200ee',
    },
});
