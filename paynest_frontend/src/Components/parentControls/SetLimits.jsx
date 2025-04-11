import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import UserService from '../../services/UserService';
import AccountService from '../../services/AccountService';
import TransactionService from '../../services/TransactionService';

const SetLimits = () => {
    const [childrenDetails, setChildrenDetails] = useState([]);
    const [selectedChild, setSelectedChild] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const currentUser = UserService.getCurrentUser();
                if (!currentUser.userId) {
                    throw new Error('User not authenticated');
                }
                const response = await UserService.getUserById(currentUser.userId);

                if (response.role === "PARENT" && response.childIds && response.childIds.length > 0) {
                    await fetchChildrenDetails(response.childIds);
                } else {
                    setError('No child accounts found');
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError('Failed to fetch user data');
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const fetchChildrenDetails = async (childIds) => {
        try {
            const childrenPromises = childIds.map(async (childId) => {
                const childUser = await UserService.getUserById(childId);
                const childAccounts = await AccountService.getAccountsById(childId);
                return { ...childUser, accounts: childAccounts || [] };
            });

            const resolvedChildren = await Promise.all(childrenPromises);
            setChildrenDetails(resolvedChildren);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching children details:', error);
            setError('Failed to fetch children details');
            setLoading(false);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedChild || !amount) {
            setError('Please select a child and enter an amount');
            return;
        }

        try {
            setLoading(true);
            const currentUser = UserService.getCurrentUser();
            await AccountService.setTransactionLimit(currentUser.userId, selectedChild, amount);
            setSuccess('Transaction limit set successfully');
            setAmount('');
            setSelectedChild('');
            setError('');
            setLoading(false);
        } catch (err) {
            setError('Failed to set transaction limit');
            setLoading(false);
        }
    };

    return (
        <Container className="my-4">
            <Card>
                <Card.Header>
                    <h2>Set Transaction Limits</h2>
                </Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Select Child Account</Form.Label>
                            <Form.Select
                                value={selectedChild}
                                onChange={(e) => setSelectedChild(e.target.value)}
                                disabled={loading || childrenDetails.length === 0}
                            >
                                <option value="">Select a child account</option>
                                {childrenDetails.map((child) => (
                                    child.accounts.map((account) => (
                                        <option key={account.id} value={child.id}>
                                            {child.fullName} - {account.accountNumber} AccountId({account.id})
                                        </option>
                                    ))
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Transaction Limit</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter maximum transaction amount"
                                disabled={loading}
                            />
                            <Form.Text className="text-muted">
                                Transactions above this amount will require your approval
                            </Form.Text>
                        </Form.Group>

                        <Button
                            variant="primary"
                            type="submit"
                            disabled={loading || !selectedChild || !amount}
                        >
                            {loading ? 'Setting Limit...' : 'Set Limit'}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default SetLimits;
