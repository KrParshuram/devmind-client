
// this will be used to create the base api and the auth authorization 

import axios from 'axios';

const api = axios.create({
    // baseURL:import.meta.env.VITE_API_BASE_URL || 'https://devmind-backend-9tu4.onrender.com',
        baseURL:import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',

});


// now well do for the auth header 

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;