import { useState } from 'react';
import DatePicker from 'react-datepicker';
import AccountService from '../../services/AccountService';
import { Modal, Form, Button } from 'react-bootstrap';

const DownloadStatementModal = ({ accountId, show, onClose }) => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const handleDownload = async () => {
        try {
            const response = await AccountService.getAccountStatement(accountId, {
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0]
            });

            // Create download link for PDF
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `statement-${accountId}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Download failed:', error);
        }
        onClose();
    };

    return (
        <Modal show={show} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Select Date Range</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Start Date</Form.Label>
                        <DatePicker
                            selected={startDate}
                            onChange={date => setStartDate(date)}
                            dateFormat="yyyy-MM-dd"
                            className="form-control"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>End Date</Form.Label>
                        <DatePicker
                            selected={endDate}
                            onChange={date => setEndDate(date)}
                            dateFormat="yyyy-MM-dd"
                            className="form-control"
                            minDate={startDate}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button variant="primary" onClick={handleDownload} disabled={!startDate || !endDate}>
                    Download
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
export default DownloadStatementModal;