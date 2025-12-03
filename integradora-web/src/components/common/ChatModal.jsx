import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Loader2 } from 'lucide-react';
import { messageService } from '../../api/messageService';
import { useSelector } from 'react-redux';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { getProfilePhotoUrl } from '../../utils/imageUtils';
import Alert from './Alert';

window.Pusher = Pusher;

const ChatModal = ({ order, onClose }) => {
    const { user, token } = useSelector((state) => state.auth);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const messagesEndRef = useRef(null);
    const echoRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        loadMessages();
        setupEcho();

        return () => {
            if (echoRef.current) {
                echoRef.current.leaveChannel(`private-order.${order.id}`);
                echoRef.current.disconnect();
            }
        };
    }, [order.id]);

    const setupEcho = () => {
        try {
            echoRef.current = new Echo({
                broadcaster: 'reverb',
                key: process.env.REACT_APP_REVERB_APP_KEY || 'your-app-key',
                wsHost: process.env.REACT_APP_REVERB_HOST || 'localhost',
                wsPort: process.env.REACT_APP_REVERB_PORT || 8080,
                wssPort: process.env.REACT_APP_REVERB_PORT || 8080,
                forceTLS: (process.env.REACT_APP_REVERB_SCHEME || 'http') === 'https',
                enabledTransports: ['ws', 'wss'],
                auth: {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            });

            echoRef.current
                .private(`order.${order.id}`)
                .listen('MessageSent', (e) => {
                    console.log('New message received:', e.message);
                    setMessages((prev) => [...prev, e.message]);
                });
        } catch (error) {
            console.error('Error setting up Echo:', error);
        }
    };

    const loadMessages = async () => {
        try {
            setLoading(true);
            const data = await messageService.getMessages(order.id);
            setMessages(data || []);
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        try {
            setSending(true);
            const message = await messageService.sendMessage(order.id, newMessage.trim());
            setMessages((prev) => [...prev, message]);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            setErrorMessage('Error al enviar el mensaje');
            setTimeout(() => setErrorMessage(''), 3000);
        } finally {
            setSending(false);
        }
    };

    const isMyMessage = (message) => {
        return message.sender_id === user.id;
    };

    const getOtherParticipant = () => {
        if (user.role?.name === 'cliente') {
            return order.delivery_person;
        }
        return order.user;
    };

    const otherParticipant = getOtherParticipant();

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh] overflow-hidden border border-gray-100">
                {/* Minimalist Header */}
                <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                                {otherParticipant?.profile_photo_url ? (
                                    <img
                                        src={getProfilePhotoUrl(otherParticipant.profile_photo_url)}
                                        alt={otherParticipant.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-black text-white font-bold text-lg">
                                        {otherParticipant?.name?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-black uppercase tracking-wide">
                                {otherParticipant?.name || 'Usuario'}
                            </h2>
                            <p className="text-xs text-gray-500 font-medium">
                                {user.role?.name === 'cliente' ? 'Repartidor' : 'Cliente'} • Pedido #{order.id}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-black"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white relative">
                    {errorMessage && (
                        <div className="absolute top-4 left-4 right-4 z-10">
                            <Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} />
                        </div>
                    )}

                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-8 h-8 text-black animate-spin" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <MessageCircle className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-sm font-bold text-black uppercase">Sin mensajes</p>
                            <p className="text-xs text-gray-500 mt-1">Inicia la conversación</p>
                        </div>
                    ) : (
                        <>
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-sm ${isMyMessage(message)
                                            ? 'bg-black text-white rounded-tr-none'
                                            : 'bg-gray-100 text-black rounded-tl-none'
                                            }`}
                                    >
                                        {!isMyMessage(message) && (
                                            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">
                                                {message.sender?.name}
                                            </p>
                                        )}
                                        <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap break-words">
                                            {message.content}
                                        </p>
                                        <p
                                            className={`text-[10px] mt-1.5 text-right ${isMyMessage(message) ? 'text-white/60' : 'text-gray-400'
                                                }`}
                                        >
                                            {new Date(message.created_at).toLocaleTimeString('es-MX', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100">
                    <div className="flex gap-3 items-center bg-gray-50 rounded-full px-4 py-2 border border-gray-200 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Escribe un mensaje..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium placeholder-gray-400 text-black"
                            disabled={sending}
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || sending}
                            className="w-10 h-10 flex items-center justify-center bg-black text-white rounded-full hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:scale-105 active:scale-95"
                        >
                            {sending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4 ml-0.5" />
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatModal;
