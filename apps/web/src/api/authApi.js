import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const getProfile = async (token) => {
  const response = await api.get('/user/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export default api;
