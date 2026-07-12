import React, { useState } from 'react';
import { login as loginApi, registerUser } from '../services/api';

const Login = ({ onLogin }) => {
    const [userCode, setUserCode] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState('');
    const [regToken, setRegToken] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const data = await loginApi(userCode);
            onLogin(data);
        } catch (err) {
            setError('Invalid user code. Please try again.');
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        try {
            const data = await registerUser(username, regToken);
            setSuccessMessage(`Registered! Your login code is: ${data.user_code}`);
            setUserCode(data.user_code);
            setIsRegistering(false);
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600">PrismQuanta Chat</h2>

                {isRegistering ? (
                    <form onSubmit={handleRegisterSubmit}>
                        <h3 className="text-lg font-semibold mb-4">Register New User</h3>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="regToken">
                                Registration Token
                            </label>
                            <input
                                id="regToken"
                                type="text"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="tjg_web_services"
                                value={regToken}
                                onChange={(e) => setRegToken(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                        <div className="flex flex-col space-y-4">
                            <button
                                type="submit"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded w-full focus:outline-none focus:shadow-outline transition duration-200"
                            >
                                Register
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsRegistering(false)}
                                className="text-sm text-indigo-600 hover:underline text-center"
                            >
                                Back to Login
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleLoginSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="userCode">
                                Enter User Code
                            </label>
                            <input
                                id="userCode"
                                type="text"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="TJG-XXXX-XXXX"
                                value={userCode}
                                onChange={(e) => setUserCode(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                        {successMessage && <p className="text-green-600 text-sm font-bold mb-4">{successMessage}</p>}
                        <div className="flex flex-col space-y-4">
                            <button
                                type="submit"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded w-full focus:outline-none focus:shadow-outline transition duration-200"
                            >
                                Login
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsRegistering(true)}
                                className="text-sm text-indigo-600 hover:underline text-center"
                            >
                                No code? Register here
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
