import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Mock } from 'vitest';
import { render, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { api } from '@/services/api';

// Mock do axios/api
vi.mock('@/services/api', () => ({
    api: {
        post: vi.fn(),
    },
}));

// Componente de teste para consumir o hook
function TestComponent() {
    const { user, signIn, signOut, isAuthenticated } = useAuth();
    return (
        <div>
            <div data-testid="user">{user?.name}</div>
            <div data-testid="auth">{isAuthenticated.toString()}</div>
            <button onClick={() => signIn({ email: 'test@test.com' })}>Login</button>
            <button onClick={signOut}>Logout</button>
        </div>
    );
}

describe('AuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('deve iniciar não autenticado', () => {
        const { getByTestId } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(getByTestId('auth').textContent).toBe('false');
    });

    it('deve realizar login e salvar no localStorage', async () => {
        const mockResponse = {
            data: {
                access_token: 'token-123',
                user: { id: '1', name: 'Test User', email: 'test@test.com', role: 'ADMIN' }
            }
        };
        (api.post as Mock).mockResolvedValue(mockResponse);

        const { getByTestId, getByText } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await act(async () => {
            getByText('Login').click();
        });

        expect(getByTestId('auth').textContent).toBe('true');
        expect(getByTestId('user').textContent).toBe('Test User');
        expect(localStorage.getItem('@MyRoadie:token')).toBe('token-123');
    });

    it('deve realizar logout e limpar o localStorage', async () => {
        localStorage.setItem('@MyRoadie:user', JSON.stringify({ id: '1', name: 'User' }));
        localStorage.setItem('@MyRoadie:token', 'token');

        const { getByTestId, getByText } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await act(async () => {
            getByText('Logout').click();
        });

        expect(getByTestId('auth').textContent).toBe('false');
        expect(localStorage.getItem('@MyRoadie:token')).toBeNull();
    });
});
