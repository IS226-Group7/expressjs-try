const BASE_URL = import.meta.env.VITE_API_URL;

export const api = async (endpoint, { method = 'GET', body, headers = {} } = {}) => {
  const token = localStorage.getItem('token');

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  // Axios throws errors automatically; Fetch does not. 
  // This block mimics the Axios error behavior:
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Something went wrong');
  }

  return response.json();
};