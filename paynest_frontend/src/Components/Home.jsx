import React from 'react';
import { Container, Row, Col, Button, Card, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, CreditCard, Users } from 'react-bootstrap-icons';

const Home = () => {
    return (
        <div className="home-page">
            {/* Hero Section */}
            <header className="bg-primary text-white py-5">
                <Container>
                    <Row className="align-items-center">
                        <Col lg={6} className="mb-4 mb-lg-0">
                            <h1 className="display-4 fw-bold">Welcome to PayNest</h1>
                            <p className="lead mb-4">
                                The secure banking application designed for families. Give your children financial
                                independence while maintaining parental oversight.
                            </p>
                            <div className="d-grid gap-2 d-md-flex">
                                <Link to="/register">
                                    <Button variant="light" size="lg" className="me-md-2 px-4">
                                        Get Started
                                    </Button>
                                </Link>
                                <Link to="/login">
                                    <Button variant="outline-light" size="lg" className="px-4">
                                        Login
                                    </Button>
                                </Link>
                            </div>
                        </Col>
                        <Col lg={6}>
                            <div className="text-center">
                                <Image
                                    src="/api/placeholder/500/300"
                                    alt="Family banking"
                                    fluid
                                    className="rounded shadow"
                                />
                            </div>
                        </Col>
                    </Row>
                </Container>
            </header>

            {/* Features Section */}
            <section className="py-5">
                <Container>
                    <h2 className="text-center mb-5">Why Choose PayNest?</h2>
                    <Row>
                        <Col md={4} className="mb-4">
                            <Card className="h-100 shadow-sm hover-card">
                                <Card.Body className="text-center py-4">
                                    <div className="feature-icon bg-primary text-white rounded-circle mb-3 mx-auto d-flex align-items-center justify-content-center" style={{ width: '70px', height: '70px' }}>
                                        <Shield size={30} />
                                    </div>
                                    <Card.Title>Safe & Secure</Card.Title>
                                    <Card.Text>
                                        Built with security in mind. Parents maintain control over children's spending limits and approve transactions.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} className="mb-4">
                            <Card className="h-100 shadow-sm hover-card">
                                <Card.Body className="text-center py-4">
                                    <div className="feature-icon bg-primary text-white rounded-circle mb-3 mx-auto d-flex align-items-center justify-content-center" style={{ width: '70px', height: '70px' }}>
                                        <CreditCard size={30} />
                                    </div>
                                    <Card.Title>Easy Transfers</Card.Title>
                                    <Card.Text>
                                        Send money instantly between accounts. Schedule allowances or make one-time deposits to your child's account.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} className="mb-4">
                            <Card className="h-100 shadow-sm hover-card">
                                <Card.Body className="text-center py-4">
                                    <div className="feature-icon bg-primary text-white rounded-circle mb-3 mx-auto d-flex align-items-center justify-content-center" style={{ width: '70px', height: '70px' }}>
                                        <Users size={30} />
                                    </div>
                                    <Card.Title>Family-Focused</Card.Title>
                                    <Card.Text>
                                        Teach financial responsibility in a controlled environment. Get notifications for all account activities.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* How It Works Section */}
            <section className="bg-light py-5">
                <Container>
                    <h2 className="text-center mb-5">How PayNest Works</h2>
                    <Row className="g-4">
                        <Col md={3}>
                            <div className="text-center">
                                <div className="circle-step bg-primary text-white mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', borderRadius: '50%' }}>
                                    1
                                </div>
                                <h5>Create Account</h5>
                                <p className="text-muted">Register as a parent and create child accounts</p>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="text-center">
                                <div className="circle-step bg-primary text-white mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', borderRadius: '50%' }}>
                                    2
                                </div>
                                <h5>Set Limits</h5>
                                <p className="text-muted">Establish spending limits and transaction rules</p>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="text-center">
                                <div className="circle-step bg-primary text-white mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', borderRadius: '50%' }}>
                                    3
                                </div>
                                <h5>Fund Accounts</h5>
                                <p className="text-muted">Transfer money to your child's account</p>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="text-center">
                                <div className="circle-step bg-primary text-white mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', borderRadius: '50%' }}>
                                    4
                                </div>
                                <h5>Monitor Activity</h5>
                                <p className="text-muted">Review transactions and approve when needed</p>
                            </div>
                        </Col>
                    </Row>
                    <div className="text-center mt-5">
                        <Link to="/register">
                            <Button variant="primary" size="lg">
                                Start Banking Today <ArrowRight />
                            </Button>
                        </Link>
                    </div>
                </Container>
            </section>

            {/* Testimonials Section */}
            <section className="py-5">
                <Container>
                    <h2 className="text-center mb-5">What Parents Say</h2>
                    <Row>
                        <Col md={4} className="mb-4">
                            <Card className="h-100 shadow-sm">
                                <Card.Body>
                                    <div className="d-flex mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className="text-warning me-1">★</span>
                                        ))}
                                    </div>
                                    <Card.Text className="mb-3">
                                        "PayNest has been a game-changer for teaching my teenagers about money management. I love being able to approve purchases while still giving them independence."
                                    </Card.Text>
                                    <div className="d-flex align-items-center">
                                        <div className="bg-primary rounded-circle me-2" style={{ width: '40px', height: '40px' }}></div>
                                        <div>
                                            <h6 className="mb-0">Sarah Johnson</h6>
                                            <small className="text-muted">Mother of two teens</small>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} className="mb-4">
                            <Card className="h-100 shadow-sm">
                                <Card.Body>
                                    <div className="d-flex mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className="text-warning me-1">★</span>
                                        ))}
                                    </div>
                                    <Card.Text className="mb-3">
                                        "The transaction notifications keep me informed about my son's spending habits. Setting spending limits has helped him learn budgeting from a young age."
                                    </Card.Text>
                                    <div className="d-flex align-items-center">
                                        <div className="bg-primary rounded-circle me-2" style={{ width: '40px', height: '40px' }}></div>
                                        <div>
                                            <h6 className="mb-0">Michael Rodriguez</h6>
                                            <small className="text-muted">Father of a 12-year-old</small>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} className="mb-4">
                            <Card className="h-100 shadow-sm">
                                <Card.Body>
                                    <div className="d-flex mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className="text-warning me-1">★</span>
                                        ))}
                                    </div>
                                    <Card.Text className="mb-3">
                                        "I appreciate how easy it is to transfer allowance money each week. The audit logs help me have meaningful financial conversations with my daughter."
                                    </Card.Text>
                                    <div className="d-flex align-items-center">
                                        <div className="bg-primary rounded-circle me-2" style={{ width: '40px', height: '40px' }}></div>
                                        <div>
                                            <h6 className="mb-0">Jennifer Chen</h6>
                                            <small className="text-muted">Parent of a high schooler</small>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* CTA Section */}
            <section className="bg-primary text-white py-5">
                <Container className="text-center">
                    <h2 className="mb-4">Ready to Get Started?</h2>
                    <p className="lead mb-4">Join thousands of families teaching financial responsibility in a secure environment.</p>
                    <Link to="/register">
                        <Button variant="light" size="lg" className="me-3">Sign Up Now</Button>
                    </Link>
                    <Link to="/login">
                        <Button variant="outline-light" size="lg">Sign In</Button>
                    </Link>
                </Container>
            </section>

            {/* Footer */}
            <footer className="bg-dark text-white py-4">
                <Container>
                    <Row>
                        <Col md={6} className="mb-3 mb-md-0">
                            <h5>PayNest</h5>
                            <p className="text-muted mb-0">© 2025 PayNest. All rights reserved.</p>
                        </Col>
                        <Col md={6} className="text-md-end">
                            <Button variant="link" className="text-white text-decoration-none">Terms</Button>
                            <Button variant="link" className="text-white text-decoration-none">Privacy</Button>
                            <Button variant="link" className="text-white text-decoration-none">Support</Button>
                        </Col>
                    </Row>
                </Container>
            </footer>

            {/* Custom CSS */}
            <style jsx>{`
        .hover-card:hover {
          transform: translateY(-5px);
          transition: transform 0.3s ease;
        }
      `}</style>
        </div>
    );
};

export default Home;