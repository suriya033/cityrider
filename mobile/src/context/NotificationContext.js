import React, { createContext, useState, useContext, useEffect } from 'react';
import { messagesAPI, bookingsAPI, ridesAPI } from '../services/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [pendingBookings, setPendingBookings] = useState(0);
    const [pendingRideRequests, setPendingRideRequests] = useState(0);

    const loadNotifications = async () => {
        try {
            // Load unread messages count
            const messagesResponse = await messagesAPI.getConversations();
            const unreadCount = messagesResponse.data.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
            setUnreadMessages(unreadCount);

            // Load pending bookings count (for passengers)
            try {
                const bookingsResponse = await bookingsAPI.getMyBookings();
                const pendingCount = bookingsResponse.data.filter(b => b.status === 'pending').length;
                setPendingBookings(pendingCount);
            } catch (error) {
                // User might not be a passenger
                setPendingBookings(0);
            }

            // Load pending ride requests count (for drivers)
            try {
                const ridesResponse = await ridesAPI.getMyRides();
                let totalPending = 0;
                for (const ride of ridesResponse.data) {
                    if (ride.status === 'active') {
                        const bookingsResponse = await ridesAPI.getRideBookings(ride._id);
                        const pending = bookingsResponse.data.filter(b => b.status === 'pending').length;
                        totalPending += pending;
                    }
                }
                setPendingRideRequests(totalPending);
            } catch (error) {
                // User might not be a driver
                setPendingRideRequests(0);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    const refreshNotifications = () => {
        loadNotifications();
    };

    useEffect(() => {
        loadNotifications();

        // Refresh notifications every 30 seconds
        const interval = setInterval(loadNotifications, 30000);

        return () => clearInterval(interval);
    }, []);

    return (
        <NotificationContext.Provider
            value={{
                unreadMessages,
                pendingBookings,
                pendingRideRequests,
                refreshNotifications,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};
