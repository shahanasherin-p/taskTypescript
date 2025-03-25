import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-info py-5">
        <div className="container text-center">
          <h1 className="display-4 text-white mb-4">
            Organize Your Life, One Task at a Time
          </h1>
          <p className="lead text-white mb-4">
            Take control of your tasks with our intuitive task management app.
          </p>
          <Link to="/login">
            <button className="btn btn-light btn-lg shadow-lg">
              Get Started
            </button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-light py-5">
        <div className="container text-center">
          <h2 className="h2 mb-5">Features</h2>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
            <div className="col">
              <div className="card shadow-sm border-light">
                <div className="card-body">
                  <h5 className="card-title text-primary">Track Progress</h5>
                  <p className="card-text">
                    Monitor the status and progress of your tasks in real-time.
                  </p>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card shadow-sm border-light">
                <div className="card-body">
                  <h5 className="card-title text-success">Set Reminders</h5>
                  <p className="card-text">
                    Never miss a deadline with customizable reminders.
                  </p>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card shadow-sm border-light">
                <div className="card-body">
                  <h5 className="card-title text-purple">Manage Tasks</h5>
                  <p className="card-text">
                    Add, update, and delete tasks effortlessly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
