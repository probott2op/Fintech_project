import axios from 'axios';
import UserService from './UserService.js';

const API_URL = 'http://localhost:8080/api';

class AccountService {
    async createAccount(userId, accountData) {
        return axios.post(`${API_URL}/users/${userId}/accounts`, accountData, UserService.getAuthHeader());
    }

    async getAccountDetails(accountId) {
        return axios.get(`${API_URL}/accounts/${accountId}`, UserService.getAuthHeader());
    }

    async getUserAccounts() {
        const userId = localStorage.getItem("userId");
        return axios.get(`${API_URL}/users/${userId}/accounts`, UserService.getAuthHeader());
    }

    // Parent-Child controls
    async setTransactionLimit(parentId, childId, amount) {
        return axios.post(
            `${API_URL}/parents/${parentId}/set-limit?childId=${childId}&amount=${amount}`,
            {},
            UserService.getAuthHeader()
        );
    }

    async getPendingTransactions(parentId) {
        return axios.get(`${API_URL}/parents/${parentId}/pending-transactions`, UserService.getAuthHeader());
    }

    async approveTransaction(parentId, transactionId) {
        return axios.post(
            `${API_URL}/parents/${parentId}/approve-transaction?transactionId=${transactionId}`,
            {},
            UserService.getAuthHeader()
        );
    }

    async getAuditLogs(parentId) {
        return axios.get(`${API_URL}/parents/${parentId}/audit-logs`, UserService.getAuthHeader());
    }
}

export default new AccountService();