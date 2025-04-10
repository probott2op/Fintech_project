import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Image } from 'react-bootstrap';
import UserService from "../../services/UserService.js";

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const currentUser = UserService.getCurrentUser();
                if (!currentUser.userId) {
                    throw new Error('User not authenticated');
                }
                const response = await UserService.getUserById(currentUser.userId);
                setUser(response);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching user data:', error);
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

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
                            <Card.Header>Parent Information</Card.Header>
                            <Card.Body>
                                {user.childIds && user.childIds.length > 0 ? (
                                    <div>
                                        <p><strong>Children:</strong></p>
                                        <ul className="list-group">
                                            {user.childIds.map(childId => (
                                                <li key={childId} className="list-group-item">
                                                    Child ID: {childId}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <p>No children associated with this account.</p>
                                )}
                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default UserProfile;
