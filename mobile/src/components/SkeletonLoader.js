import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const SkeletonLoader = ({ width: customWidth, height, borderRadius = 8, style }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-Dimensions.get('window').width, Dimensions.get('window').width],
    });

    return (
        <View
            style={[
                styles.skeleton,
                {
                    width: customWidth || '100%',
                    height: height || 20,
                    borderRadius,
                },
                style,
            ]}
        >
            <Animated.View
                style={[
                    StyleSheet.absoluteFill,
                    {
                        transform: [{ translateX }],
                    },
                ]}
            >
                <LinearGradient
                    colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
        </View>
    );
};

export const RideCardSkeleton = () => {
    return (
        <View style={styles.cardSkeleton}>
            <View style={styles.cardHeader}>
                <SkeletonLoader width={120} height={16} />
                <SkeletonLoader width={80} height={24} borderRadius={12} />
            </View>

            <View style={styles.divider} />

            <View style={styles.routeSection}>
                <View style={styles.routeRow}>
                    <SkeletonLoader width={12} height={12} borderRadius={6} style={{ marginRight: 12 }} />
                    <SkeletonLoader width="80%" height={18} />
                </View>
                <View style={styles.routeRow}>
                    <SkeletonLoader width={12} height={12} borderRadius={6} style={{ marginRight: 12 }} />
                    <SkeletonLoader width="75%" height={18} />
                </View>
            </View>

            <View style={styles.statsRow}>
                <SkeletonLoader width={60} height={16} />
                <SkeletonLoader width={60} height={16} />
                <SkeletonLoader width={60} height={16} />
            </View>
        </View>
    );
};

export const BookingCardSkeleton = () => {
    return (
        <View style={styles.cardSkeleton}>
            <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                    <SkeletonLoader width="60%" height={18} style={{ marginBottom: 8 }} />
                    <SkeletonLoader width="40%" height={14} />
                </View>
                <SkeletonLoader width={80} height={24} borderRadius={12} />
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsSection}>
                <SkeletonLoader width="100%" height={14} style={{ marginBottom: 8 }} />
                <SkeletonLoader width="80%" height={14} style={{ marginBottom: 8 }} />
                <SkeletonLoader width="60%" height={14} style={{ marginBottom: 8 }} />
                <SkeletonLoader width="70%" height={14} />
            </View>

            <View style={styles.buttonRow}>
                <SkeletonLoader width="48%" height={40} borderRadius={8} />
                <SkeletonLoader width="48%" height={40} borderRadius={8} />
            </View>
        </View>
    );
};

export const ProfileSkeleton = () => {
    return (
        <View style={styles.profileSkeleton}>
            <View style={styles.profileHeader}>
                <SkeletonLoader width={80} height={80} borderRadius={40} />
                <View style={{ flex: 1, marginLeft: 16 }}>
                    <SkeletonLoader width="60%" height={20} style={{ marginBottom: 8 }} />
                    <SkeletonLoader width="40%" height={14} style={{ marginBottom: 8 }} />
                    <SkeletonLoader width="50%" height={14} />
                </View>
            </View>

            <View style={styles.divider} />

            {[1, 2, 3, 4, 5].map((item) => (
                <View key={item} style={styles.menuItem}>
                    <SkeletonLoader width={40} height={40} borderRadius={8} />
                    <View style={{ flex: 1, marginLeft: 16 }}>
                        <SkeletonLoader width="50%" height={16} style={{ marginBottom: 6 }} />
                        <SkeletonLoader width="70%" height={12} />
                    </View>
                    <SkeletonLoader width={24} height={24} borderRadius={12} />
                </View>
            ))}
        </View>
    );
};

export const ListSkeleton = ({ count = 3, type = 'ride' }) => {
    const SkeletonComponent = type === 'booking' ? BookingCardSkeleton : RideCardSkeleton;

    return (
        <View style={styles.listSkeleton}>
            {Array(count).fill(0).map((_, index) => (
                <SkeletonComponent key={index} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: '#e0e0e0',
        overflow: 'hidden',
    },
    cardSkeleton: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 12,
    },
    routeSection: {
        marginBottom: 16,
    },
    routeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    detailsSection: {
        marginBottom: 16,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    profileSkeleton: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        padding: 16,
        margin: 16,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    listSkeleton: {
        padding: 16,
    },
});

export default SkeletonLoader;
