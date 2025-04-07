import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Col, Row, Modal, Form, Badge, Alert, ProgressBar, Spinner } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { addTaskAPI, allTaskAPI, getSingleTaskAPI, removeTaskAPI, UpdateUserAPI } from '../services/allApi';
import { AxiosError, AxiosResponse } from 'axios';
import SERVER_URL from '../services/serverUrl';

const DEFAULT_PROFILE_PICTURE = 'https://st.depositphotos.com/1001248/51519/v/450/depositphotos_515192022-stock-illustration-female-user-avatar-related-line.jpg';

const Tasks: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string>(DEFAULT_PROFILE_PICTURE);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const taskImageInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [taskDetails, setTaskDetails] = useState<{ 
    title: string; 
    description: string; 
    status: string; 
    progress: number;
    image: File | null;
    imagePreview: string | null;
  }>({
    title: '', 
    description: '', 
    status: 'pending', 
    progress: 0,
    image: null,
    imagePreview: null
  });

  const [allTask, setAllTask] = useState<any[]>([]);

  useEffect(() => {
    const existingToken = sessionStorage.getItem("token");

    if (!existingToken) {
      // Check if there's a token in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      if (token) {
        sessionStorage.setItem("token", token);
        console.log("Token saved in session storage");

        // Remove token from URL for clean UI
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        console.log("No token found, redirecting to login...");
        window.location.href = "/auth"; // Redirect to login page if no token
      }
    }
  }, []);


  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    
    if (storedUser) {
      setUser(storedUser.username);
      setUserEmail(storedUser.email);
      setProfileImage(storedUser.profileImage || DEFAULT_PROFILE_PICTURE);
    }

    fetchTasks();
  }, []);

  
  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File is too large. Maximum size is 5MB.');
        return;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Please upload a JPEG, PNG, or GIF.');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Create FormData to send file
      const formData = new FormData();
      formData.append('profileImage', file);

      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          alert('You need to be logged in to update profile picture');
          return;
        }

        const response = await UpdateUserAPI(
          formData,
          { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        );

        if (isAxiosResponse(response)) {
          // Update user in session storage with new profile picture
          const storedUser = JSON.parse(sessionStorage.getItem('user') || '{}');
          storedUser.profileImage = response.data.profileImage;
          sessionStorage.setItem('user', JSON.stringify(storedUser));

          // Update profile picture in state
          setProfileImage(response.data.profileImage);
          setPreviewImage(null); // Clear preview after successful upload

          alert('Profile picture updated successfully!');
        }
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        alert('Failed to upload profile picture');
        setPreviewImage(null); // Clear preview on error
      }
    }
  };

  const handleRemoveProfileImage = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        alert('You need to be logged in to remove profile picture');
        return;
      }

      const response = await UpdateUserAPI(
        {},
        { Authorization: `Bearer ${token}` }
      );

      if (isAxiosResponse(response)) {
        // Reset to default profile picture
        setProfileImage(DEFAULT_PROFILE_PICTURE);

        // Update user in session storage
        const storedUser = JSON.parse(sessionStorage.getItem('user') || '{}');
        delete storedUser.profileImage;
        sessionStorage.setItem('user', JSON.stringify(storedUser));

        alert('Profile picture removed successfully!');
      }
    } catch (error) {
      console.error('Error removing profile picture:', error);
      alert('Failed to remove profile picture');
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    const token = sessionStorage.getItem('token');
    if (!token) {
      console.error('Token is missing!');
      setLoading(false);
      return;
    }

    try {
      const response = await allTaskAPI({
        Authorization: `Bearer ${token}`,
      });

      if (isAxiosResponse(response)) {
        setAllTask(response.data);
      } else {
        console.error('Failed to fetch tasks:', response);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File is too large. Maximum size is 5MB.');
        return;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Please upload a JPEG, PNG, or GIF.');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setTaskDetails(prev => ({
          ...prev,
          image: file,
          imagePreview: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const token = sessionStorage.getItem('token');
    if (!token) {
      setError('You need to be logged in to add a task');
      setIsSubmitting(false);
      return;
    }

    if (taskDetails.title && taskDetails.description) {
      try {
        // Create FormData to send task details and image
        const formData = new FormData();
        formData.append('title', taskDetails.title);
        formData.append('description', taskDetails.description);
        formData.append('status', taskDetails.status);
        formData.append('progress', taskDetails.progress.toString());
        
        // Append image if exists
        if (taskDetails.image) {
          formData.append('taskImage', taskDetails.image);
        }

        const response = await addTaskAPI(
          formData,
          { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        );

        if (isAxiosResponse(response)) {
          setAllTask((prevTasks) => [...prevTasks, response.data]);
          closeModal();
          setTaskDetails({ 
            title: '', 
            description: '', 
            status: 'pending', 
            progress: 0,
            image: null,
            imagePreview: null
          });
        }
      } catch (error) {
        console.error('Error adding task:', error);
        setError('Failed to add task. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setError('Please fill the task name and description!');
      setIsSubmitting(false);
    }
  };

  const handleRemoveTask = async (id: string) => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      alert('You need to be logged in to remove a task');
      return;
    }

    try {
      const response = await removeTaskAPI(id, {
        Authorization: `Bearer ${token}`,
      });

      if (isAxiosResponse(response)) {
        setAllTask(allTask.filter((task) => task._id !== id));
        setConfirmDelete(null);
      }
    } catch (error) {
      console.error('Error removing task:', error);
    }
  };

  const openModal = (type: string) => {
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
    setError(null);
    setTaskDetails({ 
      title: '', 
      description: '', 
      status: 'pending', 
      progress: 0,
      image: null,
      imagePreview: null
    });
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  const handleEditTask = async (taskId: string) => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      alert('You need to be logged in to edit a task');
      return;
    }

    try {
      const response = await getSingleTaskAPI(taskId, {
        Authorization: `Bearer ${token}`,
      });

      if (isAxiosResponse(response)) {
        navigate(`/edit-task/${taskId}`, { state: { taskDetails: response.data } });
      }
    } catch (error) {
      console.error('Error fetching task details:', error);
      alert('Failed to fetch task details');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'in progress':
      case 'inprogress':  
        return 'info';
      case 'completed':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const getProgressBarVariant = (progress: number) => {
    if (progress < 30) return 'danger';
    if (progress < 70) return 'warning';
    return 'success';
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: 'spring',
        stiffness: 100
      }
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  return (
    <div className="container-fluid p-4 bg-dark text-dark min-vh-100">
      <div className="row">
        {/* Main Content - Tasks */}
        <div className="col-md-9 pe-md-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <motion.h2 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-bold text-light"
            >
              My Tasks
            </motion.h2>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => openModal('add')}
                variant="outline-light"
                className="d-flex align-items-center bg-light border-secondary text-dark"
              >
                <i className="fas fa-plus me-2"></i>Add Task
              </Button>
            </motion.div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-light" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading your tasks...</p>
            </div>
          ) : (
            <AnimatePresence>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                  {allTask.length > 0 ? (
                    allTask.map((task) => (
                      <Col key={task._id}>
                        <motion.div
                          variants={cardVariants}
                          layout
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          <Card className="shadow border-0 rounded-3 bg-light text-dark">
                            {task.taskImage && (
                              <Card.Img
                                variant="top"
                                src={`${SERVER_URL}/uploads/${task.taskImage}`}
                                style={{
                                  height: '200px',
                                  objectFit: 'cover',
                                  borderTopLeftRadius: '0.3rem',
                                  borderTopRightRadius: '0.3rem',
                                }}
                              />
                            )}
                            <Card.Body className="bg-dark">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <Card.Title className="mb-0 text-primary">{task.title}</Card.Title>
                                <div className="d-flex">
                                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <Link
                                      to={`/edit-task/${task._id}`}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleEditTask(task._id);
                                      }}
                                      className="btn btn-sm btn-outline-primary me-2"
                                    >
                                      <i className="fas fa-edit"></i>
                                    </Link>
                                  </motion.div>
                                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <Button
                                      onClick={() => setConfirmDelete(task._id)}
                                      variant="outline-danger"
                                      size="sm"
                                    >
                                      <i className="fas fa-trash"></i>
                                    </Button>
                                  </motion.div>
                                </div>
                              </div>
                              <Card.Text className="text-secondary mb-3">{task.description}</Card.Text>
                              <div className="d-flex align-items-center mb-2">
                                <div className="progress w-100 me-2 bg-light-subtle" style={{ height: '8px' }}>
                                  <div
                                    className={`progress-bar bg-${getProgressBarVariant(task.progress)}`}
                                    role="progressbar"
                                    style={{ width: `${task.progress}%` }}
                                  ></div>
                                </div>
                                <small className="text-light">{task.progress}%</small>
                              </div>
                              <Badge bg={getStatusBadgeVariant(task.status)} className="mt-2">
                                {task.status}
                              </Badge>
                            </Card.Body>
                          </Card>
                        </motion.div>
                      </Col>
                    ))
                  ) : (
                    <div className="col-12">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="alert alert-dark text-center border-secondary" role="alert">
                          <i className="fas fa-clipboard-list fa-2x mb-3"></i>
                          <p className="mb-0">No tasks to display. Add your first task!</p>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </Row>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* User Profile */}
        <div className="col-md-3 mt-4 mt-md-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="shadow border-0 bg-dark text-light border-secondary">
              <Card.Body className="text-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="mx-auto mb-3 rounded-circle border border-secondary"
                  style={{
                    width: '120px',
                    height: '120px',
                    backgroundColor: profileImage === DEFAULT_PROFILE_PICTURE ? '#343a40' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={previewImage || (profileImage.startsWith('http') ? profileImage : `${SERVER_URL}/uploads/${profileImage}`)}
                    alt="Profile"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      const imgElement = e.target as HTMLImageElement;
                      imgElement.src = DEFAULT_PROFILE_PICTURE;
                    }}
                  />
                </motion.div>

                {/* Profile Picture Upload Controls */}
                <div className="mb-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleProfileImageUpload}
                  />
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="d-inline-block me-2"
                  >
                    <Button
                      variant="outline-light"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <i className="fas fa-upload me-1"></i> Upload
                    </Button>
                  </motion.div>
                  {profileImage !== DEFAULT_PROFILE_PICTURE && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="d-inline-block"
                    >
                      <Button variant="outline-danger" size="sm" onClick={handleRemoveProfileImage}>
                        <i className="fas fa-trash me-1"></i> Remove
                      </Button>
                    </motion.div>
                  )}
                </div>

                <motion.h4 
                  className="mb-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {user}
                </motion.h4>
                <motion.p 
                  className="text-light-50 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {userEmail}
                </motion.p>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button variant="danger" className="w-100" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-2"></i> Log Out
                  </Button>
                </motion.div>
              </Card.Body>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {activeModal === 'add' && (
          <Modal 
            show={true} 
            onHide={closeModal} 
            centered
            backdrop="static"
            size="lg"
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Modal.Header 
                closeButton 
                className={`bg-dark border-${getStatusBadgeVariant(taskDetails.status)}`}
                style={{ borderWidth: '2px', borderBottom: `2px solid var(--bs-${getStatusBadgeVariant(taskDetails.status)})` }}
              >
                <Modal.Title className="text-light">Add New Task</Modal.Title>
              </Modal.Header>
              <Modal.Body className="bg-dark p-4 text-light">
                <Form onSubmit={handleAddTask}>
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
                  
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Form.Group className="mb-3">
                      <Form.Label>Task Title</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter task title"
                        value={taskDetails.title}
                        onChange={(e) => setTaskDetails({ ...taskDetails, title: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Describe your task"
                        value={taskDetails.description}
                        onChange={(e) => setTaskDetails({ ...taskDetails, description: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </motion.div>
                  
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Form.Group className="mb-3">
                      <Form.Label>Task Image</Form.Label>
                      <input
                        type="file"
                        ref={taskImageInputRef}
                        style={{ display: 'none' }}
                        accept="image/jpeg,image/png,image/gif"
                        onChange={handleTaskImageUpload}
                      />
                      <div className="d-flex flex-column">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="mb-2 align-self-start"
                          onClick={() => taskImageInputRef.current?.click()}
                        >
                          <i className="fas fa-image me-1"></i> Upload Image
                        </Button>
                        <Form.Text className="text-muted mb-2">
                          Max file size: 5MB. Supported formats: JPEG, PNG, GIF
                        </Form.Text>
                        
                        {taskDetails.imagePreview && (
                          <div className="position-relative text-center">
                            <motion.img 
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              src={taskDetails.imagePreview} 
                              alt="Task Preview" 
                              className="img-thumbnail"
                              style={{ 
                                maxHeight: '200px', 
                                objectFit: 'contain'
                              }} 
                            />
                            <motion.button 
                              type="button" 
                              className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                              onClick={() => setTaskDetails({...taskDetails, image: null, imagePreview: null})}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <i className="fas fa-times"></i>
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </Form.Group>
                  </motion.div>

                  <Row>
                    <Col md={6}>
                      <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Form.Group className="mb-3">
                          <Form.Label>Status</Form.Label>
                          <Form.Select
                            value={taskDetails.status}
                            onChange={(e) => setTaskDetails({ ...taskDetails, status: e.target.value })}
                          >
                            <option value="pending">Pending</option>
                            <option value="inProgress">In Progress</option>
                            <option value="completed">Completed</option>
                          </Form.Select>
                        </Form.Group>
                      </motion.div>
                    </Col>
                    <Col md={6}>
                      <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Form.Group className="mb-3">
                          <Form.Label>Progress: {taskDetails.progress}%</Form.Label>
                          <Form.Range
                            min="0"
                            max="100"
                            value={taskDetails.progress}
                            onChange={(e) => setTaskDetails({ ...taskDetails, progress: parseInt(e.target.value) })}
                          />
                          <ProgressBar 
                            now={taskDetails.progress} 
                            variant={getProgressBarVariant(taskDetails.progress)}
                            className="mt-2"
                          />
                        </Form.Group>
                      </motion.div>
                    </Col>
                  </Row>
                  
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="d-flex justify-content-end mt-4 gap-2"
                  >
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button variant="outline-secondary" onClick={closeModal}>
                        Cancel
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button 
                        variant={getStatusBadgeVariant(taskDetails.status)} 
                        type="submit"
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
                            Creating...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-plus me-2"></i> Add Task
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </motion.div>
                </Form>
              </Modal.Body>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>


      {/* Confirm Delete Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <Modal 
            show={true} 
            onHide={() => setConfirmDelete(null)} 
            centered
            contentClassName="bg-dark text-light border-secondary"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Modal.Header closeButton className="border-secondary">
                <Modal.Title>Confirm Deletion</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <p>Are you sure you want to delete this task? This action cannot be undone.</p>
              </Modal.Body>
              <Modal.Footer className="border-secondary">
                <Button variant="outline-light" onClick={() => setConfirmDelete(null)}>
                  Cancel
                </Button>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="danger" onClick={() => handleRemoveTask(confirmDelete)}>
                    <i className="fas fa-trash me-2"></i> Delete Task
                  </Button>
                </motion.div>
              </Modal.Footer>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// Type guard function to check if the response is AxiosResponse
function isAxiosResponse(response: AxiosError | AxiosResponse): response is AxiosResponse {
  return (response as AxiosResponse).data !== undefined;
}

export default Tasks;