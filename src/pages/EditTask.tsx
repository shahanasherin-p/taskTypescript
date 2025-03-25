import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { getSingleTaskAPI, updateTaskAPI } from '../services/allApi';

interface Task {
  _id?: string;
  title: string;
  description: string;
  status: string;
  progress: number;
}

const EditTask: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [taskDetails, setTaskDetails] = useState<Task>({
    title: '',
    description: '',
    status: 'pending',
    progress: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

        // Check if response is successful
        if (axios.isAxiosError(response)) {
          setError(response.message);
        } else if (response && response.data) {
          // Log the fetched task details here
          console.log('Fetched Task Details:', response.data);
          
          setTaskDetails({
            ...response.data,
            progress: response.data.progress,
          });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Log the task data before submission
    console.log('Submitting Task Data:', taskDetails);

    const { title, description, status, progress } = taskDetails;
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
      };

      const response = await updateTaskAPI(id!, { title, description, status, progress }, headers);

      if (response && response.status === 200) {
        alert('Task updated successfully!');
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
