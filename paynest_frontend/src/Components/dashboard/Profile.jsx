import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Image, Badge, Accordion, Modal } from 'react-bootstrap';
import UserService from "../../services/UserService.js";
import AccountService from "../../services/AccountService.js";
import TransactionHistory from "./TransactionHistory.jsx";

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [childrenDetails, setChildrenDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTransactions, setShowTransactions] = useState(false);
    const [selectedAccountId, setSelectedAccountId] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const currentUser = UserService.getCurrentUser();
                if (!currentUser.userId) {
                    throw new Error('User not authenticated');
                }
                const response = await UserService.getUserById(currentUser.userId);
                setUser(response);

                // If user is a parent, fetch children details
                if (response.role === "PARENT" && response.childIds && response.childIds.length > 0) {
                    await fetchChildrenDetails(response.childIds);
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
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
            setLoading(false);
        }
    };

    // Show transaction history modal
    const handleShowTransactions = (accountId) => {
        setSelectedAccountId(accountId);
        setShowTransactions(true);
    };

    // Close transaction history modal
    const handleCloseTransactions = () => {
        setShowTransactions(false);
    };

    // Helper function to format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Helper function to get account type badge color
    const getAccountBadgeColor = (accountType) => {
        switch(accountType) {
            case 'SAVINGS': return 'success';
            case 'CHECKING': return 'primary';
            case 'INVESTMENT': return 'warning';
            default: return 'secondary';
        }
    };

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </Container>
        );
    }

    if (!user) {
        return (
            <Container className="mt-5">
                <div className="alert alert-danger">User not found</div>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <Row>
                <Col lg={4}>
                    <Card className="mb-4">
                        <Card.Body className="text-center">
                            <Image
                                src={`https://ui-avatars.com/api/?name=${user.fullName}&background=random&size=150`}
                                alt="avatar"
                                className="rounded-circle img-fluid"
                                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                            />
                            <h5 className="my-3">{user.fullName}</h5>
                            <p className="text-muted mb-1">@{user.username}</p>
                            <p className="text-muted mb-4">{user.role}</p>
                            <div className="d-flex justify-content-center mb-2">
                                <Button variant="primary">Edit Profile</Button>
                                <Button variant="outline-primary" className="ms-1">Message</Button>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="mb-4 mb-lg-0">
                        <Card.Header>Account Details</Card.Header>
                        <Card.Body>
                            <p className="mb-0"><strong>User ID:</strong> {user.id}</p>
                            <hr />
                            <p className="mb-0"><strong>Role:</strong> {user.role}</p>
                            <hr />
                            <p className="mb-0"><strong>POI:</strong> {user.poi}</p>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={8}>
                    <Card className="mb-4">
                        <Card.Header>Personal Information</Card.Header>
                        <Card.Body>
                            <Row className="mb-3">
                                <Col sm={3}>
                                    <p className="mb-0">Full Name</p>
                                </Col>
                                <Col sm={9}>
                                    <p className="text-muted mb-0">{user.fullName}</p>
                                </Col>
                            </Row>
                            <hr />
                            <Row className="mb-3">
                                <Col sm={3}>
                                    <p className="mb-0">Email</p>
                                </Col>
                                <Col sm={9}>
                                    <p className="text-muted mb-0">{user.email}</p>
                                </Col>
                            </Row>
                            <hr />
                            <Row className="mb-3">
                                <Col sm={3}>
                                    <p className="mb-0">Phone</p>
                                </Col>
                                <Col sm={9}>
                                    <p className="text-muted mb-0">{user.phoneno}</p>
                                </Col>
                            </Row>
                            <hr />
                            <Row className="mb-3">
                                <Col sm={3}>
                                    <p className="mb-0">Address</p>
                                </Col>
                                <Col sm={9}>
                                    <p className="text-muted mb-0">{user.address}</p>
                                </Col>
                            </Row>
                            <hr />
                            <Row className="mb-3">
                                <Col sm={3}>
                                    <p className="mb-0">Username</p>
                                </Col>
                                <Col sm={9}>
                                    <p className="text-muted mb-0">@{user.username}</p>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {user.role === "PARENT" && (
                        <Card className="mb-4">
                            <Card.Header>Children Information</Card.Header>
                            <Card.Body>
                                {childrenDetails && childrenDetails.length > 0 ? (
                                    childrenDetails.map(child => (
                                        <Card key={child.id} className="mb-4 border-0 shadow-sm">
                                            <Card.Header className="bg-light">
                                                <Row className="align-items-center">
                                                    <Col xs={2} md={1}>
                                                        <Image
                                                            src={`https://ui-avatars.com/api/?name=${child.fullName}&background=random&size=40`}
                                                            alt={child.fullName}
                                                            className="rounded-circle"
                                                            style={{ width: '40px', height: '40px' }}
                                                        />
                                                    </Col>
                                                    <Col xs={10} md={11}>
                                                        <h5 className="mb-0">{child.fullName}</h5>
                                                    </Col>
                                                </Row>
                                            </Card.Header>
                                            <Card.Body>
                                                <Row className="mb-3">
                                                    <Col md={6}>
                                                        <p className="mb-1"><strong>Username:</strong> @{child.username}</p>
                                                        <p className="mb-1"><strong>Email:</strong> {child.email}</p>
                                                        <p className="mb-1"><strong>Phone:</strong> {child.phoneno}</p>
                                                        <p className="mb-1"><strong>User ID:</strong> {child.id}</p>
                                                    </Col>
                                                    <Col md={6}>
                                                        <p className="mb-1"><strong>Address:</strong> {child.address}</p>
                                                        <p className="mb-1"><strong>Total Accounts:</strong> {child.accounts.length}</p>
                                                        <div className="mt-2">
                                                            <Button variant="outline-primary" size="sm">View Profile</Button>
                                                            <Button variant="outline-success" size="sm" className="ms-2">Add Account</Button>
                                                        </div>
                                                    </Col>
                                                </Row>

                                                <h6 className="mt-3 mb-3">Accounts ({child.accounts.length})</h6>

                                                {child.accounts.length > 0 ? (
                                                    <Accordion>
                                                        {child.accounts.map((account, index) => (
                                                            <Accordion.Item key={account.id} eventKey={`${child.id}-${index}`}>
                                                                <Accordion.Header>
                                                                    <div className="d-flex justify-content-between align-items-center w-100 me-3">
                                                                        <span>
                                                                            <Badge bg={getAccountBadgeColor(account.accountType)} className="me-2">
                                                                                {account.accountType}
                                                                            </Badge>
                                                                            Account: {account.accountNumber}
                                                                        </span>
                                                                        <span className="text-success fw-bold">
                                                                            ${account.balance.toFixed(2)}
                                                                        </span>
                                                                    </div>
                                                                </Accordion.Header>
                                                                <Accordion.Body>
                                                                    <Row>
                                                                        <Col md={6}>
                                                                            <p><strong>Account ID:</strong> {account.id}</p>
                                                                            <p><strong>Account Number:</strong> {account.accountNumber}</p>
                                                                            <p><strong>Balance:</strong> ${account.balance.toFixed(2)}</p>
                                                                        </Col>
                                                                        <Col md={6}>
                                                                            <p><strong>Account Type:</strong> {account.accountType}</p>
                                                                            <p><strong>User ID:</strong> {account.userId}</p>
                                                                            <p><strong>Created:</strong> {formatDate(account.timestamp)}</p>
                                                                        </Col>
                                                                    </Row>
                                                                    <div className="mt-2">
                                                                        <Button
                                                                            variant="primary"
                                                                            size="sm"
                                                                            onClick={() => handleShowTransactions(account.id)}
                                                                        >
                                                                            View Transactions
                                                                        </Button>
                                                                        <Button variant="outline-primary" size="sm" className="ms-2">Deposit</Button>
                                                                        <Button variant="outline-primary" size="sm" className="ms-2">Withdraw</Button>
                                                                    </div>
                                                                </Accordion.Body>
                                                            </Accordion.Item>
                                                        ))}
                                                    </Accordion>
                                                ) : (
                                                    <div className="alert alert-info">
                                                        No accounts found for this child.
                                                    </div>
                                                )}
                                            </Card.Body>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="alert alert-info">
                                        No children associated with this account.
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>

            {/* Transaction History Modal */}
            <Modal
                show={showTransactions}
                onHide={handleCloseTransactions}
                size="lg"
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Transaction History</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedAccountId && <TransactionHistory accountId={selectedAccountId} />}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseTransactions}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default UserProfile;
