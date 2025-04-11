import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { FaMoneyBillWave, FaCalendarAlt, FaUserCircle, FaCreditCard } from 'react-icons/fa';
import AccountService from "../../services/AccountService.js";

const AccountDetails = () => {
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();

    useEffect(() => {
        const fetchAccountData = async () => {
            try {
                const response = await AccountService.getAccountDetails(id);
                setAccount(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching account data:', error);
                setLoading(false);
            }
        };

        fetchAccountData();
    }, [id]);

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </Container>
        );
    }

    if (!account) {
        return (
            <Container className="mt-5">
                <div className="alert alert-danger">Account not found</div>
            </Container>
        );
    }

    // Format the date
    const formattedDate = new Date(account.timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Format account number to show only last 4 digits
    const maskedAccountNumber = `XXXX-XXXX-${account.accountNumber.slice(-4)}`;

    return (
        <Container className="py-5">
            <h2 className="mb-4 text-center">Account Details</h2>

            <Row>
                <Col lg={4}>
                    <Card className="mb-4 shadow-sm">
                        <Card.Body className="text-center">
                            <div className="bg-primary text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px' }}>
                                <FaCreditCard size={40} />
                            </div>
                            <h4 className="my-3">{account.accountType} ACCOUNT</h4>
                            <p className="text-muted mb-1">{maskedAccountNumber}</p>
                            <p className="text-muted mb-4">User ID: {account.userId}</p>
                            <div className="d-flex justify-content-center mb-2">
                                <Button variant="primary">Transfer Money</Button>
                                <Button variant="outline-primary" className="ms-1">View Transactions</Button>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="mb-4 mb-lg-0 shadow-sm">
                        <Card.Header className="bg-light">Quick Actions</Card.Header>
                        <Card.Body>
                            <div className="d-grid gap-2">
                                <Button variant="outline-primary" size="sm">Download Statement</Button>
                                <Button variant="outline-primary" size="sm">Update Account Details</Button>
                                <Button variant="outline-danger" size="sm">Report Issue</Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={8}>
                    <Card className="mb-4 shadow-sm">
                        <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                            <span>Account Summary</span>
                            <Badge bg={account.accountType === "SAVINGS" ? "info" : "warning"}>
                                {account.accountType}
                            </Badge>
                        </Card.Header>
                        <Card.Body>
                            <Row className="mb-3">
                                <Col sm={3} className="d-flex align-items-center">
                                    <FaCreditCard className="me-2 text-primary" />
                                    <p className="mb-0">Account ID</p>
                                </Col>
                                <Col sm={9}>
                                    <p className="text-muted mb-0">{account.id}</p>
                                </Col>
                            </Row>
                            <hr />
                            <Row className="mb-3">
                                <Col sm={3} className="d-flex align-items-center">
                                    <FaCreditCard className="me-2 text-primary" />
                                    <p className="mb-0">Account Number</p>
                                </Col>
                                <Col sm={9}>
                                    <p className="text-muted mb-0">{account.accountNumber}</p>
                                </Col>
                            </Row>
                            <hr />
                            <Row className="mb-3">
                                <Col sm={3} className="d-flex align-items-center">
                                    <FaMoneyBillWave className="me-2 text-success" />
                                    <p className="mb-0">Balance</p>
                                </Col>
                                <Col sm={9}>
                                    <p className="text-success fw-bold mb-0">
                                        ${account.balance.toFixed(2)}
                                    </p>
                                </Col>
                            </Row>
                            <hr />
                            <Row className="mb-3">
                                <Col sm={3} className="d-flex align-items-center">
                                    <FaUserCircle className="me-2 text-primary" />
                                    <p className="mb-0">User ID</p>
                                </Col>
                                <Col sm={9}>
                                    <p className="text-muted mb-0">{account.userId}</p>
                                </Col>
                            </Row>
                            <hr />
                            <Row className="mb-3">
                                <Col sm={3} className="d-flex align-items-center">
                                    <FaCalendarAlt className="me-2 text-primary" />
                                    <p className="mb-0">Created On</p>
                                </Col>
                                <Col sm={9}>
                                    <p className="text-muted mb-0">{formattedDate}</p>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    <Card className="mb-4 shadow-sm">
                        <Card.Header className="bg-light">Account Benefits</Card.Header>
                        <Card.Body>
                            {account.accountType === "SAVINGS" ? (
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Interest Rate
                                        <Badge bg="success">4.5% p.a.</Badge>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Free Transactions
                                        <Badge bg="success">5 per month</Badge>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Minimum Balance
                                        <Badge bg="warning">$500</Badge>
                                    </li>
                                </ul>
                            ) : (
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Overdraft Facility
                                        <Badge bg="success">Available</Badge>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Free Transactions
                                        <Badge bg="success">Unlimited</Badge>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Maintenance Fee
                                        <Badge bg="warning">$15 monthly</Badge>
                                    </li>
                                </ul>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AccountDetails;
