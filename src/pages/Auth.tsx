import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerAPI, loginAPI } from '../services/allApi';
import { AxiosResponse, AxiosError } from 'axios';
import { Container, Card, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';

interface AuthProps {
  insideRegister: boolean;
}

interface InputData {
  username: string;
  email: string;
  password: string;
}

interface ValidationErrors {
  email: string | null;
  password: string | null;
}

const Auth: React.FC<AuthProps> = ({ insideRegister }) => {
  const [inputData, setInputData] = useState<InputData>({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    email: null,
    password: null
  });

  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const formVariants = {
    hidden: { x: 20, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 100,
        delay: 0.3
      }
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.05,
      boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.2)",
      transition: { type: "spring", stiffness: 400 }
    },
    tap: { scale: 0.95 }
  };

  const handleGoogleLogin = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
  
    // Check if a token already exists
    const existingToken = sessionStorage.getItem("token");
  
    if (existingToken) {
      setError("User already authenticated, no need to redirect.");
      return; // Prevent unnecessary redirection
    }
  
    console.log("Redirecting to Google auth...");
    window.location.href = "http://localhost:3000/auth/google";
  };

  // Validate email
  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "Email is required";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return null;
  };

  // Validate password
  const validatePassword = (password: string): string | null => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return "Password must contain at least one special character (!@#$%^&*)";
    }
    return null;
  };

  // Handle input changes with validation
  const handleInputChange = (field: keyof InputData, value: string) => {
    setInputData({ ...inputData, [field]: value });
    
    // Run validation on change for relevant fields
    if (field === 'email') {
      setValidationErrors({
        ...validationErrors,
        email: validateEmail(value)
      });
    } else if (field === 'password') {
      setValidationErrors({
        ...validationErrors,
        password: validatePassword(value)
      });
    }
  };

  // Handle registration
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    
    // Full validation before submission
    const emailError = validateEmail(inputData.email);
    const passwordError = validatePassword(inputData.password);
    
    setValidationErrors({
      email: emailError,
      password: passwordError
    });
    
    // If any validation errors exist, prevent form submission
    if (emailError || passwordError || !inputData.username) {
      if (!inputData.username) {
        setError("Please fill the form completely!");
      } else {
        setError("Please fix the validation errors before submitting.");
      }
      return;
    }
    
    if (inputData.email && inputData.password && inputData.username) {
      try {
        setLoading(true);
        setError(null);
        const response = await registerAPI(inputData);
        if (response.status === 200) {
          setSuccess(`Registration successful for ${inputData.username}`);
          setInputData({ username: "", email: "", password: "" });
          setTimeout(() => navigate('/login'), 1500);
        } else {
          setError('Registration failed. Please try again.');
        }
      } catch (error) {
        setError('An error occurred during registration. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      setError("Please fill the form completely!");
    }
  };

  // Handle login
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (inputData.email && inputData.password) {
      try {
        setLoading(true);
        setError(null);
        const response = await loginAPI(inputData);
  
        if ((response as AxiosResponse).status === 200) {
          const axiosResponse = response as AxiosResponse;
  
          sessionStorage.setItem('user', JSON.stringify({
            email: inputData.email,
            username: axiosResponse.data.user.username,
            role:axiosResponse.data.user.role
          }));
          sessionStorage.setItem('token', axiosResponse.data.token);
  
          setSuccess(`Login successful for ${inputData.email}`);
          setInputData({ username: "", email: "", password: "" });
          const userRole = axiosResponse.data.user.role;
          if (userRole === "admin") {
            setTimeout(() => navigate('/admin'), 1500);
          } else {
            setTimeout(() => navigate('/tasks'), 1500);
          }
        } else {
          setError('Login failed. Please check your credentials.');
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          setError(`An error occurred during login: ${error.message}`);
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      setError("Please fill the form completely!");
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-dark min-vh-100 d-flex align-items-center"
    >
      <Container>
        <Card className="border-0 shadow-lg overflow-hidden bg-dark">
          <Row className="g-0">
            <Col md={6} className="p-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card.Img
                  src="https://img.freepik.com/free-vector/login-concept-illustration_114360-739.jpg"
                  className="rounded-0 h-100 object-fit-cover mt-5"
                  alt="Authentication"
                />
              </motion.div>
            </Col>
            <Col md={6}>
              <Card.Body className="p-4 p-md-5">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center mb-4"
                >
                  <h2 className="fw-bold text-secondary">
                    <i className="fas fa-tasks me-2"></i>
                    Task Management
                  </h2>
                  <p className="text-muted">
                    Sign {insideRegister ? "Up" : "In"} to Your Account
                  </p>
                </motion.div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert variant="danger" className="mb-3">{error}</Alert>
                  </motion.div>
                )}
                
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert variant="success" className="mb-3">{success}</Alert>
                  </motion.div>
                )}

                <motion.div variants={formVariants}>
                  <Form>
                    {insideRegister && (
                      <Form.Group className="mb-3">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter your username"
                          value={inputData.username}
                          onChange={(e) => setInputData({ ...inputData, username: e.target.value })}
                          required
                        />
                      </Form.Group>
                    )}
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="name@example.com"
                        value={inputData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        isInvalid={!!validationErrors.email}
                        required
                      />
                      {validationErrors.email && (
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.email}
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>
                    
                    <Form.Group className="mb-4">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter your password"
                        value={inputData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        isInvalid={!!validationErrors.password}
                        required
                      />
                      {validationErrors.password && (
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.password}
                        </Form.Control.Feedback>
                      )}
                      {insideRegister && (
                        <Form.Text className="text-muted">
                          Password must be at least 8 characters with uppercase, lowercase, 
                          number, and special character.
                        </Form.Text>
                      )}
                    </Form.Group>

                    <div className="d-grid gap-2">
                      {insideRegister ? (
                        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                          <Button 
                            variant="primary" 
                            className="w-100 py-2"
                            onClick={handleRegister}
                            disabled={loading}
                          >
                            {loading ? 'Processing...' : 'Create Account'}
                          </Button>
                        </motion.div>
                      ) : (
                        <>
                          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                            <Button 
                              variant="primary" 
                              className="w-100 py-2"
                              onClick={handleLogin}
                              disabled={loading}
                            >
                              {loading ? 'Processing...' : 'Sign In'}
                            </Button>
                          </motion.div>
                          
                          <div className="text-center my-3">OR</div>
                          
                          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                            <Button 
                              variant="outline-secondary" 
                              className="w-100 py-2 d-flex align-items-center justify-content-center"
                              onClick={handleGoogleLogin}
                              disabled={loading}
                            >
                              <img 
                                src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" 
                                alt="Google" 
                                width="20" 
                                height="20" 
                                className="me-2" 
                              />
                              Sign in with Google
                            </Button>
                          </motion.div>
                        </>
                      )}
                    </div>
                  </Form>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="mt-4 text-center text-light"
                >
                  {insideRegister ? (
                    <p className="mb-0">
                      Already have an account? <Link to="/login" className="text-primary fw-bold">Sign In</Link>
                    </p>
                  ) : (
                    <p className="mb-0">
                      Don't have an account? <Link to="/register" className="text-primary fw-bold">Sign Up</Link>
                    </p>
                  )}
                  <div className="mt-3 ">
                    <Link to="/" className="text-muted ">
                      <i className="fas fa-arrow-left me-1 text-light"></i><span className="text-light">Back to Home</span>
                    </Link>
                  </div>
                </motion.div>
              </Card.Body>
            </Col>
          </Row>
        </Card>
      </Container>
    </motion.div>
  );
};

export default Auth;