// PostRideHistoryScreen.js – Enhanced UI for Driver's Ride History
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    RefreshControl,
    ImageBackground,
    Dimensions,
    Animated,
    Easing,
} from 'react-native';
import { Card, Text, Chip, ActivityIndicator, Avatar, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { ridesAPI } from '../../services/api';
import { format } from 'date-fns';
import driverTheme from '../../theme/driverTheme';

const { width } = Dimensions.get('window');

export default function PostRideHistoryScreen({ navigation }) {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadHistory();
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, []);

    const loadHistory = async () => {
        try {
            const response = await ridesAPI.getMyRides();
            // Filter for completed and canceled rides, sorted by date
            const history = response.data
                .filter(r => {
                    const status = r.status ? r.status.toLowerCase() : '';
                    return status === 'completed' || status === 'canceled';
                })
                .sort((a, b) => new Date(b.departureTime) - new Date(a.departureTime));
            setRides(history);
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadHistory();
    };

    const renderRideItem = ({ item, index }) => {
        const formattedDate = format(new Date(item.departureTime), 'MMM dd, yyyy');
        const formattedTime = format(new Date(item.departureTime), 'hh:mm a');

        // Staggered animation
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
                        <Card.Content>
                            <View style={styles.cardHeader}>
                                <View style={styles.dateContainer}>
                                    <Avatar.Icon size={32} icon="calendar-check" style={styles.dateIcon} color="#fff" />
                                    <View>
                                        <Text variant="labelSmall" style={styles.dateLabel}>
                                            {item.status.toLowerCase() === 'canceled' ? 'CANCELED ON' : 'COMPLETED ON'}
                                        </Text>
                                        <Text variant="bodyMedium" style={styles.dateText}>
                                            {formattedDate} • {formattedTime}
                                        </Text>
                                    </View>
                                </View>
                                <Chip
                                    mode="flat"
                                    icon={item.status.toLowerCase() === 'canceled' ? 'close-circle' : 'flag-checkered'}
                                    style={{ backgroundColor: item.status.toLowerCase() === 'canceled' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(33, 150, 243, 0.1)' }}
                                    textStyle={{ color: item.status.toLowerCase() === 'canceled' ? '#f44336' : '#2196f3', fontWeight: 'bold', fontSize: 10 }}
                                    compact
                                >
                                    {item.status.toUpperCase()}
                                </Chip>
                            </View>

                            <Divider style={styles.divider} />

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

                            <View style={styles.statsGrid}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>BOOKED</Text>
                                    <Text style={styles.statValue}>{item.bookedSeats}/{item.seatsAvailable}</Text>
                                </View>
                                <View style={styles.verticalDivider} />
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>EARNED</Text>
                                    <Text style={styles.statValue}>₹{item.pricePerSeat * item.bookedSeats}</Text>
                                </View>
                                <View style={styles.verticalDivider} />
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>PRICE/SEAT</Text>
                                    <Text style={styles.statValue}>₹{item.pricePerSeat}</Text>
                                </View>
                            </View>
                        </Card.Content>
                    </LinearGradient>
                </Card>
            </Animated.View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#6200ee" />
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
                    <Text variant="headlineMedium" style={styles.headerTitle}>Posted Rides History</Text>
                    <Text variant="bodyMedium" style={styles.headerSubtitle}>
                        Your completed journeys
                    </Text>
                </View>

                <FlatList
                    data={rides}
                    renderItem={renderRideItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.list}
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
                                        <Avatar.Icon size={80} icon="history" style={{ backgroundColor: 'transparent' }} color="#fff" />
                                    </View>
                                    <Text variant="headlineSmall" style={styles.emptyTitle}>No History Yet</Text>
                                    <Text variant="bodyMedium" style={styles.emptyText}>
                                        Completed rides will appear here.
                                    </Text>
                                </Card.Content>
                            </Card>
                        </Animated.View>
                    }
                />
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    background: { flex: 1, width: width },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },

    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: 'transparent',
    },
    headerTitle: { color: '#fff', fontWeight: 'bold', fontSize: 28 },
    headerSubtitle: { color: 'rgba(255,255,255,0.8)', marginTop: 4 },

    list: { padding: 16, paddingBottom: 40 },

    card: {
        marginBottom: 16,
        borderRadius: 20,
        elevation: 4,
        backgroundColor: 'transparent',
        overflow: 'hidden',
    },
    cardGradient: { padding: 0 },

    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    dateContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    dateIcon: { backgroundColor: '#2196f3' },
    dateLabel: { color: '#666', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
    dateText: { fontWeight: 'bold', color: '#333' },

    divider: { backgroundColor: 'rgba(0,0,0,0.05)', height: 1, marginVertical: 12 },

    routeContainer: { marginVertical: 8 },
    routeRow: { flexDirection: 'row' },
    timelineContainer: { alignItems: 'center', width: 24, marginRight: 12, paddingVertical: 6 },
    dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#fff', elevation: 2 },
    line: { width: 2, flex: 1, backgroundColor: '#e0e0e0', marginVertical: 4 },
    locationsContainer: { flex: 1 },
    locationItem: { height: 44, justifyContent: 'center' },
    cityText: { fontWeight: 'bold', color: '#333', fontSize: 16 },
    addressText: { color: '#666' },

    statsGrid: {
        flexDirection: 'row',
        backgroundColor: 'rgba(33, 150, 243, 0.05)',
        borderRadius: 12,
        padding: 12,
        marginTop: 16,
        justifyContent: 'space-between',
    },
    statItem: { alignItems: 'center', flex: 1 },
    verticalDivider: { width: 1, backgroundColor: 'rgba(0,0,0,0.1)', height: '100%' },
    statLabel: { fontSize: 10, color: '#666', fontWeight: 'bold', marginBottom: 4 },
    statValue: { fontWeight: 'bold', color: '#1a1a1a', fontSize: 14 },

    emptyCard: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, marginTop: 20 },
    emptyContent: { alignItems: 'center', padding: 30 },
    emptyIconContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    emptyTitle: { fontWeight: 'bold', color: '#333', marginBottom: 8 },
    emptyText: { textAlign: 'center', color: '#666' },
});
