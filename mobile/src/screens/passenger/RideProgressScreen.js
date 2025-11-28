import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Dimensions,
    ImageBackground,
    Animated,
} from 'react-native';
import {
    Card,
    Text,
    Button,
    Avatar,
    Chip,
    Divider,
    ProgressBar,
    IconButton,
} from 'react-native-paper';
import { format } from 'date-fns';
import RideMapView from '../../components/MapView';

export default function RideProgressScreen({ route, navigation }) {
    const { booking } = route.params;
    const [progress, setProgress] = useState(0);
    const [currentStatus, setCurrentStatus] = useState('waiting');
    const [pulseAnim] = useState(new Animated.Value(1));

    useEffect(() => {
        // Pulse animation for active status
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Simulate progress based on booking status
        updateProgressFromStatus();
    }, [booking.status]);

    const updateProgressFromStatus = () => {
        switch (booking.status) {
            case 'registered':
                setProgress(0.2);
                setCurrentStatus('waiting');
                break;
            case 'accepted':
                setProgress(0.4);
                setCurrentStatus('accepted');
                break;
            case 'confirmed':
                setProgress(0.6);
                setCurrentStatus('ongoing');
                break;
            case 'completed':
                setProgress(1.0);
                setCurrentStatus('completed');
                break;
            default:
                setProgress(0);
                setCurrentStatus('waiting');
        }
    };

    const ride = booking?.rideId;
    if (!ride || !ride.departureTime) return null;

    const formattedDate = format(new Date(ride.departureTime), 'MMM dd, yyyy');
    const formattedTime = format(new Date(ride.departureTime), 'HH:mm');

    const statusSteps = [
        { key: 'registered', label: 'Registered', icon: 'check-circle', color: '#2196f3' },
        { key: 'accepted', label: 'Accepted', icon: 'account-check', color: '#00bcd4' },
        { key: 'confirmed', label: 'In Progress', icon: 'car', color: '#4caf50' },
        { key: 'completed', label: 'Completed', icon: 'flag-checkered', color: '#9e9e9e' },
    ];

    const getStepStatus = (stepKey) => {
        const stepIndex = statusSteps.findIndex(s => s.key === stepKey);
        const currentIndex = statusSteps.findIndex(s => s.key === booking.status);

        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'active';
        return 'pending';
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../../../assets/bg1.jpg')}
                style={styles.background}
                resizeMode="cover"
            >
                {/* Header */}
                <View style={styles.header}>
                    <IconButton
                        icon="arrow-left"
                        iconColor="#fff"
                        size={24}
                        onPress={() => navigation.goBack()}
                    />
                    <Text variant="titleLarge" style={styles.headerTitle}>Ride Progress</Text>
                    <IconButton
                        icon="phone"
                        iconColor="#fff"
                        size={24}
                        onPress={() => { }}
                    />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Progress Bar */}
                    <Card style={styles.progressCard}>
                        <Card.Content>
                            <Text variant="titleMedium" style={styles.progressTitle}>
                                {currentStatus === 'waiting' && '⏳ Waiting for Driver'}
                                {currentStatus === 'accepted' && '✅ Driver Accepted'}
                                {currentStatus === 'ongoing' && '🚗 Ride in Progress'}
                                {currentStatus === 'completed' && '🎉 Ride Completed'}
                            </Text>
                            <ProgressBar
                                progress={progress}
                                color="#4caf50"
                                style={styles.progressBar}
                            />
                            <Text variant="bodySmall" style={styles.progressText}>
                                {Math.round(progress * 100)}% Complete
                            </Text>
                        </Card.Content>
                    </Card>

                    {/* Status Timeline */}
                    <Card style={styles.timelineCard}>
                        <Card.Content>
                            <Text variant="titleMedium" style={styles.sectionTitle}>Journey Status</Text>
                            <View style={styles.timeline}>
                                {statusSteps.map((step, index) => {
                                    const status = getStepStatus(step.key);
                                    const isActive = status === 'active';
                                    const isCompleted = status === 'completed';

                                    return (
                                        <View key={step.key} style={styles.timelineItem}>
                                            <View style={styles.timelineLeft}>
                                                <Animated.View
                                                    style={[
                                                        styles.timelineIconContainer,
                                                        {
                                                            backgroundColor: isCompleted || isActive ? step.color : '#e0e0e0',
                                                            transform: isActive ? [{ scale: pulseAnim }] : [{ scale: 1 }],
                                                        },
                                                    ]}
                                                >
                                                    <Avatar.Icon
                                                        size={40}
                                                        icon={step.icon}
                                                        style={{ backgroundColor: 'transparent' }}
                                                        color="#fff"
                                                    />
                                                </Animated.View>
                                                {index < statusSteps.length - 1 && (
                                                    <View
                                                        style={[
                                                            styles.timelineLine,
                                                            { backgroundColor: isCompleted ? step.color : '#e0e0e0' },
                                                        ]}
                                                    />
                                                )}
                                            </View>
                                            <View style={styles.timelineRight}>
                                                <Text
                                                    variant="titleSmall"
                                                    style={[
                                                        styles.timelineLabel,
                                                        { color: isCompleted || isActive ? step.color : '#999' },
                                                    ]}
                                                >
                                                    {step.label}
                                                </Text>
                                                {isActive && (
                                                    <Chip
                                                        mode="flat"
                                                        style={{ backgroundColor: `${step.color}20`, marginTop: 4 }}
                                                        textStyle={{ color: step.color, fontSize: 10 }}
                                                    >
                                                        Current
                                                    </Chip>
                                                )}
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        </Card.Content>
                    </Card>

                    {/* Map View */}
                    <Card style={styles.mapCard}>
                        <Card.Content>
                            <Text variant="titleMedium" style={styles.sectionTitle}>Route</Text>
                            <RideMapView
                                origin={ride.origin}
                                destination={ride.destination}
                                route={ride.route}
                            />
                        </Card.Content>
                    </Card>

                    {/* Ride Details */}
                    <Card style={styles.detailsCard}>
                        <Card.Content>
                            <Text variant="titleMedium" style={styles.sectionTitle}>Ride Details</Text>
                            <Divider style={styles.divider} />

                            <View style={styles.detailRow}>
                                <Avatar.Icon size={36} icon="map-marker" style={styles.detailIcon} color="#fff" />
                                <View style={styles.detailText}>
                                    <Text variant="labelSmall" style={styles.detailLabel}>From</Text>
                                    <Text variant="bodyMedium" style={styles.detailValue}>{ride.origin?.address || 'Unknown'}</Text>
                                </View>
                            </View>

                            <View style={styles.detailRow}>
                                <Avatar.Icon size={36} icon="map-marker-check" style={styles.detailIcon} color="#fff" />
                                <View style={styles.detailText}>
                                    <Text variant="labelSmall" style={styles.detailLabel}>To</Text>
                                    <Text variant="bodyMedium" style={styles.detailValue}>{ride.destination?.address || 'Unknown'}</Text>
                                </View>
                            </View>

                            <View style={styles.detailRow}>
                                <Avatar.Icon size={36} icon="calendar" style={styles.detailIcon} color="#fff" />
                                <View style={styles.detailText}>
                                    <Text variant="labelSmall" style={styles.detailLabel}>Date & Time</Text>
                                    <Text variant="bodyMedium" style={styles.detailValue}>
                                        {formattedDate} at {formattedTime}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.detailRow}>
                                <Avatar.Icon size={36} icon="seat" style={styles.detailIcon} color="#fff" />
                                <View style={styles.detailText}>
                                    <Text variant="labelSmall" style={styles.detailLabel}>Seats Booked</Text>
                                    <Text variant="bodyMedium" style={styles.detailValue}>{booking.seatsBooked}</Text>
                                </View>
                            </View>

                            <View style={styles.detailRow}>
                                <Avatar.Icon size={36} icon="cash" style={styles.detailIcon} color="#fff" />
                                <View style={styles.detailText}>
                                    <Text variant="labelSmall" style={styles.detailLabel}>Total Amount</Text>
                                    <Text variant="bodyMedium" style={styles.detailValue}>₹{booking.totalAmount}</Text>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>

                    {/* Driver Info */}
                    {ride.driverId && (
                        <Card style={styles.driverCard}>
                            <Card.Content>
                                <Text variant="titleMedium" style={styles.sectionTitle}>Driver Information</Text>
                                <Divider style={styles.divider} />

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
                                    <View style={styles.driverDetails}>
                                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                                            {ride.driverId.name || 'Unknown Driver'}
                                        </Text>
                                        <View style={styles.driverChips}>
                                            <Chip icon="star" mode="outlined" style={styles.chip}>
                                                {ride.driverId.rating || 'N/A'}
                                            </Chip>
                                            {ride.driverId.uniqueId && (
                                                <Chip icon="identifier" mode="outlined" style={[styles.chip, { backgroundColor: '#e3f2fd' }]} textStyle={{ color: '#1976d2', fontWeight: 'bold' }}>
                                                    ID: {ride.driverId.uniqueId}
                                                </Chip>
                                            )}
                                            <Chip icon="car" mode="outlined" style={styles.chip}>
                                                {ride.vehicleType}
                                            </Chip>
                                        </View>
                                    </View>
                                </View>

                                <Button
                                    mode="contained"
                                    icon="message-text"
                                    style={styles.chatButton}
                                    onPress={() =>
                                        navigation.navigate('Chat', {
                                            userId: ride.driverId._id,
                                            rideId: ride._id,
                                            userName: ride.driverId?.name || 'Driver',
                                        })
                                    }
                                >
                                    Chat with Driver
                                </Button>
                            </Card.Content>
                        </Card>
                    )}

                    {/* Verification Code */}
                    {booking.verificationCode && booking.status !== 'completed' && (
                        <Card style={styles.otpCard}>
                            <Card.Content>
                                <Text variant="titleMedium" style={styles.sectionTitle}>Verification Code</Text>
                                <Text variant="bodySmall" style={styles.otpHint}>
                                    Share this code with the driver
                                </Text>
                                <Text variant="displaySmall" style={styles.otpCode}>
                                    {booking.verificationCode}
                                </Text>
                            </Card.Content>
                        </Card>
                    )}
                </ScrollView>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 40,
        paddingBottom: 10,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(98, 0, 238, 0.9)',
    },
    headerTitle: {
        color: '#fff',
        fontWeight: 'bold',
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    progressCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        marginBottom: 16,
        elevation: 4,
    },
    progressTitle: {
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
        color: '#333',
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        marginBottom: 8,
    },
    progressText: {
        textAlign: 'center',
        color: '#666',
    },
    timelineCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        marginBottom: 16,
        elevation: 4,
    },
    timeline: {
        marginTop: 16,
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    timelineLeft: {
        alignItems: 'center',
        marginRight: 16,
    },
    timelineIconContainer: {
        borderRadius: 20,
        elevation: 2,
    },
    timelineLine: {
        width: 3,
        flex: 1,
        marginVertical: 4,
    },
    timelineRight: {
        flex: 1,
        paddingTop: 8,
    },
    timelineLabel: {
        fontWeight: 'bold',
    },
    mapCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        marginBottom: 16,
        elevation: 4,
    },
    detailsCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        marginBottom: 16,
        elevation: 4,
    },
    sectionTitle: {
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    divider: {
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    detailIcon: {
        backgroundColor: '#6200ee',
        marginRight: 12,
    },
    detailText: {
        flex: 1,
    },
    detailLabel: {
        color: '#666',
        marginBottom: 2,
    },
    detailValue: {
        fontWeight: '500',
        color: '#333',
    },
    driverCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        marginBottom: 16,
        elevation: 4,
    },
    driverInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    driverDetails: {
        marginLeft: 16,
        flex: 1,
    },
    driverChips: {
        flexDirection: 'row',
        marginTop: 8,
        gap: 8,
        flexWrap: 'wrap',
    },
    chip: {
        height: 28,
    },
    chatButton: {
        borderRadius: 8,
    },
    otpCard: {
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        borderRadius: 16,
        marginBottom: 16,
        elevation: 4,
        borderWidth: 2,
        borderColor: '#2196f3',
        borderStyle: 'dashed',
    },
    otpHint: {
        textAlign: 'center',
        color: '#1976d2',
        marginBottom: 8,
    },
    otpCode: {
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#0d47a1',
        letterSpacing: 8,
        fontFamily: 'monospace',
    },
});
