export const getToken = () => {
    return localStorage.getItem('access_token');
  };
  
  export const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    // Lógica para obtener un nuevo token usando el refresh token
    const response = await axios.post('http://127.0.0.1:8000/api/refresh-token', { token: refreshToken });
    const newToken = response.data.access_token;
    localStorage.setItem('access_token', newToken);
    return newToken;
  };
  