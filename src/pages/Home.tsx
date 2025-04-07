import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  return (
    <>
      {/* Hero Section with modern styling */}
      <section className="position-relative overflow-hidden pb-5 pt-5">
        <div className="position-absolute top-0 start-0 w-100 h-100">
          <div 
            className="position-absolute" 
            style={{
              background: "linear-gradient(135deg, rgba(90,0,255,0.1) 0%, rgba(168,85,247,0.1) 100%)",
              width: "60%",
              height: "60%",
              borderRadius: "50%",
              filter: "blur(80px)",
              top: "10%",
              left: "0%",
              zIndex: 0
            }}
          />
          <div 
            className="position-absolute" 
            style={{
              background: "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(37,99,235,0.1) 100%)",
              width: "50%",
              height: "50%",
              borderRadius: "50%",
              filter: "blur(80px)",
              bottom: "10%",
              right: "5%",
              zIndex: 0
            }}
          />
        </div>

        <Container className="position-relative">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-5 pt-4"
          >
            <h1 className="display-3 fw-bold text-gradient mb-4">
              Organize Your Life, One Task at a Time
            </h1>
            <p className="lead mb-5 px-md-5 mx-auto" style={{ maxWidth: "700px" }}>
              Take control of your tasks with our intuitive task management app. 
              Modern design meets powerful productivity tools.
            </p>
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link to="/login">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="px-4 py-2 shadow-lg rounded-pill"
                    style={{ 
                      background: "linear-gradient(to right, #6366f1, #8b5cf6)",
                      border: "none"
                    }}
                  >
                    Get Started
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

          {/* App Mockup */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center mb-5"
          >
            <div 
              className="p-3 shadow-lg mx-auto"
              style={{ 
                maxWidth: "850px", 
                borderRadius: "16px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)"
              }}
            >
              <div className="bg-dark rounded-3 p-2">
                <div className="d-flex align-items-center mb-3 px-3 pt-2">
                  <div className="d-flex gap-2">
                    <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ff5f57" }}></div>
                    <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#febc2e" }}></div>
                    <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#28c840" }}></div>
                  </div>
                  <div className="small text-light mx-auto">TaskFlow Pro</div>
                </div>
                <div 
                  className="p-3 rounded-3" 
                  style={{ 
                    background: "linear-gradient(to right, #1e1e1e, #2d2d2d)",
                  }}
                >
                  <Row className="g-3">
                    <Col md={4}>
                      <div className="bg-dark bg-opacity-50 rounded-3 p-3 h-100">
                        <div className="h5 mb-3 text-primary">Projects</div>
                        <div className="d-flex flex-column gap-2">
                          <div className="p-2 rounded bg-primary bg-opacity-25 border border-primary border-opacity-25">Work Tasks</div>
                          <div className="p-2 rounded bg-info bg-opacity-25 border border-info border-opacity-25">Personal</div>
                          <div className="p-2 rounded bg-success bg-opacity-25 border border-success border-opacity-25">Fitness</div>
                        </div>
                      </div>
                    </Col>
                    <Col md={8}>
                      <div className="bg-dark bg-opacity-50 rounded-3 p-3 h-100">
                        <div className="h5 mb-3 text-light">Today's Tasks</div>
                        <div className="d-flex flex-column gap-2">
                          <div className="p-2 rounded bg-light bg-opacity-10 border border-light border-opacity-10 d-flex">
                            <div className="form-check">
                              <input className="form-check-input" type="checkbox" checked />
                              <label className="form-check-label text-decoration-line-through text-muted">Review project plan</label>
                            </div>
                          </div>
                          <div className="p-2 rounded bg-light bg-opacity-10 border border-light border-opacity-10 d-flex">
                            <div className="form-check">
                              <input className="form-check-input" type="checkbox" />
                              <label className="form-check-label">Update website design</label>
                            </div>
                          </div>
                          <div className="p-2 rounded bg-light bg-opacity-10 border border-light border-opacity-10 d-flex">
                            <div className="form-check">
                              <input className="form-check-input" type="checkbox" />
                              <label className="form-check-label">Schedule team meeting</label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Features Section with Style */}
      <section className="py-5 bg-light">
        <Container>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-5"
          >
            <h2 className="display-5 fw-bold mb-4">Features</h2>
            <p className="lead mb-5 mx-auto" style={{ maxWidth: "700px" }}>
              Powerful tools to help you organize, prioritize, and accomplish your tasks with ease.
            </p>
          </motion.div>

          <Row className="g-4">
            {/* Feature Card 1 */}
            <Col lg={4} md={6}>
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <Card className="h-100 border-0 shadow-sm hover-shadow bg-dark text-light" style={{ borderRadius: "16px", overflow: "hidden" }}>
                  <div className="position-relative">
                    <div 
                      className="position-absolute top-0 start-0 w-100 h-100" 
                      style={{
                        background: "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.1) 100%)",
                        zIndex: 0
                      }}
                    />
                    <Card.Body className="position-relative z-1 p-4">
                      <div 
                        className="d-flex align-items-center justify-content-center rounded-circle mb-4 mx-auto" 
                        style={{ 
                          width: "64px", 
                          height: "64px", 
                          background: "linear-gradient(135deg, #6366f1, #8b5cf6)" 
                        }}
                      >
                        <svg className="bi bi-graph-up text-white" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                          <path fillRule="evenodd" d="M0 0h1v15h15v1H0V0zm10 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4.9l-3.613 4.417a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61L13.445 4H10.5a.5.5 0 0 1-.5-.5z"/>
                        </svg>
                      </div>
                      <h3 className="h4 fw-bold mb-3 text-center">Track Progress</h3>
                      <p className="text-muted text-center mb-0">
                        Monitor the status and progress of your tasks in real-time with intuitive dashboards and analytics.
                      </p>
                    </Card.Body>
                  </div>
                </Card>
              </motion.div>
            </Col>

            {/* Feature Card 2 */}
            <Col lg={4} md={6}>
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <Card className="h-100 border-0 shadow-sm hover-shadow bg-dark text-light" style={{ borderRadius: "16px", overflow: "hidden" }}>
                  <div className="position-relative">
                    <div 
                      className="position-absolute top-0 start-0 w-100 h-100" 
                      style={{
                        background: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.1) 100%)",
                        zIndex: 0
                      }}
                    />
                    <Card.Body className="position-relative z-1 p-4">
                      <div 
                        className="d-flex align-items-center justify-content-center rounded-circle mb-4 mx-auto" 
                        style={{ 
                          width: "64px", 
                          height: "64px", 
                          background: "linear-gradient(135deg, #10b981, #059669)" 
                        }}
                      >
                        <svg className="bi bi-bell text-white" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901z"/>
                        </svg>
                      </div>
                      <h3 className="h4 fw-bold mb-3 text-center">Set Reminders</h3>
                      <p className="text-muted text-center mb-0">
                        Never miss a deadline with customizable reminders and notifications to keep you on track.
                      </p>
                    </Card.Body>
                  </div>
                </Card>
              </motion.div>
            </Col>

            {/* Feature Card 3 */}
            <Col lg={4} md={12}>
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <Card className="h-100 border-0 shadow-sm hover-shadow bg-dark text-light" style={{ borderRadius: "16px", overflow: "hidden" }}>
                  <div className="position-relative">
                    <div 
                      className="position-absolute top-0 start-0 w-100 h-100" 
                      style={{
                        background: "linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(236,72,153,0.1) 100%)",
                        zIndex: 0
                      }}
                    />
                    <Card.Body className="position-relative z-1 p-4">
                      <div 
                        className="d-flex align-items-center justify-content-center rounded-circle mb-4 mx-auto" 
                        style={{ 
                          width: "64px", 
                          height: "64px", 
                          background: "linear-gradient(135deg, #8b5cf6, #ec4899)" 
                        }}
                      >
                        <svg className="bi bi-list-check text-white" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                          <path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3.854 2.146a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708L2 3.293l1.146-1.147a.5.5 0 0 1 .708 0zm0 4a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708L2 7.293l1.146-1.147a.5.5 0 0 1 .708 0zm0 4a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 0 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0z"/>
                        </svg>
                      </div>
                      <h3 className="h4 fw-bold mb-3 text-center">Manage Tasks</h3>
                      <p className="text-muted text-center mb-0">
                        Add, update, and delete tasks effortlessly with our intuitive and user-friendly drag-and-drop interface.
                      </p>
                    </Card.Body>
                  </div>
                </Card>
              </motion.div>
            </Col>
          </Row>

          {/* CTA Section */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-5 pt-4"
          >
            <Link to="/register">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline-primary" 
                  size="lg" 
                  className="px-4 py-2 rounded-pill"
                >
                  Start Organizing Today
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </Container>
      </section>

      {/* Add custom CSS for gradient text and hover effects */}
      <style>
        {`
          .text-gradient {
            background: linear-gradient(to right, #6366f1, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          
          .hover-shadow:hover {
            box-shadow: 0 1rem 3rem rgba(0,0,0,.175) !important;
            transition: all 0.3s ease;
          }
          
          /* Dark mode adjustments */
          @media (prefers-color-scheme: dark) {
            body {
              background-color: #121212;
              color: #fff;
            }
            
            .bg-light {
              background-color: #1e1e1e !important;
            }
            
            .text-muted {
              color: #adb5bd !important;
            }
          }
        `}
      </style>
    </>
  );
};

export default Home;