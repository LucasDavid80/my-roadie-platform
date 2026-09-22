import React from 'react';

export default function TermosPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Termos de Uso e Política de Privacidade</h1>
      
      <p className="mb-4">
        <strong>Última atualização:</strong> 20 de Setembro de 2026
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Termos de Uso</h2>
        <p className="mb-4">
          Bem-vindo ao My Roadie. Ao acessar e utilizar nossa plataforma, você concorda em cumprir e respeitar estes Termos de Uso.
          Nossa plataforma é destinada a facilitar a organização de músicos e equipes técnicas.
        </p>
        <p className="mb-4">
          O uso indevido da plataforma, tentativas de fraude ou violação dos direitos de terceiros poderão resultar
          no bloqueio ou exclusão imediata da sua conta.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Política de Privacidade</h2>
        <p className="mb-4">
          A sua privacidade é importante para nós. Coletamos e utilizamos seus dados pessoais estritamente para o 
          funcionamento da plataforma My Roadie, incluindo dados de contato, agenda e informações financeiras atreladas à sua conta.
        </p>
        <p className="mb-4">
          <strong>Uso de dados:</strong> Seus dados não são vendidos para terceiros. Eles são utilizados exclusivamente
          para viabilizar a comunicação e organização entre os membros da sua banda e equipe.
        </p>
        <p className="mb-4">
          <strong>Segurança:</strong> Implementamos medidas rigorosas de segurança para proteger suas informações pessoais. 
          O acesso a áreas sensíveis, como o módulo financeiro, é restrito e requer autenticação adequada.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Contato e LGPD</h2>
        <p className="mb-4">
          Para dúvidas, solicitações de exclusão de conta, exportação de dados ou qualquer assunto relacionado à 
          Lei Geral de Proteção de Dados (LGPD), entre em contato através do nosso canal oficial de suporte.
        </p>
      </section>
    </div>
  );
}
