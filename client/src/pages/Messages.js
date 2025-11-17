import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { messagesAPI } from '../utils/api';
import io from 'socket.io-client';
import './Messages.css';

function Messages({ user }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inbox');
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Compose form
  const [composeForm, setComposeForm] = useState({
    receiverId: '',
    receiverName: '',
    subject: '',
    message: ''
  });

  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Initialize socket connection
    socketRef.current = io('http://localhost:5001');
    
    // Join user's room
    socketRef.current.emit('join', user.id);

    // Listen for new messages
    socketRef.current.on('newMessage', (data) => {
      if (activeTab === 'inbox') {
        fetchMessages();
      }
      fetchUnreadCount();
    });

    // Listen for message read events
    socketRef.current.on('messageRead', (data) => {
      if (activeTab === 'sent') {
        fetchMessages();
      }
    });

    fetchMessages();
    fetchUnreadCount();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user, navigate, activeTab]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = activeTab === 'inbox' 
        ? await messagesAPI.getInbox()
        : await messagesAPI.getSent();
      setMessages(response.data.messages || []);
      if (activeTab === 'inbox') {
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (err) {
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await messagesAPI.getUnreadCount();
      setUnreadCount(response.data.unreadCount);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const handleViewMessage = async (message) => {
    try {
      const response = await messagesAPI.getMessage(message._id);
      setSelectedMessage(response.data.message);
      
      // Emit message read event if it was unread
      if (!message.read && activeTab === 'inbox') {
        socketRef.current.emit('messageRead', {
          messageId: message._id,
          senderId: message.sender._id
        });
        fetchMessages();
        fetchUnreadCount();
      }
    } catch (err) {
      setError('Failed to load message');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await messagesAPI.deleteMessage(messageId);
      setSuccess('Message deleted');
      setSelectedMessage(null);
      fetchMessages();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete message');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!composeForm.receiverId || !composeForm.subject || !composeForm.message) {
      setError('All fields are required');
      return;
    }

    try {
      const response = await messagesAPI.sendMessage({
        receiverId: composeForm.receiverId,
        subject: composeForm.subject,
        message: composeForm.message
      });

      // Emit socket event for real-time delivery
      socketRef.current.emit('sendMessage', {
        receiverId: composeForm.receiverId,
        messageId: response.data.messageId
      });

      setSuccess('Message sent successfully!');
      setShowCompose(false);
      setComposeForm({ receiverId: '', receiverName: '', subject: '', message: '' });
      setActiveTab('sent');
      fetchMessages();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    }
  };

  const handleReply = (message) => {
    const replyTo = activeTab === 'inbox' ? message.sender : message.receiver;
    const senderProfile = activeTab === 'inbox' ? message.senderProfile : message.receiverProfile;
    
    setComposeForm({
      receiverId: replyTo._id,
      receiverName: senderProfile?.name || senderProfile?.coupleName || replyTo.email,
      subject: `Re: ${message.subject}`,
      message: ''
    });
    setShowCompose(true);
    setSelectedMessage(null);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) return null;

  return (
    <div className="messages-page">
      <div className="container-wide">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="messages-header">
          <h1>📬 Messages</h1>
          <button 
            onClick={() => setShowCompose(true)}
            className="btn-compose"
          >
            ✍️ Compose Message
          </button>
        </div>

        <div className="messages-tabs">
          <button
            className={`tab-btn ${activeTab === 'inbox' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('inbox');
              setSelectedMessage(null);
            }}
          >
            📥 Inbox {unreadCount > 0 && `(${unreadCount})`}
          </button>
          <button
            className={`tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('sent');
              setSelectedMessage(null);
            }}
          >
            📤 Sent
          </button>
        </div>

        <div className="messages-layout">
          {/* Message List */}
          <div className="messages-list">
            {loading ? (
              <div className="loading-state">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p>No messages in {activeTab}</p>
              </div>
            ) : (
              messages.map((msg) => {
                const profile = activeTab === 'inbox' ? msg.senderProfile : msg.receiverProfile;
                const user = activeTab === 'inbox' ? msg.sender : msg.receiver;
                const displayName = profile?.name || profile?.coupleName || user?.email || 'Unknown';
                
                return (
                  <div
                    key={msg._id}
                    className={`message-item ${!msg.read && activeTab === 'inbox' ? 'unread' : ''} ${selectedMessage?._id === msg._id ? 'selected' : ''}`}
                    onClick={() => handleViewMessage(msg)}
                  >
                    <div className="message-item-header">
                      <span className="message-from">
                        {activeTab === 'inbox' ? 'From:' : 'To:'} {displayName}
                      </span>
                      <span className="message-date">{formatDate(msg.createdAt)}</span>
                    </div>
                    <div className="message-subject">
                      {!msg.read && activeTab === 'inbox' && <span className="unread-dot">●</span>}
                      {msg.subject}
                    </div>
                    <div className="message-preview">
                      {msg.message.substring(0, 100)}...
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message View */}
          {selectedMessage && (
            <div className="message-view">
              <div className="message-view-header">
                <button onClick={() => setSelectedMessage(null)} className="btn-back">
                  ← Back
                </button>
                <div className="message-actions">
                  <button onClick={() => handleReply(selectedMessage)} className="btn-reply">
                    ↩️ Reply
                  </button>
                  <button 
                    onClick={() => handleDeleteMessage(selectedMessage._id)}
                    className="btn-delete-msg"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>

              <div className="message-content">
                <div className="message-meta">
                  <div className="meta-row">
                    <strong>{activeTab === 'inbox' ? 'From:' : 'To:'}</strong>
                    <span>
                      {activeTab === 'inbox' 
                        ? (selectedMessage.senderProfile?.name || selectedMessage.senderProfile?.coupleName || selectedMessage.sender?.email)
                        : (selectedMessage.receiverProfile?.name || selectedMessage.receiverProfile?.coupleName || selectedMessage.receiver?.email)
                      }
                    </span>
                  </div>
                  <div className="meta-row">
                    <strong>Date:</strong>
                    <span>{formatDate(selectedMessage.createdAt)}</span>
                  </div>
                  <div className="meta-row">
                    <strong>Subject:</strong>
                    <span>{selectedMessage.subject}</span>
                  </div>
                </div>
                <div className="message-body">
                  {selectedMessage.message}
                </div>
              </div>
            </div>
          )}

          {/* Compose Form */}
          {showCompose && (
            <div className="compose-overlay">
              <div className="compose-modal">
                <div className="compose-header">
                  <h3>✍️ Compose Message</h3>
                  <button onClick={() => setShowCompose(false)} className="btn-close">✕</button>
                </div>
                <form onSubmit={handleSendMessage} className="compose-form">
                  <div className="form-group">
                    <label>Receiver ID:</label>
                    <input
                      type="text"
                      value={composeForm.receiverId}
                      onChange={(e) => setComposeForm({...composeForm, receiverId: e.target.value})}
                      placeholder="Enter user ID"
                      required
                    />
                    <small>Tip: Get user ID from their profile URL</small>
                  </div>
                  <div className="form-group">
                    <label>Subject:</label>
                    <input
                      type="text"
                      value={composeForm.subject}
                      onChange={(e) => setComposeForm({...composeForm, subject: e.target.value})}
                      placeholder="Message subject"
                      maxLength="200"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Message:</label>
                    <textarea
                      value={composeForm.message}
                      onChange={(e) => setComposeForm({...composeForm, message: e.target.value})}
                      placeholder="Type your message here..."
                      rows="10"
                      maxLength="2000"
                      required
                    />
                    <small>{composeForm.message.length}/2000 characters</small>
                  </div>
                  <div className="compose-actions">
                    <button type="button" onClick={() => setShowCompose(false)} className="btn-cancel">
                      Cancel
                    </button>
                    <button type="submit" className="btn-send">
                      📤 Send Message
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;
