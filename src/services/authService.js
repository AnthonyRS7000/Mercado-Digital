import axios from 'axios';

export const getToken = () => {
  const token = localStorage.getItem('token');
  console.log('Retrieved token:', token);
  return token;
};

export const getUserId = () => {
  const userId = localStorage.getItem('user_id');
  console.log('Retrieved userId:', userId);
  return userId;
};

export const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  // Lógica para obtener un nuevo token usando el refresh token
  const response = await axios.post('http://127.0.0.1:8000/api/refresh-token', { token: refreshToken });
  const newToken = response.data.access_token;
  localStorage.setItem('token', newToken);
  return newToken;
};
