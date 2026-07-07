import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Interceptor to add token to headers
api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('pq_user') || '{}');
    if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});

export const login = async (userCode) => {
    const response = await api.post('/login', { user_code: userCode });
    return response.data;
};

export const registerUser = async (username, registrationToken) => {
    const response = await api.post('/users', { username, registration_token: registrationToken });
    return response.data;
};

export const getRooms = async () => {
    const response = await api.get('/rooms');
    return response.data;
};

export const getMessages = async (roomId, search = '') => {
    const response = await api.get('/messages', { params: { room_id: roomId, search } });
    return response.data;
};

export const sendMessage = async (roomId, message) => {
    const response = await api.post('/messages', { room_id: roomId, message });
    return response.data;
};

export const updateMessage = async (messageId, message) => {
    const response = await api.put(`/messages/${messageId}`, { message });
    return response.data;
};

export const deleteMessage = async (messageId) => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
};
