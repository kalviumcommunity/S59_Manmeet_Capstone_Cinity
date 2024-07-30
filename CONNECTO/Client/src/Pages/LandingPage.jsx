import React from 'react';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
       <header>
       <a href="/login" className="login-button">Login</a>
      </header>
      <div className="center-content">
        <h1>WELCOME TO CONNECTO</h1>
        <h2>Connecting you to the knowledge and connections you need</h2>
      </div>
    </div>
  );
};

export default LandingPage;
