import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card, Button, List, Divider, Avatar, IconButton, ActivityIndicator, Chip } from 'react-native-paper';
import { useTheme } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';
import { bookingsAPI, ridesAPI } from '../../services/api';
import { format } from 'date-fns';

export default function PaymentDashboardScreen({ navigation }) {
    const { theme } = useTheme();
    const { user } = useContext(AuthContext);
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedId, setExpandedId] = useState(null);

    const getLocationCity = (loc) => {
        if (!loc) return 'N/A';
        if (typeof loc === 'string') return loc.split(',')[0];
        return loc.city || loc.address?.split(',')[0] || 'N/A';
    };

    const getLocationFull = (loc) => {
        if (!loc) return 'N/A';
        if (typeof loc === 'string') return loc;
        return loc.address || loc.city || 'N/A';
    };

    useEffect(() => {
        loadFinancialData();
    }, []);

    const loadFinancialData = async () => {
        try {
            const [bookingsRes, ridesRes] = await Promise.all([
                bookingsAPI.getMyBookings().catch(err => ({ data: [] })),
                ridesAPI.getMyRides().catch(err => ({ data: [] }))
            ]);

            const newTransactions = [];
            let totalEarnings = 0;
            let totalSpent = 0;

            // Process Bookings (Passenger payments - Debits)
            if (bookingsRes.data) {
                bookingsRes.data.forEach(booking => {
                    if (booking.status === 'completed' || booking.status === 'confirmed') {
                        // Determine payment method
                        let rawMethod = booking.paymentMethod || (booking.passengerDetails?.paymentMethod) || 'Cash on Delivery';
                        let displayMethod = rawMethod;

                        // Normalize display text
                        if (rawMethod === 'Online' || rawMethod === 'Online Transfer') {
                            displayMethod = 'Online Transaction';
                        } else if (rawMethod === 'Cash' || rawMethod === 'Cash on Delivery') {
                            displayMethod = 'Cash on Delivery';
                        }

                        newTransactions.push({
                            id: `booking-${booking._id}`,
                            type: 'debit',
                            amount: booking.totalAmount,
                            date: booking.createdAt,
                            status: booking.status,
                            origin: booking.rideId?.origin,
                            destination: booking.rideId?.destination,
                            driver: booking.rideId?.driverId,
                            passenger: null,
                            seats: booking.seatsBooked,
                            paymentMethod: displayMethod,
                            departureTime: booking.rideId?.departureTime,
                        });
                        totalSpent += booking.totalAmount;
                    }
                });
            }

            // Process Rides (Driver earnings - Credits)
            if (ridesRes.data) {
                ridesRes.data.forEach(ride => {
                    if (ride.status === 'completed' && ride.bookedSeats > 0) {
                        const earnings = ride.bookedSeats * ride.pricePerSeat;
                        newTransactions.push({
                            id: `ride-${ride._id}`,
                            type: 'credit',
                            amount: earnings,
                            date: ride.departureTime,
                            status: ride.status,
                            origin: ride.origin,
                            destination: ride.destination,
                            driver: null,
                            passenger: null,
                            seats: ride.bookedSeats,
                            paymentMethod: 'Multiple Methods', // Drivers may receive mixed payments
                            departureTime: ride.departureTime,
                        });
                        totalEarnings += earnings;
                    }
                });
            }

            // Sort by date descending
            newTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

            setTransactions(newTransactions);
            setBalance(totalEarnings - totalSpent);

        } catch (error) {
            console.error('Error loading financial data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadFinancialData();
    };

    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy');
        } catch (e) {
            return 'Invalid Date';
        }
    };

    const formatTime = (dateString) => {
        try {
            return format(new Date(dateString), 'hh:mm a');
        } catch (e) {
            return '';
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const renderTransaction = (item, index) => {
        const isExpanded = expandedId === item.id;
        const isCredit = item.type === 'credit';

        return (
            <React.Fragment key={item.id}>
                <TouchableOpacity onPress={() => toggleExpand(item.id)} activeOpacity={0.7}>
                    <View style={styles.transactionItem}>
                        <View style={styles.transactionHeader}>
                            <View style={styles.transactionLeft}>
                                <Avatar.Icon
                                    size={48}
                                    icon={isCredit ? 'cash-plus' : 'cash-minus'}
                                    style={{ backgroundColor: isCredit ? '#e8f5e9' : '#ffebee' }}
                                    color={isCredit ? '#2e7d32' : '#c62828'}
                                />
                                <View style={styles.transactionInfo}>
                                    <View style={styles.routeContainer}>
                                        <Text variant="bodyMedium" style={styles.cityText}>
                                            {getLocationCity(item.origin)}
                                        </Text>
                                        <Avatar.Icon size={16} icon="arrow-right" style={{ backgroundColor: 'transparent' }} color="#999" />
                                        <Text variant="bodyMedium" style={styles.cityText}>
                                            {getLocationCity(item.destination)}
                                        </Text>
                                    </View>
                                    <Text variant="bodySmall" style={styles.dateText}>
                                        {formatDate(item.date)} • {formatTime(item.date)}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.transactionRight}>
                                <Text
                                    variant="titleMedium"
                                    style={{
                                        fontWeight: 'bold',
                                        color: isCredit ? '#2e7d32' : '#c62828'
                                    }}
                                >
                                    {isCredit ? '+' : '-'}₹{Math.abs(item.amount)}
                                </Text>
                                <IconButton
                                    icon={isExpanded ? 'chevron-up' : 'chevron-down'}
                                    size={20}
                                    style={{ margin: 0 }}
                                />
                            </View>
                        </View>

                        {isExpanded && (
                            <View style={styles.expandedContent}>
                                <Divider style={{ marginVertical: 12 }} />

                                {/* Route Details */}
                                <View style={styles.detailSection}>
                                    <Text variant="labelSmall" style={styles.detailLabel}>ROUTE DETAILS</Text>
                                    <View style={styles.routeDetail}>
                                        <View style={styles.routePoint}>
                                            <View style={[styles.routeDot, { backgroundColor: '#4caf50' }]} />
                                            <View style={{ flex: 1 }}>
                                                <Text variant="bodySmall" style={styles.locationLabel}>From</Text>
                                                <Text variant="bodyMedium" style={styles.locationText}>
                                                    {getLocationFull(item.origin)}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.routeLine} />
                                        <View style={styles.routePoint}>
                                            <View style={[styles.routeDot, { backgroundColor: '#f44336' }]} />
                                            <View style={{ flex: 1 }}>
                                                <Text variant="bodySmall" style={styles.locationLabel}>To</Text>
                                                <Text variant="bodyMedium" style={styles.locationText}>
                                                    {getLocationFull(item.destination)}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                {/* Ride Info */}
                                <View style={styles.detailSection}>
                                    <Text variant="labelSmall" style={styles.detailLabel}>RIDE INFORMATION</Text>
                                    <View style={styles.infoGrid}>
                                        <View style={styles.infoItem}>
                                            <Avatar.Icon
                                                size={24}
                                                icon="seat-passenger"
                                                style={{ backgroundColor: 'transparent', marginBottom: 4 }}
                                                color="#2196f3"
                                            />
                                            <Text variant="bodySmall" style={styles.infoLabel}>Seats</Text>
                                            <Text variant="bodyMedium" style={styles.infoValue}>{item.seats}</Text>
                                        </View>
                                        <View style={styles.infoItem}>
                                            <Avatar.Icon
                                                size={24}
                                                icon={item.paymentMethod === 'Cash on Delivery' ? 'cash' : 'bank-transfer'}
                                                style={{ backgroundColor: 'transparent', marginBottom: 4 }}
                                                color={item.paymentMethod === 'Cash on Delivery' ? '#4caf50' : '#2196f3'}
                                            />
                                            <Text variant="bodySmall" style={styles.infoLabel}>Payment</Text>
                                            <Text variant="bodySmall" style={[styles.infoValue, { textAlign: 'center', fontSize: 11 }]}>
                                                {item.paymentMethod}
                                            </Text>
                                        </View>
                                        <View style={styles.infoItem}>
                                            <Avatar.Icon
                                                size={24}
                                                icon="check-circle"
                                                style={{ backgroundColor: 'transparent', marginBottom: 4 }}
                                                color="#4caf50"
                                            />
                                            <Text variant="bodySmall" style={styles.infoLabel}>Status</Text>
                                            <Chip
                                                mode="flat"
                                                style={{ backgroundColor: '#4caf50' + '20', height: 24 }}
                                                textStyle={{ color: '#4caf50', fontSize: 11 }}
                                            >
                                                {item.status}
                                            </Chip>
                                        </View>
                                    </View>
                                </View>

                                {/* Driver/Passenger Info */}
                                {item.driver && (
                                    <View style={styles.detailSection}>
                                        <Text variant="labelSmall" style={styles.detailLabel}>DRIVER</Text>
                                        <View style={styles.personInfo}>
                                            <Avatar.Text
                                                size={32}
                                                label={item.driver.name?.charAt(0).toUpperCase() || 'D'}
                                                style={{ backgroundColor: '#2196f3' }}
                                            />
                                            <View style={{ marginLeft: 12 }}>
                                                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                                                    {item.driver.name || 'Driver'}
                                                </Text>
                                                <Text variant="bodySmall" style={{ color: '#666' }}>
                                                    ID: {item.driver.uniqueId || item.driver._id || 'N/A'}
                                                </Text>
                                                <Text variant="bodySmall" style={{ color: '#666' }}>
                                                    ⭐ {item.driver.rating || 'N/A'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
                {index < transactions.length - 1 && <Divider />}
            </React.Fragment>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
                <View style={styles.headerTop}>
                    <IconButton icon="arrow-left" iconColor="#fff" size={24} onPress={() => navigation.goBack()} />
                    <Text variant="titleLarge" style={styles.headerTitle}>Payment Dashboard</Text>
                    <IconButton icon="refresh" iconColor="#fff" size={24} onPress={onRefresh} />
                </View>

                {/* Wallet Card */}
                <Card style={styles.walletCard}>
                    <Card.Content>
                        <View style={styles.walletHeader}>
                            <View>
                                <Text variant="bodyMedium" style={{ color: 'rgba(255,255,255,0.8)' }}>Net Balance</Text>
                                <Text variant="bodySmall" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10 }}>
                                    ID: {user?.uniqueId || user?._id || 'N/A'}
                                </Text>
                            </View>
                            <Avatar.Icon size={32} icon="wallet" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} color="#fff" />
                        </View>
                        <Text variant="displaySmall" style={styles.balanceText}>
                            {balance >= 0 ? '₹' + balance.toFixed(2) : '-₹' + Math.abs(balance).toFixed(2)}
                        </Text>
                        <View style={styles.walletActions}>
                            <Button
                                mode="contained"
                                style={styles.actionButton}
                                buttonColor="#fff"
                                textColor={theme.colors.primary}
                                icon="plus"
                                onPress={() => { }}
                            >
                                Add Money
                            </Button>
                            <Button
                                mode="outlined"
                                style={[styles.actionButton, { borderColor: 'rgba(255,255,255,0.5)' }]}
                                textColor="#fff"
                                icon="bank-transfer"
                                onPress={() => { }}
                            >
                                Withdraw
                            </Button>
                        </View>
                    </Card.Content>
                </Card>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={{ paddingBottom: 20 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Transaction History */}
                <View style={styles.section}>
                    <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Transaction History
                    </Text>
                    <Card style={styles.historyCard}>
                        {loading ? (
                            <View style={{ padding: 20 }}>
                                <ActivityIndicator size="small" />
                            </View>
                        ) : transactions.length === 0 ? (
                            <View style={{ padding: 20, alignItems: 'center' }}>
                                <Avatar.Icon size={64} icon="receipt-text-outline" style={{ backgroundColor: '#f5f5f5' }} color="#999" />
                                <Text style={{ color: '#666', marginTop: 12 }}>No transactions yet</Text>
                                <Text variant="bodySmall" style={{ color: '#999', marginTop: 4 }}>
                                    Your completed rides will appear here
                                </Text>
                            </View>
                        ) : (
                            transactions.map((item, index) => renderTransaction(item, index))
                        )}
                    </Card>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 40,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 4,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    headerTitle: {
        color: '#fff',
        fontWeight: 'bold',
    },
    walletCard: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    walletHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    balanceText: {
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 20,
    },
    walletActions: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        flex: 1,
        borderRadius: 10,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 15,
        marginLeft: 5,
    },
    historyCard: {
        borderRadius: 15,
        overflow: 'hidden',
    },
    transactionItem: {
        padding: 16,
    },
    transactionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    transactionInfo: {
        marginLeft: 12,
        flex: 1,
    },
    routeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    cityText: {
        fontWeight: 'bold',
        color: '#333',
    },
    dateText: {
        color: '#666',
        marginTop: 4,
    },
    transactionRight: {
        alignItems: 'flex-end',
    },
    expandedContent: {
        marginTop: 8,
    },
    detailSection: {
        marginBottom: 16,
    },
    detailLabel: {
        color: '#999',
        fontWeight: 'bold',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    routeDetail: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 12,
    },
    routePoint: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    routeDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginTop: 4,
        borderWidth: 2,
        borderColor: '#fff',
        elevation: 2,
    },
    routeLine: {
        width: 2,
        height: 20,
        backgroundColor: '#e0e0e0',
        marginLeft: 5,
        marginVertical: 4,
    },
    locationLabel: {
        color: '#999',
        fontSize: 11,
        marginBottom: 2,
    },
    locationText: {
        color: '#333',
        fontWeight: '500',
    },
    infoGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    infoItem: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    infoLabel: {
        color: '#999',
        fontSize: 11,
        marginBottom: 4,
    },
    infoValue: {
        color: '#333',
        fontWeight: 'bold',
    },
    personInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 12,
    },
});

