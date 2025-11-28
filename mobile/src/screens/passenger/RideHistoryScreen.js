// RideHistoryScreen.js – Shows completed rides and automatically deletes them after display
import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    RefreshControl,
    ImageBackground,
    Dimensions,
} from 'react-native';
import { Card, Text, Chip, ActivityIndicator } from 'react-native-paper';
import { bookingsAPI } from '../../services/api';
import { format } from 'date-fns';

export default function RideHistoryScreen({ navigation }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadHistory();
    }, []);

    // Load completed rides (persistent history)
    const loadHistory = async () => {
        try {
            const response = await bookingsAPI.getMyBookings();
            const completed = response.data.filter(
                b => b.status === 'completed' || (b.rideId && b.rideId.status === 'completed')
            );
            setBookings(completed);
        } catch (err) {
            console.error('Error loading ride history', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadHistory();
    };

    const getStatusColor = status => {
        switch (status) {
            case 'completed':
                return '#4caf50';
            case 'canceled':
                return '#f44336'; // red for canceled rides
            default:
                return '#757575'; // default grey
        }
    };

    const renderItem = ({ item }) => {
        const ride = item.rideId || {};
        const date = ride.departureTime ? format(new Date(ride.departureTime), 'MMM dd, yyyy HH:mm') : 'N/A';
        const statusColor = getStatusColor(item.status);

        return (
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.cardHeader}>
                        <View style={{ flex: 1 }}>
                            <Text variant="titleMedium" style={styles.route}>
                                {ride.origin?.city || 'Unknown'} → {ride.destination?.city || 'Unknown'}
                            </Text>
                            <Text variant="bodySmall" style={{ color: '#666' }}>{date}</Text>
                        </View>
                        <Chip
                            textStyle={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}
                            style={{ backgroundColor: statusColor, height: 24 }}
                        >
                            {item.status.toUpperCase()}
                        </Chip>
                    </View>

                    <View style={styles.details}>
                        <View style={styles.row}>
                            <Text variant="bodyMedium">💰 Total: ₹{item.totalAmount}</Text>
                            <Text variant="bodyMedium">💺 Seats: {item.seatsBooked}</Text>
                        </View>

                        <View style={styles.routeDetails}>
                            <Text style={styles.routeLabel}>Route Details:</Text>
                            <View style={styles.routeInfo}>
                                <Text style={styles.routePart} numberOfLines={1}>📍 From: {ride.origin?.address || 'Unknown'}</Text>
                                <Text style={styles.routePart} numberOfLines={1}>📍 To: {ride.destination?.address || 'Unknown'}</Text>
                            </View>
                        </View>

                        {ride.driverId && (
                            <View style={styles.driverInfo}>
                                <Text variant="bodySmall" style={{ color: '#666' }}>
                                    Driver: {ride.driverId.name || 'Unknown'} (ID: {ride.driverId.uniqueId || 'N/A'})
                                </Text>
                            </View>
                        )}
                    </View>
                </Card.Content>
            </Card>
        );
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../../../assets/bg1.jpg')}
                style={styles.background}
                resizeMode="cover"
            />
            <View style={styles.headerContainer}>
                <Text variant="headlineMedium" style={styles.headerTitle}>Ride History</Text>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#6200ee" />
                </View>
            ) : (
                <FlatList
                    data={bookings}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6200ee']} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No completed rides found.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    background: {
        position: 'absolute',
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        left: 0,
        top: 0,
    },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerContainer: {
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: 'rgba(98,0,238,0.9)',
        alignItems: 'center',
        elevation: 4,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTitle: { color: '#fff', fontWeight: 'bold' },
    list: { padding: 16 },
    card: {
        marginBottom: 16,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    route: {
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    details: { gap: 12 },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#f5f5f5',
        padding: 8,
        borderRadius: 8,
    },
    emptyContainer: { padding: 20, alignItems: 'center', marginTop: 40 },
    emptyText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
    routeDetails: {
        padding: 10,
        backgroundColor: 'rgba(98,0,238,0.05)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(98,0,238,0.1)',
    },
    routeLabel: {
        fontWeight: 'bold',
        color: '#6200ee',
        marginBottom: 6,
        fontSize: 12,
    },
    routeInfo: {
        gap: 6,
    },
    routePart: {
        color: '#444',
        fontSize: 13,
    },
    driverInfo: {
        marginTop: 4,
        alignItems: 'flex-end',
    },
});
