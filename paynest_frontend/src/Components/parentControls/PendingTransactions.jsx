import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Card, Badge, Alert } from 'react-bootstrap';
import TransactionService from '../../services/TransactionService';
import AccountService from "../../services/AccountService.js";

const PendingTransactions = () => {
    const [pendingTransactions, setPendingTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const parentId = localStorage.getItem('userId');

    const fetchPendingTransactions = async () => {
        try {
            setLoading(true);
            const transactions = await AccountService.getPendingTransactions(parentId);
            setPendingTransactions(transactions);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch pending transactions');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingTransactions();
    }, [parentId]);

    const handleApprove = async (transactionId) => {
        try {
            setLoading(true);
            await AccountService.approveTransaction(parentId, transactionId);
            setSuccess('Transaction approved successfully');
            // Refresh the list of pending transactions
            fetchPendingTransactions();
        } catch (err) {
            setError('Failed to approve transaction');
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    return (
        <Container className="my-4">
            <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h2>Pending Transactions</h2>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={fetchPendingTransactions}
                        disabled={loading}
                    >
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </Button>
                </Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    {pendingTransactions.length === 0 ? (
                        <Alert variant="info">No pending transactions require your approval</Alert>
                    ) : (
                        <Table responsive striped hover>
                            <thead>
                            <tr>
                                <th>Date</th>
                                <th>Child</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {pendingTransactions.map((transaction) => (
                                <tr key={transaction.id}>
                                    <td>{formatDate(transaction.timestamp)}</td>
                                    <td>{transaction.initiatorName}</td>
                                    <td>
                                        <Badge bg={
                                            transaction.type === 'DEPOSIT' ? 'success' :
                                                transaction.type === 'WITHDRAW' ? 'danger' :
                                                    'info'
                                        }>
                                            {transaction.type}
                                        </Badge>
                                    </td>
                                    <td>${parseFloat(transaction.amount).toFixed(2)}</td>
                                    <td>{transaction.description}</td>
                                    <td>
                                        <Button
                                            variant="success"
                                            size="sm"
                                            onClick={() => handleApprove(transaction.id)}
                                            disabled={loading}
                                        >
                                            Approve
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default PendingTransactions;