import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { registerUser } from '../services/api';

function SignupPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignup = async (userData) => {
        setLoading(true);
        setError('');
        try {
            const response = await registerUser(userData);
            if (response.data.access) {
                navigate('/dashboard');
            } else {
                setError(response.data.detail || Object.values(response.data).join(', ') || 'Signup failed.');
            }
        } catch (err) {
            let errorMessage = 'Signup failed. An error occurred.';
            if (err.response && err.response.data) {
                const errors = err.response.data;
                errorMessage = Object.keys(errors)
                    .map(key => `${key}: ${errors[key].join ? errors[key].join(', ') : errors[key]}`)
                    .join(' | ');
            }
            setError(errorMessage);
            console.error("Signup error:", err.response?.data || err);
        }
        setLoading(false);
    };

    return (
        <div className="container">
            <h2>Sign Up</h2>
            <AuthForm onSubmit={handleSignup} isRegister={true} loading={loading} error={error} />
            <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
    );
}

export default SignupPage;