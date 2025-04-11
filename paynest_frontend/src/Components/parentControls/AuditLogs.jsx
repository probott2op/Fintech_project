import React, { useState, useEffect } from 'react';
import { Container, Table, Card, Form, Row, Col, Badge, Alert } from 'react-bootstrap';
import TransactionService from '../../services/TransactionService';

const AuditLogs = () => {
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filterType, setFilterType] = useState('');
    const parentId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchAuditLogs = async () => {
            try {
                setLoading(true);
                const logs = await TransactionService.getAuditLogs(parentId);
                setAuditLogs(logs);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch audit logs');
                setLoading(false);
            }
        };

        fetchAuditLogs();
    }, [parentId]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const filteredLogs = filterType
        ? auditLogs.filter(log => log.actionType === filterType)
        : auditLogs;

    return (
        <Container className="my-4">
            <Card>
                <Card.Header>
                    <h2>Audit Logs</h2>
                </Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Row className="mb-3">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Filter by Action Type</Form.Label>
                                <Form.Select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                >
                                    <option value="">All Actions</option>
                                    <option value="LOGIN">Login</option>
                                    <option value="TRANSACTION">Transaction</option>
                                    <option value="LIMIT_CHANGE">Limit Change</option>
                                    <option value="APPROVAL">Approval</option>
                                    <option value="ACCOUNT_CREATE">Account Creation</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    {loading ? (
                        <div className="text-center my-4">Loading audit logs...</div>
                    ) : filteredLogs.length === 0 ? (
                        <Alert variant="info">No audit logs found</Alert>
                    ) : (
                        <Table responsive striped hover>
                            <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>User</th>
                                <th>Action Type</th>
                                <th>Description</th>
                                <th>Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredLogs.map((log) => (
                                <tr key={log.id}>
                                    <td>{formatDate(log.timestamp)}</td>
                                    <td>{log.userName}</td>
                                    <td>
                                        <Badge bg={
                                            log.actionType === 'LOGIN' ? 'info' :
                                                log.actionType === 'TRANSACTION' ? 'primary' :
                                                    log.actionType === 'LIMIT_CHANGE' ? 'warning' :
                                                        log.actionType === 'APPROVAL' ? 'success' :
                                                            'secondary'
                                        }>
                                            {log.actionType}
                                        </Badge>
                                    </td>
                                    <td>{log.description}</td>
                                    <td>
                                        <Badge bg={
                                            log.status === 'SUCCESS' ? 'success' :
                                                log.status === 'PENDING' ? 'warning' :
                                                    'danger'
                                        }>
                                            {log.status}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default AuditLogs;