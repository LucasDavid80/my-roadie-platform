'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { LegalConsentModal } from './LegalConsentModal';

export function LegalConsentWrapper({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <>
      {children}
      <LegalConsentModal 
        isOpen={isModalOpen}
        onAccept={() => {
          // A lógica do botão de aceite será implementada na T2.4
          console.log('Aceite pendente na T2.4');
        }}
      />
    </>
  );
}
