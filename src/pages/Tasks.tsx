import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Col, Row, Modal, Form } from 'react-bootstrap';
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
    const storedUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    
    if (storedUser) {
      setUser(storedUser.username);
      setUserEmail(storedUser.email);
      setProfileImage(storedUser.profileImage || DEFAULT_PROFILE_PICTURE);
    }

    fetchTasks();
  }, [allTask]);

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
    const token = sessionStorage.getItem('token');
    if (!token) {
      console.error('Token is missing!');
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

    const token = sessionStorage.getItem('token');
    if (!token) {
      alert('You need to be logged in to add a task');
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
      }
    } else {
      alert('Please fill the task name and description!');
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

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      <div className="row">
        {/* Main Content - Tasks */}
        <div className="col-md-9 pe-md-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="text-2xl font-bold">My Tasks</h2>
            <Button
              onClick={() => openModal('add')}
              variant="outline-primary"
              className="d-flex align-items-center"
            >
              <i className="fas fa-plus me-2"></i>Add Task
            </Button>
          </div>

          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {allTask.length > 0 ? (
              allTask.map((task) => (
                <Col key={task._id}>
                  <Card className="shadow-sm border-0 rounded-3">
                    {task.taskImage && (
                      <Card.Img 
                        variant="top" 
                        src={`${SERVER_URL}/uploads/${task.taskImage}`} 
                        style={{ 
                          height: '200px', 
                          objectFit: 'cover' 
                        }} 
                      />
                    )}
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Card.Title className="mb-0">{task.title}</Card.Title>
                        <div className="d-flex">
                          <Link
                            to={`/edit-task/${task._id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              handleEditTask(task._id);
                            }}
                            className="btn btn-sm btn-outline-warning me-2"
                          >
                            <i className="fas fa-edit"></i>
                          </Link>
                          <Button onClick={() => handleRemoveTask(task._id)} variant="outline-danger" size="sm">
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </div>
                      <Card.Text className="text-muted mb-3">{task.description}</Card.Text>
                      <div className="d-flex align-items-center">
                        <div className="progress w-100 me-2" style={{ height: '8px' }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                        <small className="text-muted">{task.progress}%</small>
                      </div>
                      <small className="text-muted d-block mt-2">{task.status}</small>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <div className="col-12">
                <div className="alert alert-light text-center" role="alert">
                  No tasks to display. Add your first task!
                </div>
              </div>
            )}
          </Row>
        </div>

        {/* User Profile */}
        <div className="col-md-3 mt-4 mt-md-0">
          <Card className="shadow-sm border-0">
            <Card.Body className="text-center">
              <div
                className="mx-auto mb-3 rounded-circle"
                style={{
                  width: '120px',
                  height: '120px',
                  backgroundColor: profileImage === DEFAULT_PROFILE_PICTURE ? '#e9ecef' : 'transparent',
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
              </div>

              {/* Profile Picture Upload Controls */}
              <div className="mb-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleProfileImageUpload}
                />
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="me-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload
                </Button>
                {profileImage !== DEFAULT_PROFILE_PICTURE && (
                  <Button variant="outline-danger" size="sm" onClick={handleRemoveProfileImage}>
                    Remove
                  </Button>
                )}
              </div>

              <h4 className="mb-1">{user}</h4>
              <p className="text-muted mb-4">{userEmail}</p>
              <Button variant="outline-danger" className="w-100" onClick={handleLogout}>
                Log Out
              </Button>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Add Task Modal */}
      {activeModal === 'add' && (
        <Modal show={true} onHide={closeModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Add New Task</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleAddTask}>
              <Form.Group className="mb-3">
                <Form.Label>Task Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter task name"
                  value={taskDetails.title}
                  onChange={(e) => setTaskDetails({ ...taskDetails, title: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter task description"
                  value={taskDetails.description}
                  onChange={(e) => setTaskDetails({ ...taskDetails, description: e.target.value })}
                  required
                />
              </Form.Group>
              
              {/* New Image Upload Section */}
              <Form.Group className="mb-3">
                <Form.Label>Task Image (Optional)</Form.Label>
                <input
                  type="file"
                  ref={taskImageInputRef}
                  style={{ display: 'none' }}
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleTaskImageUpload}
                />
                <div className="d-flex align-items-center">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="me-2"
                    onClick={() => taskImageInputRef.current?.click()}
                  >
                    Upload Image
                  </Button>
                  {taskDetails.imagePreview && (
                    <img 
                      src={taskDetails.imagePreview} 
                      alt="Task Preview" 
                      style={{ 
                        maxWidth: '100px', 
                        maxHeight: '100px', 
                        objectFit: 'cover' 
                      }} 
                    />
                  )}
                </div>
              </Form.Group>

              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={taskDetails.status}
                      onChange={(e) => setTaskDetails({ ...taskDetails, status: e.target.value })}
                    >
                      <option value="pending">Pending</option>
                      <option value="in progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Progress</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0-100"
                      value={taskDetails.progress}
                      onChange={(e) => setTaskDetails({ ...taskDetails, progress: parseInt(e.target.value) })}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={closeModal} className="me-2">
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Add Task
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

// Type guard function to check if the response is AxiosResponse
function isAxiosResponse(response: AxiosError | AxiosResponse): response is AxiosResponse {
  return (response as AxiosResponse).data !== undefined;
}

export default Tasks;