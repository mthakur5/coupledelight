import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { messagesAPI, connectionsAPI } from '../utils/api';
import io from 'socket.io-client';
import './Messages.css';

function Messages({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [acceptedConnections, setAcceptedConnections] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const messageInputRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Initialize socket connection
    const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5001');
    socketRef.current = socket;
    
    socket.emit('join', user.id);

    // Listen for new messages
    socket.on('newMessage', (data) => {
      fetchConversations();
      if (selectedConversation && data.senderId === selectedConversation.userId) {
        fetchMessagesForConversation(selectedConversation.userId);
      }
    });

    // Listen for message read events
    socket.on('messageRead', () => {
      fetchConversations();
    });

    fetchConversations();
    fetchAcceptedConnections();

    // Check if coming from another page with recipient info
    if (location.state?.recipientId) {
      const recipient = {
        userId: location.state.recipientId,
        email: location.state.recipientEmail,
        name: location.state.recipientName
      };
      setSelectedConversation(recipient);
      fetchMessagesForConversation(location.state.recipientId);
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [user, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchAcceptedConnections = async () => {
    try {
      const response = await connectionsAPI.getAccepted();
      setAcceptedConnections(response.data.connections || []);
    } catch (err) {
      console.error('Error fetching connections:', err);
    }
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const [inboxRes, sentRes] = await Promise.all([
        messagesAPI.getInbox(),
        messagesAPI.getSent()
      ]);

      const allMessages = [
        ...(inboxRes.data.messages || []),
        ...(sentRes.data.messages || [])
      ];

      // Group messages by conversation
      const conversationMap = new Map();
      
      allMessages.forEach(msg => {
        const otherUserId = msg.sender._id === user.id ? msg.receiver._id : msg.sender._id;
        const otherUser = msg.sender._id === user.id ? msg.receiver : msg.sender;
        const otherProfile = msg.sender._id === user.id ? msg.receiverProfile : msg.senderProfile;
        
        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            userId: otherUserId,
            email: otherUser.email,
            name: otherProfile?.name || otherProfile?.coupleName || otherUser.email,
            lastMessage: msg.message,
            lastMessageTime: msg.createdAt,
            unread: msg.sender._id !== user.id && !msg.read ? 1 : 0,
            profilePicture: otherProfile?.profilePicture
          });
        } else {
          const conv = conversationMap.get(otherUserId);
          if (new Date(msg.createdAt) > new Date(conv.lastMessageTime)) {
            conv.lastMessage = msg.message;
            conv.lastMessageTime = msg.createdAt;
          }
          if (msg.sender._id !== user.id && !msg.read) {
            conv.unread += 1;
          }
        }
      });

      const convArray = Array.from(conversationMap.values())
        .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
      
      setConversations(convArray);
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessagesForConversation = async (userId) => {
    try {
      const [inboxRes, sentRes] = await Promise.all([
        messagesAPI.getInbox(),
        messagesAPI.getSent()
      ]);

      const allMessages = [
        ...(inboxRes.data.messages || []),
        ...(sentRes.data.messages || [])
      ];

      const conversationMessages = allMessages
        .filter(msg => 
          (msg.sender._id === userId && msg.receiver._id === user.id) ||
          (msg.sender._id === user.id && msg.receiver._id === userId)
        )
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      setMessages(conversationMessages);

      // Mark unread messages as read
      conversationMessages.forEach(msg => {
        if (msg.sender._id === userId && !msg.read) {
          messagesAPI.markAsRead(msg._id).catch(console.error);
          socketRef.current?.emit('messageRead', {
            messageId: msg._id,
            senderId: userId
          });
        }
      });

      fetchConversations();
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const response = await messagesAPI.sendMessage({
        receiverId: selectedConversation.userId,
        subject: 'Chat Message',
        message: newMessage.trim()
      });

      socketRef.current?.emit('sendMessage', {
        receiverId: selectedConversation.userId,
        messageId: response.data.messageId
      });

      setNewMessage('');
      fetchMessagesForConversation(selectedConversation.userId);
      fetchConversations();
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleStartNewChat = (connection) => {
    const newConv = {
      userId: connection.userId,
      email: connection.user?.email,
      name: connection.profile?.name || connection.profile?.coupleName || connection.user?.email,
      profilePicture: connection.profile?.profilePicture
    };
    setSelectedConversation(newConv);
    fetchMessagesForConversation(connection.userId);
    setShowNewChat(false);
  };

  const formatTime = (date) => {
    const now = new Date();
    const msgDate = new Date(date);
    const diff = now - msgDate;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return msgDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return msgDate.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return msgDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const filteredConnections = acceptedConnections.filter(conn => {
    const name = conn.profile?.name || conn.profile?.coupleName || conn.user?.email || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (!user) return null;

  return (
    <div className="chat-container">
      {/* Sidebar - Conversations List */}
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>Messages</h2>
          <button className="new-chat-btn" onClick={() => setShowNewChat(true)} title="New Chat">
            ✏️
          </button>
        </div>

        {loading ? (
          <div className="loading-center">
            <div className="spinner-small"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="empty-conversations">
            <div className="empty-icon">💬</div>
            <p>No conversations yet</p>
            <button onClick={() => setShowNewChat(true)} className="start-chat-btn">
              Start a new chat
            </button>
          </div>
        ) : (
          <div className="conversations-list">
            {conversations.map((conv) => (
              <div
                key={conv.userId}
                className={`conversation-item ${selectedConversation?.userId === conv.userId ? 'active' : ''}`}
                onClick={() => {
                  setSelectedConversation(conv);
                  fetchMessagesForConversation(conv.userId);
                }}
              >
                <div className="conv-avatar">
                  {conv.profilePicture ? (
                    <img src={conv.profilePicture} alt={conv.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {conv.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="conv-info">
                  <div className="conv-header">
                    <span className="conv-name">{conv.name}</span>
                    <span className="conv-time">{formatTime(conv.lastMessageTime)}</span>
                  </div>
                  <div className="conv-preview">
                    <span className={conv.unread > 0 ? 'unread-text' : ''}>
                      {conv.lastMessage.substring(0, 50)}{conv.lastMessage.length > 50 ? '...' : ''}
                    </span>
                    {conv.unread > 0 && <span className="unread-badge">{conv.unread}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="chat-main">
        {selectedConversation ? (
          <>
            <div className="chat-header">
              <div className="chat-header-info">
                <div className="header-avatar">
                  {selectedConversation.profilePicture ? (
                    <img src={selectedConversation.profilePicture} alt={selectedConversation.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {selectedConversation.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h3>{selectedConversation.name}</h3>
                  <p className="header-email">{selectedConversation.email}</p>
                </div>
              </div>
              <button 
                className="profile-btn"
                onClick={() => navigate(`/profile/${selectedConversation.userId}`)}
                title="View Profile"
              >
                👤
              </button>
            </div>

            <div className="messages-area">
              {messages.length === 0 ? (
                <div className="no-messages">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isOwn = msg.sender._id === user.id;
                  const showDate = index === 0 || 
                    new Date(messages[index - 1].createdAt).toDateString() !== new Date(msg.createdAt).toDateString();

                  return (
                    <React.Fragment key={msg._id}>
                      {showDate && (
                        <div className="date-divider">
                          <span>{new Date(msg.createdAt).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric',
                            year: 'numeric'
                          })}</span>
                        </div>
                      )}
                      <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
                        <div className="message-content">{msg.message}</div>
                        <div className="message-time">
                          {new Date(msg.createdAt).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                          {isOwn && <span className="read-status">{msg.read ? '✓✓' : '✓'}</span>}
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="message-input-area" onSubmit={handleSendMessage}>
              <input
                ref={messageInputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                disabled={sending}
              />
              <button type="submit" disabled={!newMessage.trim() || sending} className="send-btn">
                {sending ? '⏳' : '➤'}
              </button>
            </form>
          </>
        ) : (
          <div className="no-conversation-selected">
            <div className="welcome-message">
              <div className="welcome-icon">💬</div>
              <h2>Welcome to Messages</h2>
              <p>Select a conversation or start a new chat</p>
              <button onClick={() => setShowNewChat(true)} className="start-new-btn">
                Start New Chat
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="modal-overlay" onClick={() => setShowNewChat(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Chat</h3>
              <button onClick={() => setShowNewChat(false)} className="close-modal">✕</button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                placeholder="Search connections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {filteredConnections.length === 0 ? (
                <div className="no-connections">
                  <p>No connections found</p>
                  <button onClick={() => navigate('/discover')} className="discover-btn-modal">
                    Discover People
                  </button>
                </div>
              ) : (
                <div className="connections-list-modal">
                  {filteredConnections.map((conn) => (
                    <div
                      key={conn.userId}
                      className="connection-item-modal"
                      onClick={() => handleStartNewChat(conn)}
                    >
                      <div className="conn-avatar">
                        {conn.profile?.profilePicture ? (
                          <img src={conn.profile.profilePicture} alt="" />
                        ) : (
                          <div className="avatar-placeholder">
                            {(conn.profile?.name || conn.profile?.coupleName || conn.user?.email || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="conn-info">
                        <span className="conn-name">
                          {conn.profile?.name || conn.profile?.coupleName || conn.user?.email}
                        </span>
                        <span className="conn-email">{conn.user?.email}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="toast-notification error">
          {error}
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}
    </div>
  );
}

export default Messages;
