import React from 'react';
import { Card, Row, Col, Button, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const AccountsList = ({ accounts, onRefresh }) => {
    // Calculate total balance across all accounts
    const totalBalance = accounts.reduce((sum, account) => sum + parseFloat(account.balance), 0);

    if (!accounts || accounts.length === 0) {
        return (
            <Card className="text-center p-5">
                <Card.Body>
                    <Card.Title>No Accounts Found</Card.Title>
                    <Card.Text>You don't have any accounts yet. Create your first account to get started.</Card.Text>
                    <Button variant="primary" as={Link} to="/accounts/create">
                        Create Your First Account
                    </Button>
                </Card.Body>
            </Card>
        );
    }

    return (
        <div>
            <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <Row>
                        <Col>
                            <h4 className="mb-0">Your Accounts</h4>
                        </Col>
                        <Col xs="auto">
                            <Button variant="outline-primary" size="sm" as={Link} to="/accounts/create">
                                <i className="bi bi-plus-circle me-1"></i> Add Account
                            </Button>
                        </Col>
                    </Row>

                    <Row className="mt-4">
                        <Col md={4}>
                            <Card className="bg-primary text-white">
                                <Card.Body>
                                    <h6 className="text-white-50">Total Balance</h6>
                                    <h3>${totalBalance.toFixed(2)}</h3>
                                    <small>Across all accounts</small>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="bg-success text-white">
                                <Card.Body>
                                    <h6 className="text-white-50">Total Accounts</h6>
                                    <h3>{accounts.length}</h3>
                                    <small>Active accounts</small>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="bg-info text-white">
                                <Card.Body>
                                    <h6 className="text-white-50">Last Updated</h6>
                                    <h3>{new Date().toLocaleDateString()}</h3>
                                    <small>{new Date().toLocaleTimeString()}</small>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card className="shadow-sm">
                <Card.Body>
                    <Table responsive hover>
                        <thead>
                        <tr>
                            <th>Account Name</th>
                            <th>Account Number</th>
                            <th>Type</th>
                            <th>Balance</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {accounts.map((account) => (
                            <tr key={account.id}>
                                <td>{account.accountName}</td>
                                <td>
                    <span className="text-muted">
                      {/* Format account number to show only last 4 digits */}
                        ****{account.accountNumber?.slice(-4) || '0000'}
                    </span>
                                </td>
                                <td>{account.accountType}</td>
                                <td className="fw-bold">${parseFloat(account.balance).toFixed(2)}</td>
                                <td>
                    <span className={`badge bg-${account.status === 'ACTIVE' ? 'success' : 'warning'}`}>
                      {account.status}
                    </span>
                                </td>
                                <td>
                                    <div className="btn-group btn-group-sm">
                                        <Button
                                            variant="outline-primary"
                                            as={Link}
                                            to={`/accounts/${account.id}`}
                                        >
                                            Details
                                        </Button>
                                        <Button
                                            variant="outline-success"
                                            as={Link}
                                            to={`/transactions/deposit?accountId=${account.id}`}
                                        >
                                            Deposit
                                        </Button>
                                        <Button
                                            variant="outline-warning"
                                            as={Link}
                                            to={`/transactions/withdraw?accountId=${account.id}`}
                                        >
                                            Withdraw
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
};

export default AccountsList;