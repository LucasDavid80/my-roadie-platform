import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LegalConsentModal } from './LegalConsentModal';

describe('LegalConsentModal', () => {
  it('não deve renderizar se isOpen for false', () => {
    render(<LegalConsentModal isOpen={false} onAccept={vi.fn()} />);
    expect(screen.queryByText('Atualização dos Termos')).not.toBeInTheDocument();
  });

  it('deve renderizar corretamente quando isOpen for true', () => {
    render(<LegalConsentModal isOpen={true} onAccept={vi.fn()} />);
    expect(screen.getByText('Atualização dos Termos')).toBeInTheDocument();
    expect(screen.getByText('Li e aceito os termos')).toBeInTheDocument();
  });

  it('deve chamar onAccept ao clicar no botão de aceite', () => {
    const onAcceptMock = vi.fn();
    render(<LegalConsentModal isOpen={true} onAccept={onAcceptMock} />);
    
    const button = screen.getByText('Li e aceito os termos');
    fireEvent.click(button);
    
    expect(onAcceptMock).toHaveBeenCalledTimes(1);
  });

  it('deve desabilitar o botão e mostrar texto de carregamento se isLoading for true', () => {
    render(<LegalConsentModal isOpen={true} onAccept={vi.fn()} isLoading={true} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Processando...');
  });
});
