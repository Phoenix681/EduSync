import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosInstance';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Inbox = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchUsers = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const response = await axios.get('/api/users/contacts', config); 
        setUsers(response.data);
      } catch {
        toast.error('Failed to load user directory.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, navigate]);

  if (loading) return (
    <div className="flex h-screen items-start pt-32 justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-indigo-600 font-medium">Loading contacts...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-extrabold">Inbox & Contacts</h1>
          <p className="mt-2 text-lg text-indigo-100">Start a conversation with other users on the platform.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto -mt-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
          {users.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No contacts found</h3>
              <p className="text-gray-500 max-w-md mx-auto">It looks like there are no other users to message right now.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {users.map((contact) => (
                <li key={contact._id} className="flex items-center justify-between p-6 transition-colors hover:bg-gray-50/80">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-indigo-600">{contact.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{contact.name}</h3>
                      <span className={`inline-block px-2.5 py-0.5 mt-1 text-xs font-semibold rounded-full ${
                        contact.role === 'Educator' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                      }`}>
                        {contact.role}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/chat/${contact._id}`}
                    className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-100 transition-all text-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                    Message
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;