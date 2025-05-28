import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { loginUser } from '../services/api';

function LoginPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (credentials) => {
        setLoading(true);
        setError('');
        try {
            const response = await loginUser(credentials);
            // Token storage is handled by api.js interceptor/functions now
            if (response.data.access) {
                navigate('/dashboard');
            } else {
                setError(response.data.detail || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. An error occurred.');
            console.error("Login error:", err);
        }
        setLoading(false);
    };

    return (
        <div className="container">
            <h2>Login</h2>
            <AuthForm onSubmit={handleLogin} loading={loading} error={error} />
            <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
        </div>
    );
}

export default LoginPage;