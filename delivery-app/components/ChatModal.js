import React, { useState, useEffect, useRef, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    FlatList,
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { messageService } from '../services/messageService';
import { API_URL } from '../services/api';
import { getProfilePhotoUrl } from '../utils/imageUtils';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js/react-native';

// Configure Pusher for React Native
window.Pusher = Pusher;

const ChatModal = ({ order, visible, onClose }) => {
    const { user, token } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const flatListRef = useRef(null);
    const echoRef = useRef(null);

    useEffect(() => {
        if (visible && order) {
            loadMessages();
            setupEcho();

            // Polling fallback
            const intervalId = setInterval(() => {
                loadMessages(true);
            }, 3000);

            return () => {
                clearInterval(intervalId);
                if (echoRef.current) {
                    echoRef.current.leaveChannel(`private-order.${order.id}`);
                    echoRef.current.disconnect();
                }
            };
        }
    }, [visible, order]);

    const setupEcho = () => {
        if (!order) return;

        try {
            echoRef.current = new Echo({
                broadcaster: 'reverb',
                key: 'bgzcymqswrd5dunafh0b',
                wsHost: 'gelatoapp-production.up.railway.app',
                wsPort: 443,
                wssPort: 443,
                forceTLS: true,
                disableStats: true,
                enabledTransports: ['ws', 'wss'],
                authEndpoint: 'https://gelatoapp-production.up.railway.app/broadcasting/auth',
                auth: {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                },
            });

            echoRef.current
                .private(`order.${order.id}`)
                .listen('MessageSent', (e) => {
                    console.log('New message received:', e.message);
                    setMessages((prev) => {
                        if (prev.some(m => m.id === e.message.id)) return prev;
                        return [...prev, e.message];
                    });
                });
        } catch (error) {
            console.error('Error setting up Echo:', error);
        }
    };

    const loadMessages = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const data = await messageService.getMessages(order.id);

            setMessages((prev) => {
                if (!data) return prev;
                // Merge with temp messages
                const serverIds = new Set(data.map(m => m.id));
                const localTemp = prev.filter(m => typeof m.id === 'number' && m.id > 1700000000000 && !serverIds.has(m.id));
                return [...data, ...localTemp];
            });

            if (!silent) setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const scrollToBottom = () => {
        if (flatListRef.current && messages.length > 0) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    };

    const isMyMessage = (message) => {
        return message.sender_id === user.id;
    };

    const getOtherParticipant = () => {
        if (!order) return null;
        if (user.role?.name === 'cliente') {
            return order.delivery_person;
        }
        return order.user;
    };

    const otherParticipant = getOtherParticipant();

    const renderMessage = ({ item }) => {
        const isMine = isMyMessage(item);
        return (
            <View style={[
                styles.messageContainer,
                isMine ? styles.myMessageContainer : styles.theirMessageContainer
            ]}>
                <View style={[
                    styles.messageBubble,
                    isMine ? styles.myMessageBubble : styles.theirMessageBubble
                ]}>
                    {!isMine && (
                        <Text style={styles.senderName}>{item.sender?.name}</Text>
                    )}
                    <Text style={[
                        styles.messageText,
                        isMine ? styles.myMessageText : styles.theirMessageText
                    ]}>
                        {item.content}
                    </Text>
                    <Text style={[
                        styles.timestamp,
                        isMine ? styles.myTimestamp : styles.theirTimestamp
                    ]}>
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerInfo}>
                        <View style={styles.avatarContainer}>
                            {otherParticipant?.profile_photo_url ? (
                                <Image
                                    source={{ uri: getProfilePhotoUrl(otherParticipant.profile_photo_url) }}
                                    style={styles.avatar}
                                />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarPlaceholderText}>
                                        {otherParticipant?.name?.charAt(0).toUpperCase() || '?'}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.onlineIndicator} />
                        </View>
                        <View>
                            <Text style={styles.headerName}>{otherParticipant?.name || 'Usuario'}</Text>
                            <Text style={styles.headerSubtext}>Pedido #{order?.id}</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Feather name="x" size={24} color="#000" />
                    </TouchableOpacity>
                </View>

                {/* Messages */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.messagesList}
                    onContentSizeChange={scrollToBottom}
                    ListEmptyComponent={
                        !loading && (
                            <View style={styles.emptyState}>
                                <Feather name="message-circle" size={48} color="#d1d5db" />
                                <Text style={styles.emptyStateText}>Sin mensajes</Text>
                                <Text style={styles.emptyStateSubtext}>Inicia la conversación</Text>
                            </View>
                        )
                    }
                />

                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#000" />
                    </View>
                )}

                {/* Input */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
                >
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={newMessage}
                            onChangeText={setNewMessage}
                            placeholder="Escribe un mensaje..."
                            placeholderTextColor="#9ca3af"
                            multiline
                        />
                        <TouchableOpacity
                            style={[styles.sendButton, (!newMessage.trim() || sending) && styles.sendButtonDisabled]}
                            onPress={handleSendMessage}
                            disabled={!newMessage.trim() || sending}
                        >
                            {sending ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Feather name="send" size={20} color="#fff" />
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    headerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#111827',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarPlaceholderText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#10b981',
        borderWidth: 2,
        borderColor: '#fff',
    },
    headerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    headerSubtext: {
        fontSize: 12,
        color: '#6b7280',
    },
    closeButton: {
        padding: 8,
    },
    messagesList: {
        padding: 16,
        paddingBottom: 32,
    },
    messageContainer: {
        marginBottom: 12,
        flexDirection: 'row',
    },
    myMessageContainer: {
        justifyContent: 'flex-end',
    },
    theirMessageContainer: {
        justifyContent: 'flex-start',
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
    },
    myMessageBubble: {
        backgroundColor: '#111827',
        borderTopRightRadius: 4,
    },
    theirMessageBubble: {
        backgroundColor: '#f3f4f6',
        borderTopLeftRadius: 4,
    },
    senderName: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#6b7280',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
    },
    myMessageText: {
        color: '#fff',
    },
    theirMessageText: {
        color: '#111827',
    },
    timestamp: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    myTimestamp: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    theirTimestamp: {
        color: '#9ca3af',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
        opacity: 0.5,
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 16,
    },
    emptyStateSubtext: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 4,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        backgroundColor: '#f9fafb',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 12,
        fontSize: 14,
        color: '#111827',
        maxHeight: 100,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#111827',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
});

export default ChatModal;
