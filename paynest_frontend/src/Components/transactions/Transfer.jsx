import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import UserService from '../../services/UserService';
import { useNavigate } from 'react-router-dom';

const Transfer = () => {
    const [accounts, setAccounts] = useState([]);
    const [receiverAccounts, setReceiverAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState('');
    const [receiverAccount, setReceiverAccount] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserAccounts();
        fetchAllAccounts();
    }, []);

    const fetchUserAccounts = async () => {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                navigate('/login');
                return;
            }

            const response = await UserService.getUserAccounts(userId);
            setAccounts(response.data);
        } catch (error) {
            setError('Failed to load your accounts. Please try again.');
            console.error('Error fetching user accounts:', error);
        }
    };

    const fetchAllAccounts = async () => {
        try {
            // In a real application, you'd have an API to fetch possible receiver accounts
            // For now, we'll simulate this with a mock
            const response = await UserService.getAllAccounts();

            // Filter out user's own accounts
            const userId = localStorage.getItem('userId');
            const filteredAccounts = response.data.filter(
                account => account.userId.toString() !== userId
            );

            setReceiverAccounts(filteredAccounts);
        } catch (error) {
            console.error('Error fetching receiver accounts:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!selectedAccount || !receiverAccount || !amount) {
            setError('Please fill all required fields');
            return;
        }

        if (selectedAccount === receiverAccount) {
            setError('Sender and receiver accounts cannot be the same');
            return;
        }

        if (parseFloat(amount) <= 0) {
            setError('Amount must be greater than zero');
            return;
        }

        const transferData = {
            amount: parseFloat(amount),
            description: description || 'Transfer'
        };

        setLoading(true);
        try {
            const response = await UserService.transferFunds(
                selectedAccount,
                receiverAccount,
                transferData
            );

            setSuccess('Transfer completed successfully!');
            setAmount('');
            setDescription('');

            // If the parent needs to approve this transaction
            if (response.data.status === 'PENDING') {
                setSuccess('Transfer sent for parent approval');
            }

        } catch (error) {
            if (error.response && error.response.data) {
                setError(error.response.data.message || 'Transfer failed');
            } else {
                setError('Transfer failed. Please try again later.');
            }
            console.error('Transfer error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card className="shadow">
                        <Card.Header className="bg-primary text-white">
                            <h4 className="mb-0">Transfer Money</h4>
                        </Card.Header>
                        <Card.Body>
                            {error && <Alert variant="danger">{error}</Alert>}
                            {success && <Alert variant="success">{success}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>From Account</Form.Label>
                                    <Form.Select
                                        value={selectedAccount}
                                        onChange={(e) => setSelectedAccount(e.target.value)}
                                        required
                                    >
                                        <option value="">Select your account</option>
                                        {accounts.map(account => (
                                            <option key={account.id} value={account.id}>
                                                {account.accountType} - {account.accountNumber} (Balance: ${account.balance})
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>To Account</Form.Label>
                                    <Form.Select
                                        value={receiverAccount}
                                        onChange={(e) => setReceiverAccount(e.target.value)}
                                        required
                                    >
                                        <option value="">Select recipient account</option>
                                        {receiverAccounts.map(account => (
                                            <option key={account.id} value={account.id}>
                                                {account.accountNumber} - {account.userName || 'User'}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Amount</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Enter amount"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        required
                                        min="0.01"
                                        step="0.01"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Description (Optional)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="What's this transfer for?"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? 'Processing...' : 'Transfer Funds'}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Transfer;