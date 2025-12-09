# CRM Refrimix Tecnologia ❄️

![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)

> Sistema completo de gestão para empresas de climatização e HVAC, desenvolvido com tecnologias modernas para otimizar operações, financeiro e relacionamento com clientes.

---

## 📋 Sobre o Projeto

O **CRM Refrimix** é uma solução 'All-in-One' projetada para resolver dores específicas de prestadores de serviço, centralizando:
- Gestão de Leads e Clientes (CRM)
- Controle Financeiro (Fluxo de Caixa Multi-contas)
- Agendamento de Visitas Técnicas
- Gestão de Equipamentos e PMOC
- Estoque e Fornecedores
- Geração de Orçamentos em PDF

Desenvolvido com foco em **Performance**, **UX/UI Premium** e **Escalabilidade**.

---

## 🚀 Features Principais

- **Dashboard Inteligente**: KPIs em tempo real de faturamento, leads e serviços.
- **Fluxo de Caixa Avançado**: Separação clara entre contas PF (CPF) e PJ (CNPJ) com importação OFX/CSV.
- **Gestão de Equipamentos**: Histórico de manutenção por QR Code e controle de garantia.
- **Automação de Orçamentos**: Crie propostas profissionais em segundos e exporte para PDF.
- **Controle de Acesso**: Níveis de permissão para Admin e Colaboradores.
- **Dark Mode**: Interface otimizada para uso em qualquer ambiente.

---

## 🛠️ Tech Stack

**Core:**
- ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) **React 18** (Vite)
- ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white) **TypeScript**
- ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) **TailwindCSS** + Shadcn/UI

**Backend & Data:**
- ![Supabase](https://img.shields.io/badge/Supabase-181818?style=flat&logo=supabase&logoColor=3ECF8E) **Supabase** (PostgreSQL, Auth, Realtime)

**Quality Assurance:**
- ![Playwright](https://img.shields.io/badge/Playwright-45ba4b?style=flat&logo=Playwright&logoColor=white) **Playwright** (E2E Testing)
- ![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=flat&logo=eslint&logoColor=white) **ESLint** + Prettier

---

## 📦 Instalação e Uso

### Pré-requisitos
- Node.js 18+
- Conta no Supabase

### Passo a Passo

1. **Clone o repositório**
   ```bash
   git clone https://github.com/zapprosite/crm-refrimix-tecnologia.git
   cd crm-refrimix-tecnologia
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente**
   Crie um arquivo `.env` na raiz baseado no `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Preencha com suas chaves do Supabase:
   ```env
   VITE_SUPABASE_URL=sua_url_aqui
   VITE_SUPABASE_ANON_KEY=sua_key_aqui
   ```

4. **Inicie o Servidor de Desenvolvimento**
   ```bash
   npm run dev
   ```
   O app estará rodando em `http://localhost:5173`.

---

## 🤝 Como Contribuir

Contribuições são sempre bem-vindas! Veja o arquivo [CONTRIBUTING.md](CONTRIBUTING.md) para saber como começar.

Para diretrizes sobre desenvolvimento com Agentes de IA, consulte [AGENTS.md](AGENTS.md).

---

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).

---

<div align="center">
  <sub>Desenvolvido por Refrimix Tecnologia</sub>
</div>