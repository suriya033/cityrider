// ChatScreen.js – Enhanced UI with glassmorphism, gradients, and smooth animations
import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import {
  TextInput,
  Text,
  Avatar,
  Appbar,
  ActivityIndicator,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { messagesAPI, API_BASE_URL } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { format } from 'date-fns';
import io from 'socket.io-client';

const { width } = Dimensions.get('window');

export default function ChatScreen({ route, navigation }) {
  const { userId, userName, rideId } = route.params;
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const socketRef = useRef(null);
  const flatListRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    loadMessages();

    // Initialize Socket.IO connection
    socketRef.current = io(API_BASE_URL.replace('/api', ''), {
      transports: ['websocket'],
    });

    if (rideId) {
      socketRef.current.emit('join-room', rideId);
    }

    socketRef.current.on('receive-message', (data) => {
      setMessages((prev) => [...prev, data]);
      scrollToBottom();
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const loadMessages = async () => {
    try {
      const response = await messagesAPI.getConversation(userId, rideId);
      setMessages(response.data);
      scrollToBottom();

      // Mark messages as read
      try {
        await messagesAPI.markConversationAsRead(userId, rideId);
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const shouldShowDateSeparator = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;
    const currentDate = new Date(currentMessage.createdAt).toDateString();
    const previousDate = new Date(previousMessage.createdAt).toDateString();
    return currentDate !== previousDate;
  };

  const formatDateSeparator = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) return 'Today';
    if (messageDate.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return format(messageDate, 'MMM dd, yyyy');
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const messageData = {
      receiverId: userId,
      message: message.trim(),
      rideId: rideId || null,
    };

    setSending(true);
    try {
      const response = await messagesAPI.send(messageData);
      setMessages((prev) => [...prev, response.data]);

      if (socketRef.current && rideId) {
        socketRef.current.emit('send-message', {
          ...response.data,
          rideId,
        });
      }

      setMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item, index }) => {
    const isMyMessage = item.senderId?._id === user?.id;
    const previousMessage = index > 0 ? messages[index - 1] : null;
    const showDateSeparator = shouldShowDateSeparator(item, previousMessage);
    const showAvatar = index === messages.length - 1 ||
      messages[index + 1]?.senderId?._id !== item.senderId?._id;

    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        {showDateSeparator && (
          <View style={styles.dateSeparatorContainer}>
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.2)', 'transparent']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.dateSeparatorLine}
            />
            <View style={styles.dateChip}>
              <Text style={styles.dateSeparatorText}>
                {formatDateSeparator(item.createdAt)}
              </Text>
            </View>
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.2)', 'transparent']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.dateSeparatorLine}
            />
          </View>
        )}

        <View
          style={[
            styles.messageContainer,
            isMyMessage ? styles.myMessage : styles.otherMessage,
          ]}
        >
          {!isMyMessage && (
            <View style={styles.avatarContainer}>
              {showAvatar ? (
                <Avatar.Text
                  size={32}
                  label={item.senderId?.name?.charAt(0).toUpperCase() || '?'}
                  style={styles.avatar}
                  color="#fff"
                />
              ) : (
                <View style={{ width: 32 }} />
              )}
            </View>
          )}
          <View
            style={[
              styles.messageBubble,
              isMyMessage ? styles.myBubble : styles.otherBubble,
            ]}
          >
            {!isMyMessage && (
              <Text variant="labelSmall" style={styles.senderName}>
                {item.senderId?.name || 'Unknown User'}
              </Text>
            )}
            <Text
              variant="bodyMedium"
              style={[styles.messageText, isMyMessage && styles.myMessageText]}
            >
              {item.message}
            </Text>
            <View style={styles.messageFooter}>
              <Text
                variant="bodySmall"
                style={[styles.timestamp, isMyMessage && styles.myTimestamp]}
              >
                {format(new Date(item.createdAt), 'HH:mm')}
              </Text>
              {isMyMessage && (
                <Text style={styles.checkmark}>✓✓</Text>
              )}
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../../assets/bg1.jpg')}
        style={styles.bgImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)']}
          style={StyleSheet.absoluteFill}
        />

        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
          <View style={styles.headerContent}>
            <Avatar.Text
              size={40}
              label={userName.charAt(0).toUpperCase()}
              style={styles.headerAvatar}
              color="#6200ee"
            />
            <View style={styles.headerTextContainer}>
              <Text variant="titleMedium" style={styles.headerTitle}>{userName}</Text>
              <Text variant="bodySmall" style={styles.headerSubtitle}>Online</Text>
            </View>
          </View>
        </Appbar.Header>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item._id}
            contentContainerStyle={messages.length === 0 ? styles.emptyList : styles.messagesList}
            onContentSizeChange={scrollToBottom}
            onLayout={scrollToBottom}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              !loading && (
                <View style={styles.emptyStateContainer}>
                  <View style={styles.emptyIconContainer}>
                    <Avatar.Icon
                      size={64}
                      icon="message-text-outline"
                      style={{ backgroundColor: 'transparent' }}
                      color="#fff"
                    />
                  </View>
                  <Text style={styles.emptyStateText}>No messages yet</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Start the conversation with {userName}
                  </Text>
                </View>
              )
            }
          />

          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <TouchableOpacity style={styles.attachButton}>
                <Avatar.Icon size={36} icon="plus" style={{ backgroundColor: 'transparent' }} color="#6200ee" />
              </TouchableOpacity>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Type a message..."
                placeholderTextColor="#999"
                mode="flat"
                style={styles.input}
                multiline
                maxLength={500}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                selectionColor="#6200ee"
              />
              <TouchableOpacity
                onPress={handleSendMessage}
                disabled={sending || !message.trim()}
                style={[
                  styles.sendButton,
                  (!message.trim() || sending) && styles.sendButtonDisabled
                ]}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <LinearGradient
                    colors={['#6200ee', '#3700b3']}
                    style={styles.sendGradient}
                  >
                    <Avatar.Icon
                      size={24}
                      icon="send"
                      style={{ backgroundColor: 'transparent' }}
                      color="#fff"
                    />
                  </LinearGradient>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgImage: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  header: {
    backgroundColor: 'rgba(98, 0, 238, 0.85)',
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerAvatar: {
    backgroundColor: '#fff',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  myMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    marginBottom: 4,
  },
  avatar: {
    backgroundColor: '#6200ee',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  myBubble: {
    backgroundColor: '#6200ee',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#6200ee',
    fontSize: 11,
  },
  messageText: {
    color: '#333',
    fontSize: 15,
    lineHeight: 22,
  },
  myMessageText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    color: '#999',
    alignSelf: 'flex-end',
  },
  myTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  inputWrapper: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 30,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  attachButton: {
    padding: 4,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 16,
    maxHeight: 100,
    paddingHorizontal: 12,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    overflow: 'hidden',
  },
  sendGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  dateSeparatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    justifyContent: 'center',
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
  },
  dateChip: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 10,
  },
  dateSeparatorText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  checkmark: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: 'bold',
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});
