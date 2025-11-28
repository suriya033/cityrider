import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { Card, Text, Avatar, ActivityIndicator } from 'react-native-paper';
import { messagesAPI } from '../../services/api';
import { format } from 'date-fns';

export default function MessagesScreen({ navigation }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response = await messagesAPI.getConversations();
      setConversations(response.data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const renderConversationItem = ({ item }) => {
    const lastMessage = item.lastMessage;
    const partner = item.user;

    if (!partner) return null; // Skip if partner user is missing

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('Chat', {
            userId: partner._id,
            userName: partner.name,
            rideId: lastMessage?.rideId,
          })
        }
      >
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Avatar.Text
              size={50}
              label={partner.name?.charAt(0).toUpperCase() || '?'}
              style={styles.avatar}
            />
            <View style={styles.messageContent}>
              <View style={styles.messageHeader}>
                <Text variant="titleMedium" style={styles.partnerName}>
                  {partner.name || 'Unknown User'}
                </Text>
                {lastMessage && (
                  <Text variant="bodySmall" style={styles.timestamp}>
                    {format(new Date(lastMessage.createdAt), 'HH:mm')}
                  </Text>
                )}
              </View>
              {lastMessage && (
                <Text
                  variant="bodyMedium"
                  style={styles.messagePreview}
                  numberOfLines={1}
                >
                  {lastMessage.message}
                </Text>
              )}
              {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text variant="labelSmall" style={styles.unreadText}>
                    {item.unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

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

      {/* FIXED HEADER - Does not scroll */}
      <View style={styles.headerContainer}>
        <Text variant="headlineMedium" style={styles.headerTitle}>Messages</Text>
      </View>

      {/* SCROLLABLE MESSAGES LIST */}
      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.user?._id || Math.random().toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Card style={styles.emptyCard}>
              <Card.Content style={{ alignItems: 'center' }}>
                <Text variant="titleMedium" style={{ marginBottom: 8 }}>No messages yet</Text>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  Start a conversation by booking a ride!
                </Text>
              </Card.Content>
            </Card>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    paddingTop: 30,
    paddingBottom: 5,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(98,0,238,0.9)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    marginBottom: 12,
    elevation: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  avatar: {
    marginRight: 16,
    backgroundColor: '#6200ee',
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  partnerName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  timestamp: {
    color: '#666',
    fontSize: 12,
  },
  messagePreview: {
    color: '#666',
  },
  unreadBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#6200ee',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
  },
});
