import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const [profilePicture, setProfilePicture] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInitial, setUserInitial] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/user', {
          method: 'GET',
          credentials: 'include', // Include credentials for CORS
        });

        if (response.ok) {
          const user = await response.json();
          if (user.profilePicture) {
            setProfilePicture(user.profilePicture);
          } else {
            setUserInitial(user.name.charAt(0)); // Set user initial if profile picture is not available
          }
          setIsLoggedIn(true);
        } else {
          setProfilePicture('');
          setUserInitial('');
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setProfilePicture('');
        setUserInitial('');
        setIsLoggedIn(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="landing-page">
      <header>
        {isLoggedIn ? (
          profilePicture ? (
            <img src={profilePicture} alt="User Profile" className="profile-picture" />
          ) : (
            <div className="user-initial">{userInitial}</div>
          )
        ) : (
          <a href="/login" className="login-button">Login</a>
        )}
      </header>
      <div className="center-content">
        <h1>WELCOME TO CONNECTO</h1>
        <h2>Connecting you to the knowledge and connections you need</h2>
      </div>
    </div>
  );
};

export default LandingPage;
