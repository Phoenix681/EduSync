import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
        
        // Change '/api/users' to '/api/users/contacts'
        const response = await axios.get('/api/users/contacts', config); 
        
        // We no longer need to filter out our own ID, because the backend already did it!
        setUsers(response.data);
        setLoading(false);
      } catch {
        toast.error('Failed to load user directory.');
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, navigate]);

  if (loading) return <div className="mt-20 text-center text-gray-500">Loading contacts...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">Messages & Contacts</h1>
      
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        {users.length === 0 ? (
          <p className="p-6 text-gray-500">No other users found on the platform.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {users.map((contact) => (
              <li key={contact._id} className="flex items-center justify-between p-6 transition-colors hover:bg-gray-50">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{contact.name}</h3>
                  <span className="inline-block px-2 py-1 mt-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                    {contact.role}
                  </span>
                </div>
                {/* This dynamically generates the correct Chat URL! */}
                <Link
                  to={`/chat/${contact._id}`}
                  className="px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Open Chat
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Inbox;