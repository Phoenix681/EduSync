import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import io from 'socket.io-client';
import axios from '../utils/axiosInstance';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

let socket;

const Chat = () => {
  const { targetUserId } = useParams();
  const { user, setUnreadCount } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [targetUser, setTargetUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Safely generate the room ONLY if user exists
  const room = user ? [user._id, targetUserId].sort().join('_') : '';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    socket = io('https://edusync-el34.onrender.com');
    socket.emit('join_chat', room);

    const fetchData = async () => {
      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        
        const [historyRes, targetUserRes] = await Promise.all([
          axios.get(`/api/messages/${targetUserId}`, config),
          axios.get(`/api/users/${targetUserId}`, config) 
        ]);

        // IMPORTANT: Ensure historyRes.data is an array! 
        // If your backend returns { messages: [...] }, change this to historyRes.data.messages
        setMessages(Array.isArray(historyRes.data) ? historyRes.data : []);
        setTargetUser(targetUserRes.data);

        await axios.put(`/api/messages/mark-read/${targetUserId}`, {}, config);
        const { data: unreadData } = await axios.get('/api/messages/unread-count', config);
        setUnreadCount(unreadData.count);

      } catch (error) {
        toast.error('Could not load chat data');
        console.error("Chat loading error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data.dbPayload]);
    });

    return () => {
      socket.disconnect();
    };
  }, [targetUserId, user, navigate, room, setUnreadCount]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (currentMessage.trim() === '') return;

    const messageData = {
      room: room,
      dbPayload: {
        sender: user._id,
        receiver: targetUserId,
        content: currentMessage,
        createdAt: new Date().toISOString(), 
      },
    };

    socket.emit('send_message', messageData);
    setMessages((prev) => [...prev, messageData.dbPayload]);
    setCurrentMessage('');
  };

  if (loading) return (
    <div className="flex items-start justify-center h-screen pt-32 bg-gray-50">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 rounded-full border-indigo-200 border-t-indigo-600 animate-spin"></div>
        <p className="mt-4 font-medium text-indigo-600">Loading chat...</p>
      </div>
    </div>
  );

  return (
    // 1. ADDED overflow-hidden here to completely lock the main browser scrollbar
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      
      {/* Gradient Header */}
      {/* 2. ADDED shrink-0 so the header never gets squished */}
      <div className="shrink-0 px-4 pt-12 pb-24 text-white shadow-inner bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="max-w-4xl mx-auto">
          <Link to="/inbox" className="inline-flex items-center mb-4 transition-colors text-indigo-100 hover:text-white">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            Back to Inbox
          </Link>
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100">
              <span className="text-3xl font-bold text-indigo-600">{targetUser?.name?.charAt(0) || '?'}</span>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold">{targetUser?.name || 'Unknown User'}</h1>
              <span className={`inline-block px-2.5 py-0.5 mt-1 text-xs font-semibold rounded-full ${
                targetUser?.role === 'Educator' 
                ? 'bg-purple-200 text-purple-800' 
                : 'bg-green-200 text-green-800'
              }`}>
                {targetUser?.role || 'Student'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      {/* 3. THE MAGIC FIX: Changed flex-grow to "flex-1 min-h-0". This forces it to fit inside the screen! */}
      <div className="flex flex-col flex-1 min-h-0 w-full max-w-4xl px-4 mx-auto -mt-16 sm:px-6 lg:px-8 pb-4">
        
        {/* 4. Changed flex-grow to "h-full overflow-hidden" */}
        <div className="flex flex-col h-full bg-white border border-gray-100 shadow-lg rounded-2xl overflow-hidden">
          
          {/* Message History Area */}
          {/* 5. Changed flex-grow to flex-1. This is the ONLY part of the page that will scroll now! */}
          <div className="flex-1 p-6 overflow-y-auto">
            {messages.map((msg, index) => {
              const isMe = msg.sender === user._id;
              return (
                <div key={index} className={`flex mb-4 items-end ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {!isMe && (
                    <div className="flex items-center justify-center w-8 h-8 mr-3 bg-gray-200 rounded-full shrink-0">
                      <span className="text-sm font-bold text-gray-600">{targetUser?.name?.charAt(0) || '?'}</span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <div className={`max-w-lg px-4 py-3 rounded-2xl ${
                        isMe 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className={`text-xs text-gray-400 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                      {msg.createdAt ? format(new Date(msg.createdAt), 'p') : ''}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          {/* 6. ADDED shrink-0 so the input box stays firmly at the bottom */}
          <form onSubmit={sendMessage} className="shrink-0 flex items-center p-4 border-t border-gray-200 bg-gray-50">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow px-4 py-3 transition-all bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="submit"
              className="flex items-center justify-center w-12 h-12 ml-4 font-semibold text-white transition-all transform shadow-md bg-indigo-600 rounded-full hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 shrink-0"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </button>
          </form>
          
        </div>
      </div>
    </div>
  )};

export default Chat;