import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import UserService from '../../services/UserService';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';

const Register = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'CHILD', // Default role, can be changed to PARENT
        address: '',
        phoneno: '',
        aadhaar: '',

    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (userData.password !== userData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            // Remove confirmPassword before sending to API
            const { confirmPassword, ...userDataToSend } = userData;
            await UserService.register(userDataToSend);
            navigate('/login', { state: { message: 'Registration successful! Please login.' } });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-md-center">
                <Col md={6}>
                    <Card className="shadow">
                        <Card.Body>
                            <h2 className="text-center mb-4">Create Your PayNest Account</h2>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>First Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="firstName"
                                                value={userData.firstName}
                                                onChange={handleChange}
                                                required
                                                placeholder="Enter first name"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Last Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="lastName"
                                                value={userData.lastName}
                                                onChange={handleChange}
                                                required
                                                placeholder="Enter last name"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={userData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your email"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        value={userData.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="Choose a password"
                                        minLength="8"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Confirm Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="confirmPassword"
                                        value={userData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        placeholder="Confirm your password"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Account Type</Form.Label>
                                    <Form.Select
                                        name="role"
                                        value={userData.role}
                                        onChange={handleChange}
                                    >
                                        <option value="CHILD">Child Account</option>
                                        <option value="PARENT">Parent Account</option>
                                    </Form.Select>
                                </Form.Group>

                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="w-100 mt-3"
                                    disabled={loading}
                                >
                                    {loading ? 'Creating Account...' : 'Register'}
                                </Button>
                            </Form>
                            <div className="text-center mt-3">
                                <p>Already have an account? <Link to="/login">Login here</Link></p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Register;