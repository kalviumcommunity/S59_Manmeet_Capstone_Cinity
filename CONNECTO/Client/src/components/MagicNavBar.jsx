import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './MagicNavBar.css';
import Logo from "../assets/LOGO.png";

const NavBar = () => {
  const [profilePicture, setProfilePicture] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInitial, setUserInitial] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/user', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const user = await response.json();
          if (user.profilePicture) {
            setProfilePicture(user.profilePicture);
          } else {
            setUserInitial(user.name.charAt(0));
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
    <nav className="navbar">
      <div className="navbar-brand">
        <img className='logo' src={Logo} alt="Connecto Logo" />
      </div>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/services">Services</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        <li><Link to="/profile">Profile</Link></li>
      </ul>
      <div className="navbar-login">
        {isLoggedIn ? (
          profilePicture ? (
            <img src={profilePicture} alt="User Profile" className="profile-picture" />
          ) : (
            <div className="user-initial">{userInitial}</div>
          )
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
