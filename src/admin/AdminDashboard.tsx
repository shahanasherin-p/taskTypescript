import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { allTasksAPI, getUsersAPI } from '../services/allApi';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Users, FileCheck, Activity, ArrowUpRight } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

interface UserData {
  _id: string;
  name?: string;
  username?: string;
  email: string;
  role?: string;
}

interface TaskData {
  _id: string;
  title: string;
  author?: string;
  username?: string;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const token = sessionStorage.getItem('token');

      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const reqHeader = { Authorization: `Bearer ${token}` };
      let fetchErrors: string[] = [];

      try {
        // Fetch Users
        const usersResponse = await getUsersAPI(reqHeader);
        if (usersResponse && usersResponse.data) {
          setUsers(usersResponse.data as UserData[]);
        } else {
          fetchErrors.push("Users response is not in the expected format");
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          fetchErrors.push(`Failed to load users: ${error.response.data?.message || error.message}`);
        } else {
          fetchErrors.push(`Failed to load users: Unknown error`);
        }
      }

      try {
        // Fetch Tasks
        const tasksResponse = await allTasksAPI(reqHeader);
        if (tasksResponse && tasksResponse.data) {
          setTasks(tasksResponse.data.map(task => ({
            _id: task._id || '',
            title: task.title || 'Untitled',
            username: task.username || '',
            createdAt: task.createdAt || new Date().toISOString(),
          })));
        } else {
          fetchErrors.push("Tasks response is not in the expected format");
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          fetchErrors.push(`Failed to load tasks: ${error.response.data?.message || error.message}`);
        } else {
          fetchErrors.push(`Failed to load tasks: Unknown error`);
        }
      }

      if (fetchErrors.length > 0) {
        setError(fetchErrors.join('; '));
      }
      setLoading(false);
    };

    fetchData();
  }, []);

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

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="d-flex min-vh-100 mt-5" style={{ backgroundColor: "#f8f9fa" }}>
        <Sidebar />
      <div className="d-flex flex-column flex-grow-1 overflow-hidden">
        <main className="flex-grow-1 overflow-auto p-4" style={{ backgroundColor: "#f8f9fa" }}>
          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
              <motion.div
                animate={{
                  rotate: 360
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <Activity size={32} className="text-primary" />
              </motion.div>
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="alert alert-danger shadow-sm" 
              role="alert"
            >
              {error}
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="container-fluid px-0"
            >
              <motion.div variants={itemVariants} className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">Dashboard Overview</h2>
                <div className="d-flex gap-2">
                  <button className="btn btn-primary d-flex align-items-center gap-2">
                    <span>Refresh</span>
                    <ArrowUpRight size={18} />
                  </button>
                </div>
              </motion.div>

              <motion.div 
                variants={containerVariants} 
                className="row g-4 mb-4"
              >
                <div className="col-12 col-md-6 col-lg-3">
                  <motion.div 
                    variants={itemVariants}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="card border-0 shadow-sm h-100"
                  >
                    <div className="card-body d-flex flex-column align-items-center p-4">
                      <div className="rounded-circle bg-primary bg-opacity-10 p-3 mb-3">
                        <Users size={24} className="text-primary" />
                      </div>
                      <h5 className="fw-bold text-center mb-1">Total Users</h5>
                      <p className="display-5 fw-bold mb-0 text-primary">{users.length}</p>
                      <div className="small text-muted mt-2">
                        Active accounts in system
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                <div className="col-12 col-md-6 col-lg-3">
                  <motion.div 
                    variants={itemVariants}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="card border-0 shadow-sm h-100"
                  >
                    <div className="card-body d-flex flex-column align-items-center p-4">
                      <div className="rounded-circle bg-success bg-opacity-10 p-3 mb-3">
                        <FileCheck size={24} className="text-success" />
                      </div>
                      <h5 className="fw-bold text-center mb-1">Total Tasks</h5>
                      <p className="display-5 fw-bold mb-0 text-success">{tasks.length}</p>
                      <div className="small text-muted mt-2">
                        Tasks in database
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                <div className="col-12 col-md-6 col-lg-3">
                  <motion.div 
                    variants={itemVariants}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="card border-0 shadow-sm h-100"
                  >
                    <div className="card-body d-flex flex-column align-items-center p-4">
                      <div className="rounded-circle bg-warning bg-opacity-10 p-3 mb-3">
                        <Activity size={24} className="text-warning" />
                      </div>
                      <h5 className="fw-bold text-center mb-1">Recent Activity</h5>
                      <p className="display-5 fw-bold mb-0 text-warning">24</p>
                      <div className="small text-muted mt-2">
                        Actions in last 24h
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                <div className="col-12 col-md-6 col-lg-3">
                  <motion.div 
                    variants={itemVariants}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="card border-0 shadow-sm h-100" 
                  >
                    <div className="card-body d-flex flex-column align-items-center p-4">
                      <div className="rounded-circle bg-info bg-opacity-10 p-3 mb-3">
                        <ArrowUpRight size={24} className="text-info" />
                      </div>
                      <h5 className="fw-bold text-center mb-1">System Status</h5>
                      <p className="display-5 fw-bold mb-0 text-info">100%</p>
                      <div className="small text-muted mt-2">
                        All systems operational
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="row g-4"
              >
                <div className="col-12 col-lg-8">
                  <motion.div 
                    variants={itemVariants}
                    className="card border-0 shadow-sm"
                  >
                    <div className="card-header bg-white py-3 border-0">
                      <h5 className="mb-0 fw-bold">Recent Activity</h5>
                    </div>
                    <div className="card-body p-0">
                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>Task</th>
                              <th>Created</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tasks.slice(0, 5).map((task, index) => (
                              <motion.tr 
                                key={task._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                <td>{task.title}</td>
                                <td>{new Date(task.createdAt).toLocaleDateString()}</td>
                              </motion.tr>
                            ))}
                            {tasks.length === 0 && (
                              <tr>
                                <td colSpan={3} className="text-center py-4 text-muted">
                                  No tasks available
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                <div className="col-12 col-lg-4">
                  <motion.div 
                    variants={itemVariants}
                    className="card border-0 shadow-sm"
                  >
                    <div className="card-header bg-white py-3 border-0">
                      <h5 className="mb-0 fw-bold">User Overview</h5>
                    </div>
                    <div className="card-body">
                      <div className="d-flex flex-column gap-3">
                        {users.slice(0, 5).map((user, index) => (
                          <motion.div 
                            key={user._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="d-flex align-items-center p-2 border-bottom"
                          >
                            <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                              <Users size={16} className="text-primary" />
                            </div>
                            <div>
                              <div className="fw-medium">{user.name || user.username || 'Unknown'}</div>
                              <div className="small text-muted">{user.email}</div>
                            </div>
                            <div className="ms-auto">
                              <span className="badge bg-light text-dark">{user.role || 'User'}</span>
                            </div>
                          </motion.div>
                        ))}
                        {users.length === 0 && (
                          <div className="text-center py-4 text-muted">
                            No users available
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;