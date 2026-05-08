import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth'; // Note: Ensure this path matches your project structure
import toast from 'react-hot-toast';

// 1. Initialize the socket variable outside the component so it doesn't reconnect on every re-render
let socket;

const Chat = () => {
  const { targetUserId } = useParams(); // The ID of the person we are chatting with
  
  // NEW: Grab setUnreadCount from context so we can clear the badge!
  const { user, setUnreadCount } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [room] = useState(() => {
    return [user._id, targetUserId].sort().join('_');
  });
  const messagesEndRef = useRef(null); // Used to auto-scroll to the bottom

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // 2. Create a unique, consistent room ID for these two specific users
    const roomID = room;

    // 3. Connect to the backend Socket server
    socket = io('http://localhost:5000');
    socket.emit('join_chat', roomID);

    // ==========================================
    // NEW: Mark Messages as Read Function
    // ==========================================
    const markAsRead = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        // Tell backend to mark these specific messages as read
        await axios.put(`/api/messages/mark-read/${targetUserId}`, {}, config);
        
        // Re-fetch the global unread count so the Navbar updates instantly
        const { data } = await axios.get('/api/messages/unread-count', config);
        setUnreadCount(data.count);
      } catch {
        console.error("Failed to mark messages as read");
      }
    };

    // 4. Fetch the chat history from MongoDB
    const fetchHistory = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const response = await axios.get(`/api/messages/${targetUserId}`, config);
        setMessages(response.data);
      } catch {
        toast.error('Could not load chat history');
      }
    };

    // Execute both fetches when the component loads
    fetchHistory();
    markAsRead(); // Fire the new function here!

    // 5. Listen for incoming live messages from the other person
    socket.on('receive_message', (data) => {
      setUnreadCount(prev => prev+1);
      setMessages((prev) => [...prev, data.dbPayload]);
    });

    // Cleanup function: Disconnect when they leave the page
    return () => {
      socket.disconnect();
    };
  }, [targetUserId, user, navigate, room, setUnreadCount]); // Added setUnreadCount to dependencies

  // Auto-scroll to the newest message whenever the messages array updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (currentMessage.trim() === '') return;

    // Build the payload expected by your backend
    const messageData = {
      room: room,
      dbPayload: {
        sender: user._id,
        receiver: targetUserId,
        content: currentMessage,
      },
    };

    // 6. Fire the message out to the socket!
    socket.emit('send_message', messageData);

    // instantly add it to our own screen so it feels fast
    setMessages((prev) => [...prev, messageData.dbPayload]);
    setCurrentMessage('');
  };

  return (
    <div className="max-w-3xl mx-auto mt-4">
      <Link to="/" className="text-sm text-blue-600 hover:underline">&larr; Back to Dashboard</Link>
      
      <div className="flex flex-col h-[70vh] mt-4 bg-white border border-gray-200 rounded-lg shadow-lg">
        
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <h2 className="text-lg font-bold text-gray-800">Secure Chat Channel</h2>
          <p className="text-sm text-gray-500">Live support</p>
        </div>

        {/* Message History Area */}
        <div className="grow p-6 overflow-y-auto bg-gray-50">
          {messages.map((msg, index) => {
            const isMe = msg.sender === user._id; // Check if I sent it to color the bubble
            return (
              <div key={index} className={`flex mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-lg ${
                    isMe ? 'text-white bg-blue-600 rounded-br-none' : 'text-gray-800 bg-gray-200 rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}
          {/* Invisible div to help us scroll to the bottom */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={sendMessage} className="flex px-4 py-4 bg-white border-t border-gray-200 rounded-b-lg">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Type your message..."
            className="grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 font-medium text-white transition-colors bg-blue-600 rounded-r-md hover:bg-blue-700"
          >
            Send
          </button>
        </form>

      </div>
    </div>
  );
};

export default Chat;