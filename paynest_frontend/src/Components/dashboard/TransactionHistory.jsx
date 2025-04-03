import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Badge, Button, Alert } from 'react-bootstrap';
import TransactionService from '../../services/TransactionService';
import AccountService from '../../services/AccountService';
import UserService from '../../services/UserService';

const TransactionHistory = ({ accountId }) => {
    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [selectedAccountId, setSelectedAccountId] = useState(accountId);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchTransactions = async (accId) => {
        setLoading(true);
        try {
            const response = await TransactionService.getTransactionHistory(accId);
            setTransactions(response.data);
        } catch (err) {
            setError('Failed to load transaction history. Please try again.');
            console.error('Error fetching transactions:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentUser = UserService.getCurrentUser();

                // Fetch user accounts
                const accountsResponse = await AccountService.getUserAccounts(currentUser.userId);
                setAccounts(accountsResponse.data);

                // Set default selected account if not provided
                const accId = accountId || (accountsResponse.data.length > 0 ? accountsResponse.data[0].id : null);
                setSelectedAccountId(accId);

                if (accId) {
                    await fetchTransactions(accId);
                } else {
                    setLoading(false);
                }
            } catch (err) {
                setError('Failed to load accounts. Please try again.');
                setLoading(false);
            }
        };

        fetchData();
    }, [accountId]);

    const handleAccountChange = (e) => {
        const accId = e.target.value;
        setSelectedAccountId(accId);
        fetchTransactions(accId);
    };

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'COMPLETED': return 'success';
            case 'PENDING': return 'warning';
            case 'FAILED': return 'danger';
            case 'APPROVED': return 'info';
            case 'REJECTED': return 'danger';
            default: return 'secondary';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'DEPOSIT': return <i className="bi bi-arrow-down-circle text-success me-1"></i>;
            case 'WITHDRAWAL': return <i className="bi bi-arrow-up-circle text-danger me-1"></i>;
            case 'TRANSFER_IN': return <i className="bi bi-arrow-left-circle text-info me-1"></i>;
            case 'TRANSFER_OUT': return <i className="bi bi-arrow-right-circle text-warning me-1"></i>;
            default: return <i className="bi bi-arrow-left-right me-1"></i>;
        }
    };

    if (!selectedAccountId) {
        return (
            <Card className="text-center p-5">
                <Card.Body>
                    <Card.Title>No Accounts Found</Card.Title>
                    <Card.Text>You need an account to view transaction history.</Card.Text>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card className="shadow-sm">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="mb-0">Transaction History</h4>

                    <Form.Select
                        style={{ width: 'auto' }}
                        value={selectedAccountId}
                        onChange={handleAccountChange}
                    >
                        {accounts.map(account => (
                            <option key={account.id} value={account.id}>
                                {account.accountName} (${parseFloat(account.balance).toFixed(2)})
                            </option>
                        ))}
                    </Form.Select>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                {loading ? (
                    <div className="text-center p-4">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2">Loading transactions...</p>
                    </div>
                ) : transactions.length === 0 ? (
                    <Card className="text-center p-3 bg-light">
                        <Card.Body>
                            <Card.Title>No Transactions Yet</Card.Title>
                            <Card.Text>This account doesn't have any transactions yet.</Card.Text>
                            <div className="mt-3">
                                <Button variant="primary" className="me-2" href={`/transactions/deposit?accountId=${selectedAccountId}`}>
                                    Make a Deposit
                                </Button>
                                <Button variant="outline-primary" href={`/transactions/transfer?accountId=${selectedAccountId}`}>
                                    Make a Transfer
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                ) : (
                    <Table responsive hover>
                        <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Balance</th>
                            <th>Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {transactions.map((transaction) => (
                            <tr key={transaction.id}>
                                <td className="text-nowrap">
                                    {new Date(transaction.timestamp).toLocaleDateString()}<br/>
                                    <small className="text-muted">
                                        {new Date(transaction.timestamp).toLocaleTimeString()}
                                    </small>
                                </td>
                                <td>
                                    {getTypeIcon(transaction.type)}
                                    {transaction.type.replace('_', ' ')}
                                </td>
                                <td>{transaction.description || '-'}</td>
                                <td className={transaction.type === 'DEPOSIT' || transaction.type === 'TRANSFER_IN' ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                                    {transaction.type === 'DEPOSIT' || transaction.type === 'TRANSFER_IN' ? '+' : '-'}
                                    ${parseFloat(transaction.amount).toFixed(2)}
                                </td>
                                <td>${parseFloat(transaction.balanceAfter).toFixed(2)}</td>
                                <td>
                                    <Badge bg={getStatusBadgeVariant(transaction.status)}>
                                        {transaction.status}
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                )}
            </Card.Body>
        </Card>
    );
};

export default TransactionHistory;