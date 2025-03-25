import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

const Pnf: React.FC = () => {
  return (
    <Container fluid className="d-flex align-items-center justify-content-center min-vh-100">
      <Row className="text-center">
        <Col>
          <h1 style={{ fontSize: '4rem', color: '#ff6347' }}>Oops! 🕵️‍♂️</h1>
          <p style={{ fontSize: '1.5rem', color: '#666' }}>
            Looks like you've stumbled into a black hole! This page doesn't exist.
          </p>
          <img 
            src="https://media.giphy.com/media/3o6gE5SgX7z99mdYjG/giphy.gif" 
            alt="Lost in space"
            className="img-fluid my-4"
            style={{ maxWidth: '400px', borderRadius: '10px' }}
          />
          <p style={{ fontSize: '1rem', color: '#666' }}>
            Maybe try going <Button variant="link" href="/">home</Button>?
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default Pnf;
