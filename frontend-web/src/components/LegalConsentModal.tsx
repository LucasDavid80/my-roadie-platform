import React from 'react';
import Link from 'next/link';

export interface LegalConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  isLoading?: boolean;
}

export function LegalConsentModal({ isOpen, onAccept, isLoading = false }: LegalConsentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 m-4 relative">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Atualização dos Termos</h2>
        
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
          Atualizamos nossos <strong>Termos de Uso</strong> e <strong>Política de Privacidade</strong>.
          Para continuar utilizando a plataforma My Roadie, você precisa ler e aceitar as novas condições.
        </p>

        <div className="bg-gray-50 p-4 rounded-md mb-6 border border-gray-200 text-sm">
          <ul className="list-disc pl-5 text-gray-700 space-y-2">
            <li>
              Leia nossos <Link href="/termos" target="_blank" className="text-blue-600 hover:underline font-medium">Termos de Uso e Política de Privacidade</Link>.
            </li>
            <li>O uso da plataforma está condicionado a este aceite.</li>
          </ul>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onAccept}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md font-medium text-white transition-colors
              ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
            `}
          >
            {isLoading ? 'Processando...' : 'Li e aceito os termos'}
          </button>
        </div>
      </div>
    </div>
  );
}
