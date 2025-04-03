import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const NotificationService = {
    getUserNotifications: async (userId) => {
        try {
            const response = await axios.get(`${API_URL}/users/${userId}/notifications`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to get notifications');
        }
    },

    markNotificationAsRead: async (notificationId) => {
        try {
            const response = await axios.post(`${API_URL}/notifications/${notificationId}/mark-read`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
        }
    }
};

export default NotificationService;