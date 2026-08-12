import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService } from './user-service';
import { RegisterFormData } from '@/components/features/auth/register-schema';

vi.mock('./api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

// supabase is mocked by src/test/setup.ts via createClient

describe('userService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('signUp - success path creates user in backend after supabase signup', async () => {
    const { api } = await import('./api');
    // mock supabase via imported module used in user-service (setup.ts provides default mock)
    const { supabase } = await import('@/lib/supabase');
    // ensure supabase.signUp returns valid user
    supabase.auth.signUp = vi.fn().mockResolvedValue({ data: { user: { id: 'supabase-id' } }, error: null });

    vi.mocked(api.post).mockResolvedValue({ data: { id: 'created-user', name: 'Bob' } });

    const signUpPayload: RegisterFormData = { email: 'a@b.com', password: 'pass', confirmPassword: 'pass', name: 'Bob', role: 'MUSICIAN' };
    const result = await userService.signUp(signUpPayload);
    expect(result).toEqual({ id: 'created-user', name: 'Bob' });
    expect(api.post).toHaveBeenCalledWith('/users', expect.objectContaining({ supabaseId: 'supabase-id' }));
  });

  it('signUp - throws if supabase returns error', async () => {
    const { supabase } = await import('@/lib/supabase');
    supabase.auth.signUp = vi.fn().mockResolvedValue({ data: null, error: { message: 'already exists' } });

    const signUpPayload: RegisterFormData = { email: 'x', password: 'y', confirmPassword: 'y', name: 'n', role: 'MUSICIAN' };
    await expect(userService.signUp(signUpPayload)).rejects.toThrow('already exists');
  });

  it('create/getAll/getById/update/delete basic flows', async () => {
    const { api } = await import('./api');
    vi.mocked(api.post).mockResolvedValue({ data: { id: 'u1' } });
    vi.mocked(api.get).mockResolvedValueOnce({ data: [{ id: 'u1' }] }).mockResolvedValueOnce({ data: { id: 'u1' } });
    vi.mocked(api.patch).mockResolvedValue({ data: { id: 'u1', name: 'Updated' } });
    vi.mocked(api.delete).mockResolvedValue({});

    const created = await userService.create({ name: 'x' });
    expect(created).toEqual({ id: 'u1' });

    const all = await userService.getAll();
    expect(all).toEqual([{ id: 'u1' }]);

    const one = await userService.getById('u1');
    expect(one).toEqual({ id: 'u1' });

    const updated = await userService.update('u1', { name: 'Updated' });
    expect(updated).toEqual({ id: 'u1', name: 'Updated' });

    await expect(userService.delete('u1')).resolves.toBeUndefined();

    expect(api.post).toHaveBeenCalled();
    expect(api.get).toHaveBeenCalled();
    expect(api.patch).toHaveBeenCalled();
    expect(api.delete).toHaveBeenCalledWith('/users/u1');
  });
});

