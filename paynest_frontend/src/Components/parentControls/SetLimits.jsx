import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import AccountService from '../../services/AccountService';
import TransactionService from '../../services/TransactionService';

const SetLimits = () => {
    const [childAccounts, setChildAccounts] = useState([]);
    const [selectedChild, setSelectedChild] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const parentId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchChildAccounts = async () => {
            try {
                setLoading(true);
                // This would need to be implemented in your AccountService
                const accounts = await AccountService.getChildAccounts(parentId);
                setChildAccounts(accounts);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch child accounts');
                setLoading(false);
            }
        };

        fetchChildAccounts();
    }, [parentId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedChild || !amount) {
            setError('Please select a child and enter an amount');
            return;
        }

        try {
            setLoading(true);
            await TransactionService.setTransactionLimit(parentId, selectedChild, amount);
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
                                disabled={loading || childAccounts.length === 0}
                            >
                                <option value="">Select a child account</option>
                                {childAccounts.map((account) => (
                                    <option key={account.userId} value={account.userId}>
                                        {account.userName} ({account.accountNumber})
                                    </option>
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