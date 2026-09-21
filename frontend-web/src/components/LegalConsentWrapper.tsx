'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { LegalConsentModal } from './LegalConsentModal';

export function LegalConsentWrapper({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, fetchProfile } = useAuth();
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/legal/current-version')
        .then((response) => {
          if (response.data?.version) {
            setCurrentVersion(response.data.version);
          }
        })
        .catch((error) => {
          console.error('Erro ao buscar versão atual dos termos legais:', error);
        });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && currentVersion) {
      const userVersion = user?.termsAcceptedVersion;
      // Compara a versão do usuário com a versão atual em vigor
      if (!userVersion || userVersion < currentVersion) {
        setIsModalOpen(true);
      } else {
        setIsModalOpen(false);
      }
    } else {
      setIsModalOpen(false);
    }
  }, [isAuthenticated, currentVersion, user]);

  const handleAccept = async () => {
    if (!currentVersion) return;
    
    setIsLoading(true);
    try {
      await api.post('/users/me/consent', { termsVersion: currentVersion });
      await fetchProfile(); // Atualiza o state global do usuário para refletir a nova versão
    } catch (error) {
      console.error('Erro ao aceitar os termos:', error);
      alert('Ocorreu um erro ao tentar aceitar os termos. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {children}
      <LegalConsentModal 
        isOpen={isModalOpen}
        isLoading={isLoading}
        onAccept={handleAccept}
      />
    </>
  );
}
