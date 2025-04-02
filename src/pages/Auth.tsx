import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerAPI, loginAPI, } from '../services/allApi';
import { AxiosResponse, AxiosError } from 'axios';

interface AuthProps {
  insideRegister: boolean;
}

interface InputData {
  username: string;
  email: string;
  password: string;
}

// interface GoogleLoginProps {
//   onSuccess?: () => void;
// }


const Auth: React.FC<AuthProps> = ({ insideRegister }) => {
  const [inputData, setInputData] = useState<InputData>({
    username: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();


  const handleGoogleLogin = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
  
    // Check if a token already exists
    const existingToken = sessionStorage.getItem("token");
  
    if (existingToken) {
      console.log("User already authenticated, no need to redirect.");
      return; // Prevent unnecessary redirection
    }
  
    console.log("Redirecting to Google auth...");
    window.location.href = "http://localhost:3000/auth/google";
  };
  

  
  // const handleGoogleLogin = (e: React.MouseEvent<HTMLButtonElement>): void => {
  //   // Prevent default if this is attached to a form or link
  //   if (e) e.preventDefault();
    
  //   console.log("Redirecting to Google auth...");
  //   window.location.href = "http://localhost:3000/auth/google";
  // };
  // Handle registration
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (inputData.email && inputData.password && inputData.username) {
      try {
        const response = await registerAPI(inputData);
        if (response.status === 200) {
          alert(`Registration successful for ${inputData.username}`);
          setInputData({ username: "", email: "", password: "" });
          navigate('/login');
        } else {
          alert('Registration failed. Please try again.');
        }
      } catch (error) {
        alert('An error occurred during registration. Please try again.');
      }
    } else {
      alert("Please fill the form completely!");
    }
  };

  // Handle login
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (inputData.email && inputData.password) {
      try {
        const response = await loginAPI(inputData);
  
        if ((response as AxiosResponse).status === 200) {
          const axiosResponse = response as AxiosResponse;
  
          sessionStorage.setItem('user', JSON.stringify({
            email: inputData.email,
            username: axiosResponse.data.username || inputData.username,
          }));
  
          sessionStorage.setItem('token', axiosResponse.data.token);
  
          alert(`Login successful for ${inputData.email}`);
          setInputData({ username: "", email: "", password: "" });
          navigate('/tasks');
        } else {
          alert('Login failed. Please check your credentials.');
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          alert(`An error occurred during login: ${error.message}`);
        } else {
          alert('An unexpected error occurred. Please try again.');
        }
      }
    } else {
      alert("Please fill the form completely!");
    }
  };


  



  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 bg-gradient-primary">
      <div className="card shadow-lg p-4 w-100 w-md-75 w-lg-50">
        <div className="row g-0">
          <div className="col-md-6">
            <img
              className="img-fluid rounded-start"
              src="https://img.freepik.com/premium-vector/account-login-password-laptop-screen-data-protection-cyber-security-online-registration_501813-2098.jpg?w=900"
              alt="Authentication"
            />
          </div>
          <div className="col-md-6 d-flex flex-column justify-content-center">
            <div className="card-body">
              <h1 className="card-title text-center fs-3 fw-bold text-dark mb-4">
                <i className="fas fa-user-circle"></i> Task Management
              </h1>
              <h5 className="text-center text-secondary mb-4">Sign {insideRegister ? "Up" : "In"} to Your Account</h5>
              <form>
                {insideRegister && (
                  <div className="mb-3">
                    <label className="form-label" htmlFor="username">Username</label>
                    <input
                      className="form-control"
                      value={inputData.username}
                      onChange={(e) => setInputData({ ...inputData, username: e.target.value })}
                      id="username"
                      type="text"
                      placeholder="Username"
                    />
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label" htmlFor="email">Email Address</label>
                  <input
                    className="form-control"
                    value={inputData.email}
                    onChange={(e) => setInputData({ ...inputData, email: e.target.value })}
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label" htmlFor="password">Password</label>
                  <input
                    className="form-control"
                    value={inputData.password}
                    onChange={(e) => setInputData({ ...inputData, password: e.target.value })}
                    id="password"
                    type="password"
                    placeholder="Password"
                  />
                </div>
                <div className="d-flex justify-content-between align-items-center flex-column flex-md-row">
                  {insideRegister ? (
                    <>
                      <button
                        onClick={handleRegister}
                        className="btn btn-primary mb-3 mb-md-0"
                      >
                        Register
                      </button>
                      <p className="text-sm mt-3 text-center text-md-start">
                        Already a User? <Link to="/login" className="text-primary">Login</Link>
                      </p>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleLogin}
                        className="btn btn-primary mb-3 mb-md-0"
                      >
                        Login
                      </button>
                      <button 
                        onClick={handleGoogleLogin} 
                        className="btn btn-outline-primary mt-4 mb-3 mb-md-0"
                      >
                        Sign in with Google
                      </button>
                      <p className="text-sm mt-3 text-center text-md-start">
                        Don't have an account? <Link to="/register" className="text-primary">Register</Link>
                      </p>
                    </>
                  )}
                  <Link to="/" className="text-sm text-primary mt-3 mt-md-0 float-md-end">
                    Go Back to Home
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;


