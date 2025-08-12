# PetManager Pro - Sistema de Gestão para Pet Shops

## Overview

PetManager Pro é uma plataforma profissional de gestão para pet shops no Brasil. O sistema foca no gerenciamento de pacotes de serviços, fidelização de clientes e automação de processos para otimizar as operações do pet shop. A aplicação oferece uma interface limpa e intuitiva para gerenciar pacotes de clientes, rastrear uso, monitorar renovações e manter relacionamentos com clientes.

O sistema foi projetado em torno da necessidade central de serviços baseados em pacotes, onde clientes compram conjuntos de serviços com períodos de validade específicos e limites de uso. O dashboard oferece insights acionáveis e ferramentas de automação para ajudar proprietários de pet shops a manter o engajamento dos clientes e reduzir a rotatividade.

### Versões do Sistema

**Versão 1.0 - Versão da Loja (Atual)**
- Desenvolvida especificamente para a Gloss Pet
- Sistema completo de gestão interna
- CRUD completo para todas as entidades
- Dashboard com métricas e insights
- Banco PostgreSQL totalmente funcional
- Interface administrativa profissional

**Versão 2.0 - Versão do Cliente (Planejada)**
- Portal do cliente para autoatendimento
- Agendamento online pelos próprios clientes
- Acompanhamento de pacotes em tempo real
- Histórico de serviços e pets
- Notificações automáticas por WhatsApp
- App mobile para clientes

O Gloss Pet é o primeiro cliente da plataforma PetManager Pro, servindo como caso de uso piloto e validação do sistema.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 2025)

- **Rebranding**: Sistema rebatizado de "Gloss Pet Dashboard" para "PetManager Pro"
- **Posicionamento**: Transformado em plataforma de gestão profissional para pet shops
- **Autenticação Simplificada**: Removida funcionalidade de registro, mantido apenas login admin/admin
- **Arquitetura Demo**: Sistema funciona independente do banco de dados para demonstração
- **Cliente Piloto**: Gloss Pet posicionado como primeiro cliente da plataforma PetManager Pro

### Latest Updates (January 11, 2025)
- **Dashboard Inteligente**: Implementada fila de ações inteligentes com insights acionáveis
- **Sistema de Suporte**: Nova aba de suporte com envio de emails para morningloryfox@gmail.com
- **Solicitações de Clientes**: Sistema para gerenciar feedbacks e mensagens dos clientes
- **Páginas Completas**: Agendamentos, Relatórios e Mensagens totalmente funcionais
- **Relatórios Avançados**: Página de relatórios com gráficos de receita, distribuição de serviços e crescimento
- **Banco PostgreSQL**: Sistema configurado com banco PostgreSQL do Replit funcionando perfeitamente
- **Dados Demo**: Empresa Gloss Pet, serviços e pacotes inseridos e funcionais
- **UI Melhorada**: Removido nome "Marina Silva" do footer, mantendo apenas ícone do usuário
- **Correções**: Resolvidos erros de TypeScript e compatibilidade de tipos
- **Autenticação Corrigida**: Resolvidos problemas de sessões e middleware de autenticação
- **Criação de Clientes Unificada**: Ambos os botões usam a mesma função enhanced modal
- **Migração PostgreSQL Completa**: Sistema totalmente migrado do armazenamento demo para PostgreSQL real
- **Validação de Campos Aprimorada**: Correção na validação de CEP e campos opcionais de endereço
- **UUID Real da Empresa**: Gloss Pet funcionando com UUID PostgreSQL: 550e8400-e29b-41d4-a716-446655440000
- **Formulário de Clientes Completo**: Todos os campos de endereço funcionando corretamente no PostgreSQL
- **Otimização de Código**: Limpeza abrangente de redundâncias
  - Storage.ts otimizado: 739 linhas (reduzido de 819)
  - Removidos modais duplicados e arquivos obsoletos
  - Simplificados métodos de CRUD
  - Mantidos apenas modais essenciais
- **Correções Críticas de Funcionalidade**:
  - **Criação de Pacotes**: Corrigido endpoint de /api/packages para /api/package-types
  - **Criação de Clientes**: Corrigida função de mutação no modal de clientes
  - **Persistência de Dados**: Todos os formulários agora salvam corretamente no PostgreSQL
  - **Validação**: Schemas e tipos alinhados entre frontend e backend

### Status Atual - Versão 1.0 (Versão da Loja)
- **CRUD Completo**: Clientes, Pets, Serviços, Tipos de Pacotes e Pacotes de Clientes
- **Dashboard Funcional**: Métricas, ações inteligentes, gráficos de receita
- **Relatórios**: Página completa com visualizações de dados
- **Sistema de Suporte**: Integração de email funcionando
- **Banco de Dados**: PostgreSQL totalmente funcional com dados reais
- **Interface**: Design responsivo e intuitivo com Radix UI + Tailwind
- **Autenticação**: Sistema seguro com sessões e middleware

### Roadmap - Próximas Fases

**Fase 2: Automação e Comunicação**
- Integração WhatsApp Business API para notificações automáticas
- Sistema de lembretes de vencimento de pacotes
- Notificações push para administradores
- Templates de mensagens personalizáveis
- Relatórios avançados com exportação PDF/Excel

**Fase 3: Portal do Cliente (Versão 2.0)**
- Interface dedicada para clientes
- Sistema de agendamento self-service
- Acompanhamento de pacotes em tempo real
- Histórico completo de serviços realizados
- Perfil de pets com fotos e informações
- Notificações automáticas por WhatsApp e email

**Fase 4: Expansão Multi-tenant**
- Plataforma completa para múltiplas empresas
- Sistema de assinatura e planos
- Isolamento total de dados por empresa
- Personalização de marca por cliente
- Dashboard de administração da plataforma

**Fase 5: Mobile e IA**
- App mobile nativo para clientes
- Sistema de recomendação inteligente
- Análise preditiva de churn
- Chatbot para atendimento automatizado
- Otimização de preços baseada em dados

## System Architecture

### Frontend Architecture
The client is built using React 18 with TypeScript, utilizing Vite as the build tool for fast development and optimized production builds. The application follows a component-based architecture with:

- **Router**: Wouter for lightweight client-side routing
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with Inter font family and dark mode support
- **State Management**: TanStack Query for server state management and caching
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization

The folder structure separates concerns with dedicated directories for pages, components (including layout and modals), hooks, and utilities. The UI follows a modern dashboard pattern with a persistent sidebar navigation and main content area.

### Backend Architecture
The server is built with Express.js and TypeScript, implementing a RESTful API architecture:

- **Framework**: Express.js with TypeScript for type safety
- **Database Layer**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful endpoints organized by domain (customers, packages, dashboard metrics)
- **Middleware**: Request logging, JSON parsing, and error handling
- **Development**: Vite integration for hot module replacement in development

The API follows a resource-based structure with endpoints for dashboard metrics, customer management, package operations, and action queue management.

### Data Storage Solutions
The application uses PostgreSQL as the primary database with Drizzle ORM for schema management and queries:

- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM with TypeScript integration
- **Schema**: Comprehensive data model covering users, customers, pets, services, packages, and notifications
- **Migrations**: Drizzle Kit for database schema migrations
- **Connection**: Neon serverless database with connection pooling

The database schema supports complex package management with relationships between customers, pets, package types, customer packages, and usage tracking.

### Authentication and Authorization
O sistema implementa autenticação simplificada para demonstração:

- **Login Demo**: Credenciais admin/admin para acesso ao sistema
- **Gerenciamento de Sessões**: Sessões Express com armazenamento em memória
- **Segurança**: Hash de senhas bcryptjs e autenticação baseada em sessão
- **Controle de Acesso**: Rotas de API protegidas e proteção de rotas no cliente
- **Dados Demo**: Sistema funciona sem necessidade de banco de dados conectado

### PWA Features
The application is designed as a Progressive Web App:

- **Manifest**: Web app manifest for installation
- **Icons**: Favicon and app icons for mobile devices
- **Responsive Design**: Mobile-first responsive layout
- **Service Worker**: Prepared for offline functionality

## External Dependencies

### Database and Hosting
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **Vercel/Replit**: Prepared for deployment on modern hosting platforms

### UI and Design
- **Radix UI**: Accessible component primitives for complex UI components
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Inter Font**: Modern, readable typography via Google Fonts
- **Lucide React**: Icon library for consistent iconography

### WhatsApp Integration
- **Meta Cloud API**: Planned integration for automated WhatsApp messaging
- **Twilio/Zenvia**: Alternative WhatsApp API providers for message automation
- **Fallback Email**: Resend API for email notifications when WhatsApp is unavailable

### Development Tools
- **TypeScript**: Type safety across the full stack
- **Vite**: Fast build tool with HMR for development
- **Drizzle Kit**: Database schema management and migrations
- **TanStack Query**: Server state management with caching and background updates
- **React Hook Form**: Form state management with validation
- **Zod**: Runtime type validation for forms and API data

### Third-Party Services
- **Google Fonts**: Web font delivery for Inter typography
- **Unsplash**: Placeholder images for development and demo content
- **Date-fns**: Date manipulation and formatting utilities

The architecture prioritizes simplicity, type safety, and developer experience while maintaining the flexibility to scale with business needs. The system is designed to handle the core pet shop business operations efficiently while providing room for future enhancements like advanced scheduling, inventory management, and expanded messaging capabilities.