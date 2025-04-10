import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import UserService from '../../services/UserService';
import { Form, Button, Container, Row, Col, Card, Alert, ProgressBar } from 'react-bootstrap';

const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const totalSteps = 3;

    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'PARENT', // Default role, can be changed to CHILD
        parentId: '', // Add this new field for parent's Id
        address: '',
        phoneno: '',
        poi: '', // Proof of ID
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [returnedUsername, setReturnedUsername] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateStep = () => {
        switch(step) {
            case 1:
                if (!userData.firstName || !userData.lastName || !userData.email || !userData.password || !userData.confirmPassword) {
                    setError('Please fill in all required fields');
                    return false;
                }
                if (userData.password !== userData.confirmPassword) {
                    setError('Passwords do not match');
                    return false;
                }
                if (userData.password.length < 8) {
                    setError('Password must be at least 8 characters long');
                    return false;
                }
                // Add validation for parent username if role is CHILD
                if (userData.role === 'CHILD' && !userData.parentId) {
                    setError('Please provide parent\'s username');
                    return false;
                }
                return true;
            case 2:
                if (!userData.address || !userData.phoneno) {
                    setError('Please provide your address and phone number');
                    return false;
                }
                return true;
            case 3:
                if (!userData.poi) {
                    setError('Please provide proof of identification');
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (validateStep()) {
            setError('');
            setStep(prevStep => prevStep + 1);
        }
    };

    const handleBack = () => {
        setError('');
        setStep(prevStep => prevStep - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateStep()) return;

        setLoading(true);
        setError('');

        try {
            // Combine firstName and lastName into fullName
            // Remove confirmPassword before sending to API
            const { firstName, lastName, confirmPassword: _confirmPassword, ...rest } = userData;
            const userDataToSend = {
                ...rest,
                fullName: `${firstName} ${lastName}`.trim()
            };

            const response = await UserService.register(userDataToSend);

            // Display the username returned from the API
            if (response && response.data && response.data.username) {
                setReturnedUsername(response.data.username);
                setSuccessMessage('Registration successful! Your username is:');
            } else {
                // If username is not returned, still show a success message
                setSuccessMessage('Registration successful!');
            }

            // After 3 seconds, redirect to login page
            setTimeout(() => {
                navigate('/login', { state: { message: 'Registration successful! Please login.' } });
            }, 10000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch(step) {
            case 1:
                return (
                    <>
                        <h3 className="text-center mb-4">Step 1: Personal Information</h3>
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

                        {/* Add conditional rendering for parent username field */}
                        {userData.role === 'CHILD' && (
                            <Form.Group className="mb-3">
                                <Form.Label>Parent's Username</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="parentId"
                                    value={userData.parentId}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your parent's username"
                                />
                                <Form.Text className="text-muted">
                                    Child accounts must be linked to a parent account.
                                </Form.Text>
                            </Form.Group>
                        )}
                    </>
                );
            case 2:
                return (
                    <>
                        <h3 className="text-center mb-4">Step 2: Contact Information</h3>
                        <Form.Group className="mb-3">
                            <Form.Label>Address</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="address"
                                value={userData.address}
                                onChange={handleChange}
                                required
                                placeholder="Enter your full address"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                                type="tel"
                                name="phoneno"
                                value={userData.phoneno}
                                onChange={handleChange}
                                required
                                placeholder="Enter your phone number"
                            />
                        </Form.Group>
                    </>
                );
            case 3:
                return (
                    <>
                        <h3 className="text-center mb-4">Step 3: Verification</h3>
                        <Form.Group className="mb-3">
                            <Form.Label>Proof of Identification</Form.Label>
                            <Form.Control
                                type="text"
                                name="poi"
                                value={userData.poi}
                                onChange={handleChange}
                                required
                                placeholder="Enter your ID number (Passport, Driver's License, etc.)"
                            />
                            <Form.Text className="text-muted">
                                We'll need this to verify your identity. Your information is secure and encrypted.
                            </Form.Text>
                        </Form.Group>
                    </>
                );
            default:
                return null;
        }
    };

    // Rest of the component remains the same...

    // If registration is successful and we have a username, show it
    if (successMessage) {
        return (
            <Container className="mt-5">
                <Row className="justify-content-md-center">
                    <Col md={8}>
                        <Card className="shadow">
                            <Card.Body className="text-center">
                                <h2 className="mb-4">Registration Successful!</h2>
                                {returnedUsername && (
                                    <Alert variant="success">
                                        <h4>Your username is: <strong>{returnedUsername}</strong></h4>
                                        <p>Please remember this for login.</p>
                                    </Alert>
                                )}
                                <p>Redirecting to login page in a few seconds...</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <Row className="justify-content-md-center">
                <Col md={8}>
                    <Card className="shadow">
                        <Card.Body>
                            <h2 className="text-center mb-3">Create Your PayNest Account</h2>

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <ProgressBar now={(step / totalSteps) * 100} label={`Step ${step} of ${totalSteps}`} />
                                <div className="d-flex justify-content-between mt-1">
                                    <small>Personal Info</small>
                                    <small>Contact Details</small>
                                    <small>Verification</small>
                                </div>
                            </div>

                            {error && <Alert variant="danger">{error}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                {renderStep()}
                                <div className="d-flex justify-content-between mt-4">
                                    {step > 1 && (
                                        <Button
                                            variant="secondary"
                                            onClick={handleBack}
                                            disabled={loading}
                                            type="button"
                                        >
                                            Back
                                        </Button>
                                    )}

                                    {step < totalSteps ? (
                                        <Button
                                            variant="primary"
                                            onClick={handleNext}
                                            className={step === 1 ? "ms-auto" : ""}
                                            type="button"
                                        >
                                            Next
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="success"
                                            type="submit"
                                            disabled={loading}
                                            className="ms-auto"
                                        >
                                            {loading ? 'Creating Account...' : 'Register'}
                                        </Button>
                                    )}
                                </div>
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
