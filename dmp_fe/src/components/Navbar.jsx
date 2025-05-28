import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from '../services/api';

function Navbar() {
    const navigate = useNavigate();
    const isAuthenticated = !!localStorage.getItem('accessToken');

    const handleLogout = () => {
        logoutUser();
        navigate('/login');
    };

    return (
        <nav>
            <Link to="/"><h1 style={{color: "white"}}>DocAI Portal</h1></Link>
            <div>
                {!isAuthenticated ? (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/signup">Sign Up</Link>
                    </>
                ) : (
                    <>
                        <Link to="/dashboard">Dashboard</Link>
                        <button onClick={handleLogout}>Logout</button>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;