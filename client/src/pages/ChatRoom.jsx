import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { Send, MessageSquare, User, AlertCircle } from 'lucide-react';

const ChatRoom = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const targetContactId = searchParams.get('contactId');

  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [socket, setSocket] = useState(null);

  const messagesEndRef = useRef(null);

  // 1. Establish Socket Connection
  useEffect(() => {
    if (!user) return;

    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join', user._id);
    });

    // Listen for incoming messages
    newSocket.on('receive_message', (msg) => {
      // Append if it's from the currently selected contact
      setMessages((prev) => {
        const isFromActive =
          (msg.sender === activeContact?._id && msg.receiver === user._id) ||
          (msg.sender === user._id && msg.receiver === activeContact?._id);

        if (isFromActive) {
          // Check if message is already in list to avoid duplicates
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        }
        return prev;
      });
    });

    // Confirmation emission
    newSocket.on('message_sent', (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, activeContact]);

  // 2. Fetch Contacts List
  const fetchContacts = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/messages/contacts');
      setContacts(data);

      // If contactId query param exists, find or fetch that contact
      if (targetContactId) {
        const exists = data.find((c) => c._id === targetContactId);
        if (exists) {
          setActiveContact(exists);
        } else {
          // Fetch user details for this custom contact
          const userRes = await axios.get(`http://localhost:5000/api/mentors/${targetContactId}`);
          const customContact = {
            _id: userRes.data.profile.user?._id,
            name: userRes.data.profile.user?.name,
            role: 'mentor',
          };
          setActiveContact(customContact);
          setContacts((prev) => [customContact, ...prev]);
        }
      } else if (data.length > 0 && !activeContact) {
        setActiveContact(data[0]);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user, targetContactId]);

  // 3. Fetch Message History for selected contact
  const fetchMessages = async () => {
    if (!activeContact) return;
    try {
      const { data } = await axios.get(`http://localhost:5000/api/messages/${activeContact._id}`);
      setMessages(data);
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [activeContact]);

  // Scroll to bottom helper
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 4. Send Message Handler
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeContact || !socket) return;

    // Send through Socket to get instant sync and DB save
    socket.emit('send_message', {
      sender: user._id,
      receiver: activeContact._id,
      content: inputMessage,
    });

    setInputMessage('');
  };

  if (!user) {
    return (
      <div className="alert alert-warning" style={{ maxWidth: '500px', margin: '3rem auto' }}>
        <AlertCircle size={20} />
        <span>Please login to access real-time messaging.</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ marginBottom: '0.25rem' }}>Messages</h1>
        <p>Connect and discuss mentoring topics with your contacts in real-time.</p>
      </div>

      <div className="chat-container">
        {/* Contacts Sidebar */}
        <div className="chat-sidebar">
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-dark)' }}>
            <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={16} />
              {user?.role === 'admin' ? 'Chat' : 'Recent Conversations'}
            </h4>
          </div>
          <div className="chat-contact-list">
            {contacts.length === 0 ? (
              <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary-dark)', marginTop: '2rem' }}>
                No active conversations.
              </p>
            ) : (
              contacts.map((contact) => (
                <div
                  key={contact._id}
                  className={`contact-item ${activeContact?._id === contact._id ? 'active' : ''}`}
                  onClick={() => setActiveContact(contact)}
                >
                  <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{contact.name}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'capitalize' }}>
                    {contact.role}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat window */}
        <div className="chat-window">
          {activeContact ? (
            <>
              {/* Header info */}
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-dark)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-gradient)',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                }}>
                  {activeContact.name[0]}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>{activeContact.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary)', textTransform: 'capitalize' }}>
                    {activeContact.role}
                  </span>
                </div>
              </div>

              {/* Message Bubbles */}
              <div className="chat-messages">
                {messages.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-secondary-dark)', margin: 'auto', fontSize: '0.9rem' }}>
                    No messages yet. Send a message to start the conversation!
                  </p>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.sender === user._id;
                    return (
                      <div
                        key={msg._id}
                        className={`message-bubble ${isMine ? 'message-sent' : 'message-received'}`}
                      >
                        {msg.content}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input section */}
              <form onSubmit={handleSendMessage} className="chat-input-area">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem' }}>
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', color: 'var(--text-secondary-dark)' }}>
              <MessageSquare size={48} />
              <p>Select a conversation from the sidebar or click "Message Mentor" on a profile page.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
