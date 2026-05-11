import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { server } from './mocks/server';

// Mock das variáveis de ambiente do Supabase
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';

// Mock global do Supabase Client
vi.mock('@supabase/supabase-js', () => ({
    createClient: () => ({
        auth: {
            signUp: vi.fn().mockResolvedValue({
                data: { user: { id: 'mock-supabase-id' } },
                error: null,
            }),
            signInWithPassword: vi.fn().mockResolvedValue({
                data: { user: { id: 'mock-supabase-id' } },
                error: null,
            }),
        },
    }),
}));

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());