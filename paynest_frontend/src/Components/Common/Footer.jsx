import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-light py-4 mt-auto">
            <Container>
                <Row className="align-items-center">
                    <Col md={6} className="text-center text-md-start">
                        <p className="mb-0">
                            &copy; {year} PayNest. All rights reserved.
                        </p>
                    </Col>
                    <Col md={6} className="text-center text-md-end">
                        <ul className="list-inline mb-0">
                            <li className="list-inline-item">
                                <a href="#" className="text-decoration-none text-muted">Privacy Policy</a>
                            </li>
                            <li className="list-inline-item">
                                <span className="text-muted">•</span>
                            </li>
                            <li className="list-inline-item">
                                <a href="#" className="text-decoration-none text-muted">Terms of Service</a>
                            </li>
                            <li className="list-inline-item">
                                <span className="text-muted">•</span>
                            </li>
                            <li className="list-inline-item">
                                <a href="#" className="text-decoration-none text-muted">Contact Us</a>
                            </li>
                        </ul>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;