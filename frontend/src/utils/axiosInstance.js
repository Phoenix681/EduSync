import axios from 'axios';

// Create a custom instance of axios
const axiosInstance = axios.create({
  // In development, it uses localhost. In production, it uses your live Render URL!
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

export default axiosInstance;