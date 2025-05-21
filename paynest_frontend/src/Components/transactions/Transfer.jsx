import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import UserService from '../../services/UserService';
import { useNavigate } from 'react-router-dom';
import AccountService from "../../services/AccountService.js";
import TransactionService from "../../services/TransactionService.js";
import { useSearchParams } from 'react-router-dom';

const Transfer = () => {
    const [searchParams] = useSearchParams();
    const accountIdFromUrl = searchParams.get('accountId');
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState('');
    const [receiverAccountNumber, setReceiverAccountNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserAccounts();
    }, []);

    const fetchUserAccounts = async () => {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                navigate('/login');
                return;
            }

            const response = await AccountService.getUserAccounts();
            setAccounts(response.data);
            if (accountIdFromUrl) {
                const matchingAccount = response.data.find(acc => acc.id.toString() === accountIdFromUrl);
                if (matchingAccount) {
                    setSelectedAccount(matchingAccount.id.toString());
                } else {
                    // accountIdFromUrl invalid or doesn't belong to user — select none or first account (your choice)
                    setSelectedAccount(''); // or setSelectedAccount(response.data[0]?.id.toString() || '');
                }
            } else {
                // No accountIdFromUrl, so don't preselect any account OR
                // Uncomment next line to select first account by default
                // setSelectedAccount(response.data[0]?.id.toString() || '');
                setSelectedAccount('');  // no preselection
            }
        
        } catch (error) {
            setError('Failed to load your accounts. Please try again.');
            console.error('Error fetching user accounts:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!selectedAccount || !receiverAccountNumber || !amount) {
            setError('Please fill all required fields');
            return;
        }

        // Check if the entered account number matches the sender's account
        const senderAccount = accounts.find(account => account.id.toString() === selectedAccount);
        if (senderAccount && senderAccount.accountNumber === receiverAccountNumber) {
            setError('Sender and receiver accounts cannot be the same');
            return;
        }

        if (parseFloat(amount) <= 0) {
            setError('Amount must be greater than zero');
            return;
        }

        const transferData = {
            amount: parseFloat(amount),
            description: description || 'Transfer',
            type: 'TRANSFER' // Include the account number directly
        };

        setLoading(true);
        try {
            const response = await TransactionService.transfer(
                selectedAccount,
                receiverAccountNumber, // Pass the account number instead of ID
                parseFloat(amount),
                description || 'Transfer'
            );

            setSuccess('Transfer completed successfully!');
            setAmount('');
            setDescription('');
            setReceiverAccountNumber('');

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
                                    <Form.Label>To Account Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter recipient account number"
                                        value={receiverAccountNumber}
                                        onChange={(e) => setReceiverAccountNumber(e.target.value)}
                                        required
                                    />
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
