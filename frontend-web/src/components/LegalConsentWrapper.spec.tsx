import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LegalConsentWrapper } from './LegalConsentWrapper';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';

// Mocks
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('LegalConsentWrapper', () => {
  const fetchProfileMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('não deve exibir o modal se o usuário não estiver autenticado', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
      fetchProfile: fetchProfileMock,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <LegalConsentWrapper>
        <div>Conteúdo protegido</div>
      </LegalConsentWrapper>
    );

    expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument();
    expect(screen.queryByText('Atualização dos Termos')).not.toBeInTheDocument();
    expect(api.get).not.toHaveBeenCalled();
  });

  it('deve exibir o modal se autenticado e a versão aceita for nula', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { version: 'v1.0.0' } });
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { termsAcceptedVersion: null, role: 'MUSICIAN', id: '1', email: 'test@test.com', isAvailable: true, supabaseId: '1' },
      fetchProfile: fetchProfileMock,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <LegalConsentWrapper>
        <div>Conteúdo protegido</div>
      </LegalConsentWrapper>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/legal/current-version');
      expect(screen.getByText('Atualização dos Termos')).toBeInTheDocument();
    });
  });

  it('deve exibir o modal se autenticado e a versão aceita for anterior à vigente', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { version: 'v1.1.0' } });
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { termsAcceptedVersion: 'v1.0.0', role: 'MUSICIAN', id: '1', email: 'test@test.com', isAvailable: true, supabaseId: '1' },
      fetchProfile: fetchProfileMock,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <LegalConsentWrapper>
        <div>Conteúdo protegido</div>
      </LegalConsentWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Atualização dos Termos')).toBeInTheDocument();
    });
  });

  it('não deve exibir o modal se autenticado e versão for igual à vigente', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { version: 'v1.0.0' } });
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { termsAcceptedVersion: 'v1.0.0', role: 'MUSICIAN', id: '1', email: 'test@test.com', isAvailable: true, supabaseId: '1' },
      fetchProfile: fetchProfileMock,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <LegalConsentWrapper>
        <div>Conteúdo protegido</div>
      </LegalConsentWrapper>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/legal/current-version');
    });

    expect(screen.queryByText('Atualização dos Termos')).not.toBeInTheDocument();
  });

  it('deve chamar a API POST e fetchProfile ao aceitar os termos', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { version: 'v1.0.0' } });
    vi.mocked(api.post).mockResolvedValueOnce({});
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { termsAcceptedVersion: null, role: 'MUSICIAN', id: '1', email: 'test@test.com', isAvailable: true, supabaseId: '1' },
      fetchProfile: fetchProfileMock,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <LegalConsentWrapper>
        <div>Conteúdo protegido</div>
      </LegalConsentWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Li e aceito os termos')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Li e aceito os termos'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/users/me/consent', { termsVersion: 'v1.0.0' });
      expect(fetchProfileMock).toHaveBeenCalled();
    });
  });
});
