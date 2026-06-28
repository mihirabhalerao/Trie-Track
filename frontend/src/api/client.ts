import axios from 'axios';
import { useAuthStore } from '../store/authStore';

/**
 * Centrally configured Axios client instance pointed directly at the Spring Boot API base.
 */
export const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Outgoing Request Interceptor: Automatically fetches the active JWT token from 
 * Zustand state memory and injects it into the standard HTTP Bearer header.
 */
api.interceptors.request.use(
  (config) => {
    // Read the current state of the store directly without requiring React hooks syntax
    const token = useAuthStore.getState().token;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Incoming Response Interceptor: Catches global network errors. If the backend returns 
 * an explicit 401 Unauthorized status code, it wipes local session storage immediately.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Automatic session invalidation if token is expired or altered
      useAuthStore.getState().clearAuth();
    }
    return Promise.reject(error);
  }
);