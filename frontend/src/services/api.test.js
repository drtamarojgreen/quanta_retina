import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login, registerUser } from './api';
import axios from 'axios';

vi.mock('axios', () => {
    const mockAxios = {
        create: vi.fn(() => mockAxios),
        post: vi.fn(),
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        interceptors: {
            request: { use: vi.fn(), eject: vi.fn() },
            response: { use: vi.fn(), eject: vi.fn() }
        }
    };
    return { default: mockAxios };
});

describe('API Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('login calls the correct endpoint', async () => {
        const mockData = { user_id: 1, username: 'test', token: 'token-1' };
        axios.post.mockResolvedValue({ data: mockData });

        const result = await login('TJG-1234-5678');
        expect(axios.post).toHaveBeenCalledWith('/login', { user_code: 'TJG-1234-5678' });
        expect(result).toEqual(mockData);
    });

    it('registerUser calls the correct endpoint', async () => {
        const mockData = { user_id: 1, username: 'test', user_code: 'TJG-1234-5678' };
        axios.post.mockResolvedValue({ data: mockData });

        const result = await registerUser('test', 'tjg_web_services');
        expect(axios.post).toHaveBeenCalledWith('/users', { username: 'test', registration_token: 'tjg_web_services' });
        expect(result).toEqual(mockData);
    });
});
