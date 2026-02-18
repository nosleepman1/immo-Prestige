// faire les appels API vers le backend
import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8000/api',
    withCredentials: true,
});

export default apiClient;
export const getItems = () => {
    return apiClient.get('/items');
};
export const getItem = (id) => {
    return apiClient.get(`/items/${id}`);
};
export const createItem = (item) => {
    return apiClient.post('/items', item);
};
export const updateItem = (id, item) => {
    return apiClient.put(`/items/${id}`, item);
};
export const deleteItem = (id) => {
    return apiClient.delete(`/items/${id}`);
};

export const login = (credentials) => {
    return apiClient.post('/auth/login', credentials);
}
export const logout = () => {
    return apiClient.post('/auth/logout');
};

export const getProfile = () => {
    return apiClient.get('/auth/profile');
};

export const register = (userInfo) => {
    return apiClient.post('/auth/register', userInfo);
};

export const updateProfile = (userInfo) => {
    return apiClient.put('/auth/profile', userInfo);
};

export const changePassword = (passwords) => {
    return apiClient.put('/auth/change-password', passwords);
};