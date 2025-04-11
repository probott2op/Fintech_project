import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button, NavDropdown, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../utils/AuthContext';
import NotificationService from '../../services/NotificationService';

const Header = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [notifications, setNotifications] = React.useState([]);
    const [unreadCount, setUnreadCount] = React.useState(0);

    React.useEffect(() => {
        const fetchNotifications = async () => {
            if (user) {
                try {
                    const data = await NotificationService.getUserNotifications(user.id);
                    setNotifications(data);
                    setUnreadCount(data.filter(n => !n.read).length);
                } catch (error) {
                    console.error('Failed to fetch notifications:', error);
                }
            }
        };

        fetchNotifications();
        // Set up polling for notifications every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const markAsRead = async (notificationId) => {
        try {
            await NotificationService.markNotificationAsRead(notificationId);
            setNotifications(notifications.map(n =>
                n.id === notificationId ? { ...n, read: true } : n
            ));
            setUnreadCount(prev => prev - 1);
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    return (
        <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
            <Container>
                <Navbar.Brand as={Link} to="/">
                    <i className="bi bi-piggy-bank me-2"></i>
                    PayNest
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {user && (
                            <>
                                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                                <NavDropdown title="Accounts" id="accounts-dropdown">
                                    <NavDropdown.Item as={Link} to="/accounts">My Accounts</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/accounts/create">Create Account</NavDropdown.Item>
                                </NavDropdown>
                                <NavDropdown title="Transactions" id="transactions-dropdown">
                                    <NavDropdown.Item as={Link} to="/transactions/deposit">Deposit</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/transactions/withdraw">Withdraw</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/transactions/transfer">Transfer</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/transactions/history">History</NavDropdown.Item>
                                </NavDropdown>

                                {user.role === 'PARENT' && (
                                    <NavDropdown title="Parental Controls" id="parent-dropdown">
                                        <NavDropdown.Item as={Link} to="/parent/set-limits">Set Limits</NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/parent/pending-transactions">
                                            Pending Approvals
                                        </NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/parent/audit-logs">Audit Logs</NavDropdown.Item>
                                    </NavDropdown>
                                )}
                            </>
                        )}
                    </Nav>

                    <Nav>
                        {user ? (
                            <>
                                <NavDropdown
                                    title={
                                        <>
                                            Notifications
                                            {unreadCount > 0 && (
                                                <Badge bg="danger" pill className="ms-1">
                                                    {unreadCount}
                                                </Badge>
                                            )}
                                        </>
                                    }
                                    id="notifications-dropdown"
                                >
                                    {notifications.length === 0 ? (
                                        <NavDropdown.Item disabled>No notifications</NavDropdown.Item>
                                    ) : (
                                        <>
                                            {notifications.map(notification => (
                                                <NavDropdown.Item
                                                    key={notification.id}
                                                    onClick={() => markAsRead(notification.id)}
                                                    className={notification.read ? "" : "fw-bold"}
                                                >
                                                    {notification.message}
                                                    <div className="text-muted small">
                                                        {new Date(notification.timestamp).toLocaleString()}
                                                    </div>
                                                </NavDropdown.Item>
                                            ))}
                                            <NavDropdown.Divider />
                                            <NavDropdown.Item as={Link} to="/notifications">
                                                View All Notifications
                                            </NavDropdown.Item>
                                        </>
                                    )}
                                </NavDropdown>

                                <NavDropdown title={user.firstName} id="user-dropdown">
                                    <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                                </NavDropdown>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                                <Nav.Link as={Link} to="/register">Register</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;