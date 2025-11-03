import React from 'react';
import { Container, Nav, Navbar, Button, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Welcome = () => {
    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(to right, #89f7fe, #66a6ff)',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Top Navigation */}
            <Navbar bg="light" expand="sm" className="shadow-sm">
                <Container>
                    <Navbar.Brand as={Link} to="/" className="fw-bold text-primary fs-4">
                        🌿 MindMate
                    </Navbar.Brand>
                    <Nav className="ms-auto">
                        <Nav.Link as={Link} to="/login" className="fw-bold">
                            LOGIN
                        </Nav.Link>
                    </Nav>
                </Container>
            </Navbar>

            {/* Main Section */}
            <Container className="flex-grow-1 d-flex align-items-center justify-content-center">
                <Row className="text-center">
                    <Col md={12}>
                        <Card
                            className="shadow-lg p-4"
                            style={{
                                background: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '20px',
                            }}
                        >
                            <h1 className="fw-bold mb-3 text-primary display-5">Welcome to MindMate</h1>
                            <p className="lead text-secondary px-3" style={{ maxWidth: '700px', margin: '0 auto' }}>
                                <strong>MindMate</strong> is your anonymous mental health companion – built for students seeking
                                a judgment-free, emotionally safe space. Connect with licensed counselors and psychologists,
                                share your thoughts anonymously, access wellness tools, and take charge of your mental wellbeing
                                — all in one compassionate platform.
                            </p>
                            <p className='m-0 mt-2'>"You’re Not Alone!"</p>

                            <div className="mt-4 d-flex justify-content-center gap-3 flex-wrap">
                                <Button as={Link} to="/student/signup" variant="primary" size="lg">
                                    Join as Student
                                </Button>
                                <Button as={Link} to="counselorpsychologist/signup/" variant="success" size="lg">
                                    Join as Counselor
                                </Button>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Bottomline */}
            <footer className="text-center py-3 bg-light mt-auto shadow-sm">
                <small className="text-muted">© {new Date().getFullYear()} MindMate –  All rights reserved.</small>
            </footer>
        </div>
    );
};

export default Welcome;