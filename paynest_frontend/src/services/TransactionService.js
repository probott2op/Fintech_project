import axios from 'axios';
import UserService from './UserService.js';

const API_URL = 'http://localhost:8080/api';

class TransactionService {
    async deposit(accountId, amount, description) {
        const request = {
            amount: amount,
            description: description
        };
        return axios.post(`${API_URL}/accounts/${accountId}/deposit`, request, UserService.getAuthHeader());
    }

    async withdraw(accountId, amount, description) {
        const request = {
            amount: amount,
            description: description
        };
        return axios.post(`${API_URL}/accounts/${accountId}/withdraw`, request, UserService.getAuthHeader());
    }

    async transfer(senderAccountId, receiverAccountId, amount, description) {
        const request = {
            amount: amount,
            description: description
        };
        return axios.post(
            `${API_URL}/accounts/transfer/${senderAccountId}/${receiverAccountId}`,
            request,
            UserService.getAuthHeader()
        );
    }

    async getTransactionHistory(accountId) {
        return axios.get(`${API_URL}/accounts/${accountId}/transactions`, UserService.getAuthHeader());
    }
}

export default new TransactionService();