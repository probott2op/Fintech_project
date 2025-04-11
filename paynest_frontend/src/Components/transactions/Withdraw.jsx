import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import TransactionService from '../../services/TransactionService';
import AccountService from '../../services/AccountService';
import UserService from '../../services/UserService';

const Withdraw = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const accountIdFromUrl = queryParams.get('accountId');

    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [formData, setFormData] = useState({
        accountId: accountIdFromUrl || '',
        amount: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [loadingAccounts, setLoadingAccounts] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const currentUser = UserService.getCurrentUser();
                const response = await AccountService.getUserAccounts(currentUser.userId);
                setAccounts(response.data);

                // If accountId is provided or we have accounts, select it
                if (accountIdFromUrl) {
                    const account = response.data.find(acc => acc.id.toString() === accountIdFromUrl);
                    if (account) {
                        setSelectedAccount(account);
                        setFormData(prev => ({
                            ...prev,
                            accountId: account.id
                        }));
                    }
                } else if (response.data.length > 0) {
                    setSelectedAccount(response.data[0]);
                    setFormData(prev => ({
                        ...prev,
                        accountId: response.data[0].id
                    }));
                }
            } catch (err) {
                setError('Failed to load accounts. Please try again.');
            } finally {
                setLoadingAccounts(false);
            }
        };

        fetchAccounts();
    }, [accountIdFromUrl]);

    const handleAccountChange = (e) => {
        const accountId = e.target.value;
        setFormData({
            ...formData,
            accountId
        });

        const account = accounts.find(acc => acc.id.toString() === accountId);
        setSelectedAccount(account || null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.accountId) {
            setError('Please select an account.');
            return;
        }

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            setError('Please enter a valid amount greater than 0.');
            return;
        }

        if (selectedAccount && parseFloat(formData.amount) > parseFloat(selectedAccount.balance)) {
            setError('Insufficient funds. The withdrawal amount exceeds your balance.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await TransactionService.withdraw(
                formData.accountId,
                parseFloat(formData.amount),
                formData.description
            );

            setSuccess('Withdrawal successful!');

            // Reset form or redirect
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Withdrawal failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-4">
            <Row className="justify-content-md-center">
                <Col md={6}>
                    <Card className="shadow">
                        <Card.Body>
                            <h2 className="mb-4 text-center">Withdraw Money</h2>

                            {error && <Alert variant="danger">{error}</Alert>}
                            {success && <Alert variant="success">{success}</Alert>}

                            {loadingAccounts ? (
                                <div className="text-center p-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="mt-2">Loading accounts...</p>
                                </div>
                            ) : (
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Select Account</Form.Label>
                                        {accounts.length === 0 ? (
                                            <Alert variant="warning">
                                                You don't have any accounts. Please create an account first.
                                            </Alert>
                                        ) : (
                                            <Form.Select
                                                name="accountId"
                                                value={formData.accountId}
                                                onChange={handleAccountChange}
                                                required
                                            >
                                                <option value="">Select an account</option>
                                                {accounts.map(account => (
                                                    <option key={account.id} value={account.id}>
                                                        {account.accountName} - Balance: ${parseFloat(account.balance).toFixed(2)}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        )}
                                    </Form.Group>

                                    {selectedAccount && (
                                        <Alert variant="info">
                                            Available Balance: ${parseFloat(selectedAccount.balance).toFixed(2)}
                                        </Alert>
                                    )}

                                    <Form.Group className="mb-3">
                                        <Form.Label>Amount ($)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="amount"
                                            value={formData.amount}
                                            onChange={handleChange}
                                            placeholder="Enter amount to withdraw"
                                            min="0.01"
                                            step="0.01"
                                            max={selectedAccount ? selectedAccount.balance : undefined}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Description (Optional)</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="e.g., Shopping, Bills payment"
                                            rows={2}
                                        />
                                    </Form.Group>

                                    <div className="d-grid gap-2 mt-4">
                                        <Button
                                            variant="warning"
                                            type="submit"
                                            disabled={loading || accounts.length === 0}
                                        >
                                            {loading ? 'Processing...' : 'Withdraw Funds'}
                                        </Button>
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => navigate('/dashboard')}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </Form>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Withdraw;