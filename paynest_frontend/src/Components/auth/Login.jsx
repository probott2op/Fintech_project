import {useContext, useState} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import UserService from '../../services/UserService';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import {AuthContext} from "../../utils/AuthContext.jsx";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(credentials);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
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
                            <h2 className="text-center mb-4">PayNest Login</h2>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>User Name</Form.Label>
                                    <Form.Control
                                        type="input"
                                        name="username"
                                        value={credentials.username}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your user name"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        value={credentials.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your password"
                                    />
                                </Form.Group>

                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="w-100 mt-3"
                                    disabled={loading}
                                >
                                    {loading ? 'Logging in...' : 'Login'}
                                </Button>
                            </Form>
                            <div className="text-center mt-3">
                                <p>Don't have an account? <Link to="/register">Register here</Link></p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;