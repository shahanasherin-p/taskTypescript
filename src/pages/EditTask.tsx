import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, ProgressBar, Image } from 'react-bootstrap';
import { getSingleTaskAPI, updateTaskAPI } from '../services/allApi';
import SERVER_URL from '../services/serverUrl';

interface Task {
  _id?: string;
  title: string;
  description: string;
  status: string;
  progress: number;
  taskImage?: string | File; 
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

const EditTask: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [taskDetails, setTaskDetails] = useState<Task>({
    title: '',
    description: '',
    status: 'pending',
    progress: 0,
    taskImage: '', 
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (!id) {
        setError('No task ID provided');
        setIsLoading(false);
        return;
      }

      const token = sessionStorage.getItem('token');
      if (!token) {
        setError('You need to be logged in to edit a task');
        setIsLoading(false);
        return;
      }

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const response = await getSingleTaskAPI(id, headers);

        if (axios.isAxiosError(response)) {
          setError(response.message);
        } else if (response && response.data) {
          const fetchedTask = response.data;
          
          // Determine full image URL
          const fullImageUrl = fetchedTask.taskImage 
            ? (fetchedTask.taskImage.startsWith('http') 
              ? fetchedTask.taskImage 
              : `${SERVER_URL}/uploads/${fetchedTask.taskImage}`)
            : null;

          // Set task details
          setTaskDetails({
            title: fetchedTask.title,
            description: fetchedTask.description,
            status: fetchedTask.status,
            progress: fetchedTask.progress,
            taskImage: fullImageUrl || '',
          });

          // Set original and preview images
          if (fullImageUrl) {
            setOriginalImage(fullImageUrl);
            setPreviewImage(fullImageUrl);
          }
        } else {
          setError('Failed to fetch task details');
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || err.message);
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaskDetails();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTaskDetails(prevDetails => ({
      ...prevDetails,
      [name]: name === 'progress' ? parseInt(value, 10) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        setError('Invalid file type. Please upload a JPEG, PNG, or GIF.');
        return;
      }

      if (file.size > maxSize) {
        setError('File is too large. Maximum size is 5MB.');
        return;
      }

      // Set the file and create a preview
      setTaskDetails(prevDetails => ({
        ...prevDetails,
        taskImage: file,
      }));

      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setTaskDetails(prevDetails => ({
      ...prevDetails,
      taskImage: '', 
    }));
    setPreviewImage(null);
    setOriginalImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const { title, description, status, progress, taskImage } = taskDetails;
    if (!title || !description || !status || progress === undefined) {
      setError('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setError('You need to be logged in to update this task.');
        setIsSubmitting(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      };

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('status', status);
      formData.append('progress', progress.toString());

      // Enhanced image handling logic
      if (taskImage instanceof File) {
        // New image uploaded
        formData.append('taskImage', taskImage);
      } else if (taskImage === '') {
        // Image explicitly removed
        formData.append('taskImage', '');
      } else if (originalImage) {
        // Retain existing image
        const imageFilename = originalImage.split('/').pop();
        formData.append('taskImage', imageFilename || '');
      }

      const response = await updateTaskAPI(id!, formData, headers);
      
      if (response && response.status === 200) {
        navigate('/tasks');
      } else {
        setError('Failed to update the task. Please try again.');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  // Get status variant for the card border
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'inProgress': return 'info';
      case 'pending': return 'warning';
      default: return 'primary';
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="py-5 bg-dark"
      style={{minHeight: '100vh'}}
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={8} xl={7}>
            <motion.div variants={itemVariants}>
              <Card 
                className={`shadow-lg bg-dark text-light border-${getStatusVariant(taskDetails.status)}`} 
                style={{borderWidth: '2px'}}
              >
                <Card.Header className="bg-dark border-bottom-0 pt-4 pb-0 ">
                  <motion.h2 
                    className="text-center mb-3"
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    Edit Task
                  </motion.h2>
                  
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert variant="danger" dismissible onClose={() => setError(null)}>
                        {error}
                      </Alert>
                    </motion.div>
                  )}
                </Card.Header>
                
                <Card.Body>
                  <Form onSubmit={handleSubmit}>
                    <motion.div variants={itemVariants}>
                      <Form.Group className="mb-3">
                        <Form.Label>Task Title</Form.Label>
                        <Form.Control
                          type="text"
                          name="title"
                          value={taskDetails.title}
                          onChange={handleChange}
                          placeholder="Enter task title"
                          required
                        />
                      </Form.Group>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                          as="textarea"
                          name="description"
                          value={taskDetails.description}
                          onChange={handleChange}
                          placeholder="Describe your task"
                          rows={3}
                          required
                        />
                      </Form.Group>
                    </motion.div>

                    <Row>
                      <Col md={6}>
                        <motion.div variants={itemVariants}>
                          <Form.Group className="mb-3">
                            <Form.Label>Status</Form.Label>
                            <Form.Select
                              name="status"
                              value={taskDetails.status}
                              onChange={handleChange}
                              required
                            >
                              <option value="pending">Pending</option>
                              <option value="inProgress">In Progress</option>
                              <option value="completed">Completed</option>
                            </Form.Select>
                          </Form.Group>
                        </motion.div>
                      </Col>
                      
                      <Col md={6}>
                        <motion.div variants={itemVariants}>
                          <Form.Group className="mb-3">
                            <Form.Label>Progress: {taskDetails.progress}%</Form.Label>
                            <Form.Range
                              name="progress"
                              value={taskDetails.progress}
                              onChange={handleChange}
                              min="0"
                              max="100"
                            />
                            <ProgressBar 
                              now={taskDetails.progress} 
                              variant={getStatusVariant(taskDetails.status)}
                              className="mt-2"
                            />
                          </Form.Group>
                        </motion.div>
                      </Col>
                    </Row>

                    <motion.div variants={itemVariants}>
                      <Form.Group className="mb-4">
                        <Form.Label>Task Image</Form.Label>
                        <Form.Control
                          type="file"
                          id="imageUpload"
                          name="taskImage"
                          onChange={handleImageChange}
                          accept="image/jpeg,image/png,image/gif"
                        />
                        <Form.Text className="text-muted">
                          Max file size: 5MB. Supported formats: JPEG, PNG, GIF
                        </Form.Text>
                      </Form.Group>
                    </motion.div>

                    {previewImage && (
                      <motion.div 
                        variants={itemVariants}
                        className="text-center mb-4 position-relative"
                      >
                        <Image 
                          src={previewImage} 
                          alt="Task Preview" 
                          thumbnail
                          className="img-preview"
                          style={{ maxHeight: '200px', objectFit: 'contain' }} 
                        />
                        <motion.button 
                          type="button" 
                          className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                          onClick={handleRemoveImage}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <i className="fas fa-times"></i>
                        </motion.button>
                      </motion.div>
                    )}

                    <Row className="mt-4">
                      <Col xs={6}>
                        <motion.div 
                          variants={itemVariants}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Button 
                            variant="outline-secondary" 
                            className="w-100"
                            onClick={() => navigate('/tasks')}
                            disabled={isSubmitting}
                          >
                            Cancel
                          </Button>
                        </motion.div>
                      </Col>
                      <Col xs={6}>
                        <motion.div 
                          variants={itemVariants}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Button 
                            type="submit" 
                            variant={getStatusVariant(taskDetails.status)}
                            className="w-100"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <Spinner
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  role="status"
                                  aria-hidden="true"
                                  className="me-2"
                                />
                                Saving...
                              </>
                            ) : 'Save Changes'}
                          </Button>
                        </motion.div>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </motion.div>
  );
};

export default EditTask;