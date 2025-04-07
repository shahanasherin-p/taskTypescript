import React, { useState, useEffect } from 'react';
import { Trash2, Users, Search, Filter } from 'lucide-react';
import Sidebar from './Sidebar';
import { deleteUserAPI, getUsersAPI } from '../services/allApi';
import { AxiosResponse, AxiosError } from 'axios';
import { motion } from 'framer-motion';
import { Form, Button, Card, Badge, Spinner, Alert, InputGroup } from 'react-bootstrap';

interface User {
  _id: string;
  id?: string;
  name?: string;
  username?: string;
  email: string;
  role?: string;
  userType?: string;
}

// Interface for API error responses
interface ApiErrorResponse {
  message?: string;
  [key: string]: any;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const reqHeader = { Authorization: `Bearer ${sessionStorage.getItem("token")}` };
        const response: AxiosResponse | AxiosError = await getUsersAPI(reqHeader);

        if ('data' in response) {
          setUsers(response.data);
        } else {
          throw new Error("Failed to fetch users");
        }
      } catch (err: any) {
        // Fixed error handling
        let errorMessage = "An error occurred while fetching users";
        
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
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this user?')) {
      const token = sessionStorage.getItem("token");
      if (token) {
        const reqHeader = { Authorization: `Bearer ${token}` };
        try {
          const result = await deleteUserAPI(id, reqHeader);
          if (result.status === 200) {
            setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));
            alert('User deleted successfully');
          } else {
            alert('Failed to delete user');
          }
        } catch (err) {
          alert('Error deleting user');
        }
      }
    }
  };



  // Animation variants for framer-motion
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
    visible: { y: 0, opacity: 1 }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Role badge color mapping
  const getRoleBadgeVariant = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'danger';
      case 'moderator':
        return 'warning';
      case 'editor':
        return 'info';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="d-flex flex-column flex-md-row min-vh-100 bg-light mt-5 py-5">
      <div className={`${isMobile ? 'w-100' : 'col-md-3 col-lg-2'}`}>
        <Sidebar />
      </div>
      <motion.div 
        className="flex-grow-1 p-3 p-md-4 overflow-hidden"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-sm border-0 mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center">
                <Users size={24} className="text-primary me-2" />
                <h1 className="h3 fw-bold m-0">User Management</h1>
              </div>
            </div>
            
            <InputGroup className="mb-3">
              <InputGroup.Text>
                <Search size={16} />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setSearchTerm('')}
                >
                  Clear
                </Button>
              )}
            </InputGroup>
          </Card.Body>
        </Card>

        {isLoading ? (
          <motion.div 
            className="text-center py-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Loading users...</p>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert variant="danger">
              <div className="d-flex align-items-center">
                <span className="me-2">❌</span>
                <span>{error}</span>
              </div>
            </Alert>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="card shadow-sm border-0"
          >
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-3">ID</th>
                    <th className="px-3">Name</th>
                    <th className="px-3">Email</th>
                    <th className="px-3">Role</th>
                    <th className="px-3 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted">
                        {searchTerm ? 'No users matching your search' : 'No users found'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, index) => (
                      <motion.tr
                        key={user._id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.05 }}
                        className="align-middle"
                        whileHover={{ backgroundColor: 'rgba(0,0,0,0.03)' }}
                      >
                        <td className="px-3 text-truncate" style={{ maxWidth: '150px' }}>
                          <span className="text-muted small">{user._id}</span>
                        </td>
                        <td className="px-3 fw-medium">
                          {user.name || user.username || 'N/A'}
                        </td>
                        <td className="px-3">
                          <a href={`mailto:${user.email}`} className="text-decoration-none">
                            {user.email}
                          </a>
                        </td>
                        <td className="px-3">
                          <Badge bg={getRoleBadgeVariant(user.role)}>
                            {user.role || "User"}
                          </Badge>
                        </td>
                        <td className="px-3 text-end">
                          <motion.button 
                            className="btn btn-sm btn-outline-danger" 
                            onClick={(e) => handleDeleteUser(user._id, e)}
                            aria-label="Delete user"
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
            <Card.Footer className="bg-white border-top-0 d-flex justify-content-between align-items-center py-3">
              <span className="text-muted small">
                Showing {filteredUsers.length} of {users.length} users
              </span>
              <div className="d-flex align-items-center">
                <Filter size={14} className="text-muted me-1" />
                <span className="text-muted small">
                  Filter options
                </span>
              </div>
            </Card.Footer>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default UserManagement;