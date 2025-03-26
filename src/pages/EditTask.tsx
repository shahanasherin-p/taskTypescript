import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
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
          
          // Debug log for image path
          console.log('Fetched Task Image:', fetchedTask.taskImage);

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
        console.error('Error fetching task details:', err);
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
    // Clear image-related states
    setTaskDetails(prevDetails => ({
      ...prevDetails,
      taskImage: '', 
    }));
    setPreviewImage(null);
    setOriginalImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { title, description, status, progress, taskImage } = taskDetails;
    if (!title || !description || !status || progress === undefined) {
      setError('Please fill in all fields before submitting.');
      setIsLoading(false);
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setError('You need to be logged in to update the task.');
        setIsLoading(false);
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

      // Debug log for form data
      console.log('Form Data for Update:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await updateTaskAPI(id!, formData, headers);
      
      // Debug log for response
      console.log('Update Response:', response);

      if (response && response.status === 200) {
        alert('Task updated successfully!');
        navigate('/tasks');
      } else {
        setError('Failed to update the task. Please try again.');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message);
        console.error('Update Error Response:', err.response?.data);
      } else {
        setError('An unexpected error occurred.');
      }
      console.error('Error updating task:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="alert alert-danger" role="alert">
          {error}
          <button 
            className="btn btn-secondary ms-2" 
            onClick={() => navigate('/tasks')}
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light p-4">
      <div className="card shadow-lg rounded w-100 w-md-75 w-lg-50 p-4">
        <h1 className="text-3xl font-bold mb-4 text-center">Edit Task</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-3">
            <input
              type="text"
              name="title"
              value={taskDetails.title}
              onChange={handleChange}
              placeholder="Task Title"
              className="form-control"
              required
            />
          </div>

          <div className="mb-3">
            <textarea
              name="description"
              value={taskDetails.description}
              onChange={handleChange}
              placeholder="Task Description"
              className="form-control"
              required
            />
          </div>

          <div className="mb-3">
            <select
              name="status"
              value={taskDetails.status}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="pending">Pending</option>
              <option value="inProgress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="mb-3">
            <input
              type="number"
              name="progress"
              value={taskDetails.progress}
              onChange={handleChange}
              placeholder="Progress (%)"
              className="form-control"
              min="0"
              max="100"
              required
            />
          </div>

          {/* Image Upload Field with improvements */}
          <div className="mb-3">
            <label htmlFor="imageUpload" className="form-label">Task Image</label>
            <input
              type="file"
              id="imageUpload"
              name="taskImage"
              onChange={handleImageChange}
              className="form-control"
              accept="image/jpeg,image/png,image/gif"
            />
            {previewImage && (
              <div className="mt-2 text-center position-relative">
                <img 
                  src={previewImage} 
                  alt="Task Preview" 
                  className="img-fluid rounded" 
                  style={{ maxHeight: '200px', objectFit: 'cover' }} 
                />
                <button 
                  type="button" 
                  className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                  onClick={handleRemoveImage}
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>
          <button 
            type="submit" 
            className="btn btn-primary w-100"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Task'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditTask;