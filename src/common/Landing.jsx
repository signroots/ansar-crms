import React from 'react';
import { Link } from 'react-router-dom';

function Landing()
{
  return (
    <div
      className="container-fluid d-flex flex-column justify-content-center align-items-center vh-100"
      style={{
        background: 'linear-gradient(to right,rgb(181, 112, 255),rgb(114, 166, 255))', // Gradient background
      }}
    >
      {/* Heading Section */}
      <div className="text-center mb-5">
        <h1 className="display-3 text-white mb-3" style={{ fontWeight: '00' }}>
          Welcome to Ansar
        </h1>
        <p className="lead text-white-50 mb-1 fs-6">
          The App is under development. We appreciate your patience!
        </p>
      </div>

      {/* Action Buttons Section */}
      <div className="d-flex flex-column align-items-center w-75 w-md-50 w-lg-25">

        <img
          src="https://icons.veryicon.com/png/o/miscellaneous/two-color-icon-library/user-286.png"
          className="img-fluid mb-4"
          alt="User Icon"
          style={{ maxWidth: '100px' }}
        />

        <Link
          to="/user/user-login"
          className="btn btn-outline-light btn-lg w-50 mt-5"
          style={{
            borderRadius: '50px', // Rounded corners
          }}
        >
          User Login
        </Link>

        <hr className="w-100 text-light mt-5" />

        <Link
          to="/admin/auth"
          className=" btn-lg w-100 text-decoration-none text-center mt-3"
          style={{
            fontSize: '13px',
          }}
        >
          <span className="text-light">Are you an admin?</span> Admin Login
        </Link>
      </div>

      {/* Footer Section */}
      <footer className="mt-5 text-center text-white-50">
        <small>© 2024 signrOots. All rights reserved.</small>
      </footer>
    </div>
  );
}

export default Landing;
