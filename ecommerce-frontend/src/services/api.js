import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    let friendlyMessage = 'An unexpected error occurred. Please try again.';

    if (!error.response) {
      friendlyMessage = 'Cannot connect to backend server. Please verify the Spring Boot service is running.';
    } else {
      const { status, data } = error.response;

      if (data && data.message) {
        friendlyMessage = data.message;
      } else if (status === 404) {
        friendlyMessage = 'The requested resource was not found.';
      } else if (status === 409) {
        friendlyMessage = 'A conflict occurred. The resource might already exist.';
      } else if (status === 400) {
        friendlyMessage = 'Invalid request parameters or payload.';
      } else if (status >= 500) {
        friendlyMessage = 'Internal server error. Please try again later.';
      }
    }

    // Attach parsed user-friendly error to error object
    error.userMessage = friendlyMessage;
    return Promise.reject(error);
  }
);

export default api;
