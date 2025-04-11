import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import AccountService from '../../services/AccountService';
import UserService from '../../services/UserService';

const CreateAccount = () => {
    const navigate = useNavigate();
    const [accountData, setAccountData] = useState({
        accountName: '',
        accountType: 'SAVINGS',
        balance: 0,
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAccountData({
            ...accountData,
            [name]: name === 'balance' ? parseFloat(value) || 0 : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const currentUser = UserService.getCurrentUser();
            const userId = currentUser.userId;

            if (!userId) {
                throw new Error('User not authenticated');
            }

            // Format the data for the API
            const formattedData = {
                ...accountData,
                balance: accountData.balance // Set initial balance
            };

            await AccountService.createAccount(userId, formattedData);
            setSuccess('Account created successfully!');

            // Clear form or navigate to accounts list
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating account. Please try again.');
            console.error('Error creating account:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-4">
            <Row className="justify-content-md-center">
                <Col md={8}>
                    <Card className="shadow">
                        <Card.Body>
                            <h2 className="mb-4">Create New Account</h2>

                            {error && <Alert variant="danger">{error}</Alert>}
                            {success && <Alert variant="success">{success}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Account Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="accountName"
                                        value={accountData.accountName}
                                        onChange={handleChange}
                                        placeholder="e.g., My Savings, College Fund"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Account Type</Form.Label>
                                    <Form.Select
                                        name="accountType"
                                        value={accountData.accountType}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="SAVINGS">Savings</option>
                                        <option value="CHECKING">Checking</option>
                                        <option value="ALLOWANCE">Allowance</option>
                                        <option value="EDUCATION">Education</option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Initial Deposit ($)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="balance"
                                        value={accountData.balance}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Description (Optional)</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        name="description"
                                        value={accountData.description}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="Purpose of this account"
                                    />
                                </Form.Group>

                                <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                                    <Button
                                        variant="secondary"
                                        onClick={() => navigate('/dashboard')}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? 'Creating...' : 'Create Account'}
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

export default CreateAccount;