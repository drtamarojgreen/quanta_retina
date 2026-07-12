import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Login from './Login';

vi.mock('../services/api', () => ({
    login: vi.fn(),
    registerUser: vi.fn()
}));

describe('Login Component', () => {
    it('renders login form by default', () => {
        render(<Login onLogin={() => {}} />);
        expect(screen.getByLabelText(/Enter User Code/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
    });

    it('switches to registration form', () => {
        render(<Login onLogin={() => {}} />);
        fireEvent.click(screen.getByText(/No code\? Register here/i));
        expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Registration Token/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
    });
});
