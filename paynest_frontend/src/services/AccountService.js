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

    async getAccountsById(userId) {
        return (await axios.get(`${API_URL}/users/${userId}/accounts`, UserService.getAuthHeader())).data;
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
        return (await axios.get(`${API_URL}/parents/${parentId}/pending-transactions`, UserService.getAuthHeader())).data;
    }

    async approveTransaction(parentId, transactionId) {
        return (await axios.post(
            `${API_URL}/parents/${parentId}/approve-transaction?transactionId=${transactionId}`,
            {},
            UserService.getAuthHeader()
        )).data;
    }

    async getAuditLogs(parentId) {
        return (await axios.get(`${API_URL}/parents/${parentId}/audit-logs`, UserService.getAuthHeader())).data;
    }
}

export default new AccountService();