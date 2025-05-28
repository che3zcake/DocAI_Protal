import axios from 'axios';

const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
    baseURL: API_URL,
});

apiClient.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;


        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/login/refresh/') {
            if (isRefreshing) {

                return new Promise(function(resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return apiClient(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                console.error("No refresh token available.");
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }

            try {
                console.log("Attempting to refresh token...");
                const response = await axios.post(`${API_URL}/login/refresh/`, {
                    refresh: refreshToken,
                });

                const newAccessToken = response.data.access;

                localStorage.setItem('accessToken', newAccessToken);


                apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                processQueue(null, newAccessToken);
                return apiClient(originalRequest);

            } catch (refreshError) {
                console.error("Token refresh failed:", refreshError);
                processQueue(refreshError, null);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');

                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);


export const registerUser = (userData) => apiClient.post('/register/', userData)
    .then(response => {
        if (response.data.access && response.data.refresh) {
            localStorage.setItem('accessToken', response.data.access);
            localStorage.setItem('refreshToken', response.data.refresh);
            apiClient.defaults.headers.common.Authorization = `Bearer ${response.data.access}`;
        }
        return response;
    });

export const loginUser = (credentials) => apiClient.post('/login/', credentials)
    .then(response => {
        if (response.data.access && response.data.refresh) {
            localStorage.setItem('accessToken', response.data.access);
            localStorage.setItem('refreshToken', response.data.refresh);
            apiClient.defaults.headers.common.Authorization = `Bearer ${response.data.access}`;
        }
        return response;
    });

export const logoutUser = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete apiClient.defaults.headers.common.Authorization;

    if (typeof window !== 'undefined') {
    }
};


export const uploadDocument = (formData) => {
    return apiClient.post('/documents/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const getDocuments = () => apiClient.get('/documents/');
export const deleteDocument = (docId) => apiClient.delete(`/documents/${docId}/`);
export const askDocumentQuestion = (docId, question) => {
    return apiClient.post(`/documents/${docId}/ask_question/`, { question });
};

export default apiClient;