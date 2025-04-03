import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Nav, Badge, Tab } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import UserService from '../../services/UserService';
import AccountService from '../../services/AccountService';
import Notifications from '../common/Notifications';
import AccountsList from './AccountsList';
import TransactionHistory from './TransactionHistory';
import PendingTransactions from '../parentControls/PendingTransactions';
import AuditLogs from '../parentControls/AuditLogs';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [isParent, setIsParent] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const currentUser = UserService.getCurrentUser();
                if (!currentUser.userId) {
                    throw new Error('User not authenticated');
                }

                // Fetch user details
                const userResponse = await UserService.getUserById(currentUser.userId);
                setUserData(userResponse.data);
                setIsParent(userResponse.data.role === 'PARENT');

                // Fetch user accounts
                const accountsResponse = await AccountService.getUserAccounts(currentUser.userId);
                setAccounts(accountsResponse.data);

                // Fetch notifications
                const notificationsResponse = await UserService.getUserNotifications(currentUser.userId);
                setNotifications(notificationsResponse.data);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load dashboard data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleRefresh = async () => {
        setLoading(true);
        try {
            const currentUser = UserService.getCurrentUser();

            // Refresh accounts
            const accountsResponse = await AccountService.getUserAccounts(currentUser.userId);
            setAccounts(accountsResponse.data);

            // Refresh notifications
            const notificationsResponse = await UserService.getUserNotifications(currentUser.userId);
            setNotifications(notificationsResponse.data);
        } catch (err) {
            console.error('Error refreshing data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p>Loading your dashboard...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Card className="text-center p-5">
                    <Card.Body>
                        <Card.Title className="text-danger">Error</Card.Title>
                        <Card.Text>{error}</Card.Text>
                        <Button variant="primary" onClick={() => window.location.reload()}>
                            Try Again
                        </Button>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    const unreadNotifications = notifications.filter(n => !n.read).length;

    return (
        <Container className="my-4">
            <Row className="mb-4">
                <Col>
                    <h1>Welcome, {userData?.firstName}!</h1>
                    <p className="text-muted">
                        {isParent ? 'Parent Dashboard' : 'Child Dashboard'} | Last login: {new Date().toLocaleDateString()}
                    </p>
                </Col>
                <Col xs="auto">
                    <div className="d-flex gap-2">
                        <Button variant="outline-primary" onClick={handleRefresh}>
                            <i className="bi bi-arrow-repeat me-1"></i> Refresh
                        </Button>
                        <Button variant="primary" as={Link} to="/notifications">
                            <i className="bi bi-bell me-1"></i> Notifications
                            {unreadNotifications > 0 && (
                                <Badge bg="danger" className="ms-1">{unreadNotifications}</Badge>
                            )}
                        </Button>
                    </div>
                </Col>
            </Row>

            <Tab.Container defaultActiveKey="accounts">
                <Row>
                    <Col md={3} className="mb-4">
                        <Card className="shadow-sm">
                            <Card.Body>
                                <Nav variant="pills" className="flex-column">
                                    <Nav.Item>
                                        <Nav.Link eventKey="accounts">My Accounts</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="transactions">Transaction History</Nav.Link>
                                    </Nav.Item>
                                    {isParent && (
                                        <>
                                            <Nav.Item>
                                                <Nav.Link eventKey="pending">
                                                    Pending Approvals
                                                    <Badge bg="warning" className="ms-2">
                                                        {/* This would be calculated based on pending transactions */}
                                                        New
                                                    </Badge>
                                                </Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="audit">Audit Logs</Nav.Link>
                                            </Nav.Item>
                                        </>
                                    )}
                                </Nav>
                            </Card.Body>
                        </Card>

                        <Card className="mt-4 shadow-sm">
                            <Card.Body>
                                <Card.Title>Quick Actions</Card.Title>
                                <div className="d-grid gap-2 mt-3">
                                    <Button variant="outline-primary" size="sm" as={Link} to="/accounts/create">
                                        <i className="bi bi-plus-circle me-1"></i> New Account
                                    </Button>
                                    <Button variant="outline-success" size="sm" as={Link} to="/transactions/deposit">
                                        <i className="bi bi-cash me-1"></i> Deposit
                                    </Button>
                                    <Button variant="outline-warning" size="sm" as={Link} to="/transactions/withdraw">
                                        <i className="bi bi-cash-stack me-1"></i> Withdraw
                                    </Button>
                                    <Button variant="outline-info" size="sm" as={Link} to="/transactions/transfer">
                                        <i className="bi bi-arrow-left-right me-1"></i> Transfer
                                    </Button>
                                    {isParent && (
                                        <Button variant="outline-secondary" size="sm" as={Link} to="/parent/set-limits">
                                            <i className="bi bi-sliders me-1"></i> Set Limits
                                        </Button>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={9}>
                        <Tab.Content>
                            <Tab.Pane eventKey="accounts">
                                <AccountsList accounts={accounts} onRefresh={handleRefresh} />
                            </Tab.Pane>
                            <Tab.Pane eventKey="transactions">
                                {accounts.length > 0 ? (
                                    <TransactionHistory accountId={accounts[0].id} />
                                ) : (
                                    <Card className="text-center p-5">
                                        <Card.Body>
                                            <Card.Title>No Accounts Found</Card.Title>
                                            <Card.Text>Create an account to view transaction history.</Card.Text>
                                            <Button variant="primary" as={Link} to="/accounts/create">
                                                Create Account
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                )}
                            </Tab.Pane>
                            {isParent && (
                                <>
                                    <Tab.Pane eventKey="pending">
                                        <PendingTransactions parentId={userData.id} onRefresh={handleRefresh} />
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="audit">
                                        <AuditLogs parentId={userData.id} />
                                    </Tab.Pane>
                                </>
                            )}
                        </Tab.Content>
                    </Col>
                </Row>
            </Tab.Container>
        </Container>
    );
};

export default Dashboard;