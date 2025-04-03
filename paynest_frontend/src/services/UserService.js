import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

class UserService {
    // Auth endpoints
    async register(userData) {
        return axios.post(`${API_URL}/register`, userData);
    }

    async login(credentials) {
        const response = await axios.post(`${API_URL}/login`, credentials);
        if (response.data) {
            localStorage.setItem('token', response.data);
            localStorage.setItem('userId', this.parseUserId(response.data));
        }
        return response;
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        window.location.href = '/login';
    }

    parseUserId(token) {
        // In a real app, you'd decode the JWT to get the user ID
        // This is a simplified example
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload).userId;
        } catch (e) {
            console.error("Error parsing token", e);
            return null;
        }
    }

    getCurrentUser() {
        return {
            userId: localStorage.getItem('userId'),
            token: localStorage.getItem('token'),
            role: localStorage.getItem('userRole')
        };
    }

    isAuthenticated() {
        return localStorage.getItem('token') !== null;
    }

    // User data endpoints
    async getUserById(userId) {
        return axios.get(`${API_URL}/users/${userId}`, this.getAuthHeader());
    }

    async getAllUsers() {
        return axios.get(`${API_URL}/users`, this.getAuthHeader());
    }

    // Notification endpoints
    async getUserNotifications(userId) {
        return axios.get(`${API_URL}/users/${userId}/notifications`, this.getAuthHeader());
    }

    async markNotificationAsRead(notificationId) {
        return axios.post(`${API_URL}/notifications/${notificationId}/mark-read`, {}, this.getAuthHeader());
    }

    // Helper method for auth headers
    getAuthHeader() {
        const token = localStorage.getItem('token');
        return {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
    }
}

export default new UserService();