import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import UserService from '../../services/UserService';

const Home = () => {
    const isLoggedIn = UserService.isAuthenticated();

    return (
        <div className="home-page">
            {/* Hero Section */}
            <div className="bg-primary text-white py-5">
                <Container>
                    <Row className="align-items-center">
                        <Col md={6}>
                            <h1 className="display-4 fw-bold">Welcome to PayNest</h1>
                            <p className="lead">
                                The smart banking solution designed for families. Teach financial responsibility
                                while maintaining parental oversight.
                            </p>
                            {!isLoggedIn && (
                                <div className="d-flex gap-3 mt-4">
                                    <Link to="/login">
                                        <Button variant="light" size="lg">Login</Button>
                                    </Link>
                                    <Link to="/register">
                                        <Button variant="outline-light" size="lg">Sign Up</Button>
                                    </Link>
                                </div>
                            )}
                            {isLoggedIn && (
                                <Link to="/dashboard">
                                    <Button variant="light" size="lg">Go to Dashboard</Button>
                                </Link>
                            )}
                        </Col>
                        <Col md={6} className="text-center">
                            {/* Placeholder for an illustration */}
                            <div className="bg-white p-3 rounded" style={{ width: '80%', margin: '0 auto' }}>
                                <i className="bi bi-piggy-bank" style={{ fontSize: '120px', color: '#0d6efd' }}></i>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Features Section */}
            <Container className="py-5">
                <h2 className="text-center mb-5">Why Choose PayNest?</h2>
                <Row>
                    <Col md={4} className="mb-4">
                        <Card className="h-100 shadow-sm">
                            <Card.Body className="text-center p-4">
                                <i className="bi bi-shield-lock mb-3" style={{ fontSize: '2rem', color: '#0d6efd' }}></i>
                                <Card.Title>Parental Controls</Card.Title>
                                <Card.Text>
                                    Set spending limits, approve transactions, and monitor your child's financial activities.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4} className="mb-4">
                        <Card className="h-100 shadow-sm">
                            <Card.Body className="text-center p-4">
                                <i className="bi bi-graph-up-arrow mb-3" style={{ fontSize: '2rem', color: '#0d6efd' }}></i>
                                <Card.Title>Financial Education</Card.Title>
                                <Card.Text>
                                    Help your children learn about saving, spending, and managing money responsibly.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4} className="mb-4">
                        <Card className="h-100 shadow-sm">
                            <Card.Body className="text-center p-4">
                                <i className="bi bi-bell mb-3" style={{ fontSize: '2rem', color: '#0d6efd' }}></i>
                                <Card.Title>Real-time Notifications</Card.Title>
                                <Card.Text>
                                    Stay informed with instant notifications about account activities and transaction approvals.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* CTA Section */}
            <div className="bg-light py-5">
                <Container className="text-center">
                    <h2>Ready to start your financial journey?</h2>
                    <p className="lead mb-4">Join PayNest today and take control of your family's finances.</p>
                    {!isLoggedIn && (
                        <Link to="/register">
                            <Button variant="primary" size="lg">Create Your Account</Button>
                        </Link>
                    )}
                    {isLoggedIn && (
                        <Link to="/dashboard">
                            <Button variant="primary" size="lg">Go to Dashboard</Button>
                        </Link>
                    )}
                </Container>
            </div>
        </div>
    );
};

export default Home;