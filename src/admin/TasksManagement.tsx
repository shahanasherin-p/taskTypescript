import React, { useState, useEffect } from 'react';
import { Trash2, Search, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import { allTasksAPI, removeTaskAPI } from '../services/allApi';
import { AxiosResponse, AxiosError } from 'axios';

interface Task {
  _id: string;
  title: string;
  description?: string;
  email: string;
  author?: string;
  username?: string;
  status?: string;
}

interface ApiErrorResponse {
  message?: string;
  [key: string]: any;
}

const TasksManagement: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<string>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [tasksPerPage] = useState<number>(5);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const token = sessionStorage.getItem("token");
        const reqHeader = { Authorization: `Bearer ${token}` };
        const response = await allTasksAPI(reqHeader) as unknown as AxiosResponse<Task[]>;
        if (response.status === 200 && response.data) {
          setTasks(response.data);
          setFilteredTasks(response.data);
        } else {
          setError("Failed to fetch tasks");
        }
      } catch (err: any) {
        console.error("Error fetching tasks:", err);
        let errorMessage = "An error occurred while fetching tasks";
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as AxiosError<ApiErrorResponse>;
          errorMessage = axiosError.response?.data?.message || errorMessage;
        }
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, []);

  useEffect(() => {
    // Filter and sort the tasks whenever the filter criteria change
    let result = [...tasks];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(task => task.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(lowercaseSearch) || 
        (task.description && task.description.toLowerCase().includes(lowercaseSearch))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const fieldA = a[sortField as keyof Task] || '';
      const fieldB = b[sortField as keyof Task] || '';
      
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sortDirection === 'asc' 
          ? fieldA.localeCompare(fieldB) 
          : fieldB.localeCompare(fieldA);
      }
      return 0;
    });
    
    setFilteredTasks(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [tasks, searchTerm, sortField, sortDirection, statusFilter]);

  const handleDeleteTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      const token = sessionStorage.getItem("token");
      if (token) {
        const reqHeader = { Authorization: `Bearer ${token}` };
        try {
          const result = await removeTaskAPI(id, reqHeader) as AxiosResponse<any>;
          if (result.status === 200) {
            setTasks(prevTasks => prevTasks.filter(task => task._id !== id));
            
            // Show success notification
            const notificationElement = document.getElementById('notification');
            if (notificationElement) {
              notificationElement.innerText = 'Task deleted successfully';
              notificationElement.className = 'notification-success';
              notificationElement.style.display = 'block';
              setTimeout(() => {
                notificationElement.style.display = 'none';
              }, 3000);
            }
          } else {
            alert('Failed to delete task');
          }
        } catch (err) {
          console.log("Delete Error:", err);
          alert('Error deleting task');
        }
      }
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  // Get unique status values for the filter dropdown
  const statusOptions = Array.from(new Set(tasks.map(task => task.status || 'Pending')));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Status badge color mapping
  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'Completed':
        return 'bg-success';
      case 'In Progress':
        return 'bg-warning';
      case 'Pending':
      default:
        return 'bg-secondary';
    }
  };

  // Pagination logic
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // Display a limited number of page numbers
  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;
    
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="d-flex flex-column flex-md-row min-vh-100 bg-light mt-5 py-5">
      {/* Sidebar integrated here */}
      <div className={`${isMobile ? 'w-100' : 'col-md-3 col-lg-2'}`}>
        <Sidebar />
      </div>
      
      {/* Main content */}
      <motion.div 
        className="flex-grow-1 p-3 p-md-4 overflow-hidden"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Notification container */}
        <div id="notification" className="position-fixed top-0 end-0 m-4" style={{ display: 'none', zIndex: 1060 }}></div>
        
        {/* Page header with title */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center">
                <Search size={24} className="text-primary me-2" />
                <h1 className="h3 fw-bold m-0">Task Management</h1>
              </div>
            </div>
            
            {/* Search bar and filters */}
            <div className="row g-3">
              <div className="col-md-8">
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0">
                    <Search size={16} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button 
                      className="btn btn-outline-secondary" 
                      type="button"
                      onClick={() => setSearchTerm('')}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <div className="col-md-4">
                <select 
                  className="form-select" 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tasks list */}
        {isLoading ? (
          <motion.div 
            className="text-center py-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading tasks...</span>
            </div>
            <p className="mt-2 text-muted">Loading tasks...</p>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="alert alert-danger rounded-4 d-flex align-items-center" role="alert">
              <AlertCircle size={18} className="me-2" />
              {error}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="card shadow-sm border-0"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th 
                      className="px-3 py-3 cursor-pointer"
                      onClick={() => handleSort('_id')}
                    >
                      <div className="d-flex align-items-center">
                        ID {getSortIcon('_id')}
                      </div>
                    </th>
                    <th 
                      className="px-3 py-3 cursor-pointer"
                      onClick={() => handleSort('title')}
                    >
                      <div className="d-flex align-items-center">
                        Title {getSortIcon('title')}
                      </div>
                    </th>
                    <th 
                      className="px-3 py-3 cursor-pointer"
                      onClick={() => handleSort('description')}
                    >
                      <div className="d-flex align-items-center">
                        Description {getSortIcon('description')}
                      </div>
                    </th>
                    <th 
                      className="px-3 py-3 cursor-pointer"
                      onClick={() => handleSort('status')}
                    >
                      <div className="d-flex align-items-center">
                        Status {getSortIcon('status')}
                      </div>
                    </th>
                    <th className="px-3 py-3 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTasks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-5 text-muted">
                        <div className="mb-3">
                          <AlertCircle size={32} className="text-muted" />
                        </div>
                        {searchTerm ? 'No tasks matching your search' : 'No tasks found'}
                      </td>
                    </tr>
                  ) : (
                    currentTasks.map((task, index) => (
                      <motion.tr 
                        key={task._id} 
                        className="align-middle"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: 'rgba(0,0,0,0.03)' }}
                      >
                        <td className="px-3 py-3 text-truncate" style={{ maxWidth: '150px' }}>
                          <span className="text-muted small">{task._id.substring(0, 6)}...</span>
                        </td>
                        <td className="px-3 py-3 fw-medium">{task.title}</td>
                        <td className="px-3 py-3 text-truncate" style={{ maxWidth: '200px' }}>
                          {task.description || "N/A"}
                        </td>
                        <td className="px-3 py-3">
                          <span className={`badge ${getStatusColor(task.status)} rounded-pill px-2 py-1`}>
                            {task.status || "Pending"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-end">
                          <motion.button 
                            className="btn btn-sm btn-outline-danger" 
                            onClick={(e) => handleDeleteTask(task._id, e)}
                            aria-label="Delete task"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="card-footer bg-white border-top-0 d-flex justify-content-between align-items-center p-3">
              <div className="text-muted small">
                Showing {indexOfFirstTask + 1}-{Math.min(indexOfLastTask, filteredTasks.length)} of {filteredTasks.length} tasks
              </div>
              <nav aria-label="Page navigation">
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>
                  
                  {getPageNumbers().map(number => (
                    <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => paginate(number)}
                      >
                        {number}
                      </button>
                    </li>
                  ))}
                  
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </motion.div>
        )}
      </motion.div>
      
      {/* CSS for notifications */}
      <style>{`
        .notification-success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
          border-radius: 8px;
          padding: 15px 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          animation: fadeInOut 3s ease-in-out;
        }
        
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-20px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
        
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default TasksManagement;