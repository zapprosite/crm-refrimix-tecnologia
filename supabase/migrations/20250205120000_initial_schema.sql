/*
  # Schema Inicial CRM ClimaTech
  
  Criação da estrutura completa do banco de dados para o CRM de climatização.
  
  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "High"
  - Requires-Backup: false
  - Reversible: true
  
  ## Estrutura:
  1. Extensões (uuid-ossp)
  2. Enums (Status, Tipos, Categorias)
  3. Tabelas Core (users, leads, schedules, tasks, financial, etc.)
  4. RLS (Row Level Security) básico
  5. Triggers para updated_at
*/

-- 1. Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Enums
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'technician', 'operator');
CREATE TYPE lead_source AS ENUM ('Google', 'SEO', 'Indicação', 'Instagram', 'Telefone', 'Website', 'Outros', 'Chatbot', 'Importação');
CREATE TYPE lead_status AS ENUM ('Novo', 'Em Atendimento', 'Orçamento', 'Fechado', 'Falha', 'Inativo');
CREATE TYPE schedule_service_type AS ENUM ('Instalação', 'Manutenção', 'Diagnóstico', 'Reparo', 'Limpeza', 'Visita Técnica');
CREATE TYPE schedule_status AS ENUM ('Agendado', 'Confirmado', 'Em Andamento', 'Concluído', 'Cancelado');
CREATE TYPE task_status AS ENUM ('Pendente', 'Em Progresso', 'Concluído', 'Bloqueado', 'Arquivado');
CREATE TYPE task_priority AS ENUM ('Baixa', 'Média', 'Alta', 'Crítica');
CREATE TYPE budget_status AS ENUM ('Rascunho', 'Enviado', 'Aprovado', 'Rejeitado', 'Expirado', 'Faturado');
CREATE TYPE equipment_type AS ENUM ('Split', 'Janela', 'Portátil', 'Cassette', 'Piso Teto', 'VRF', 'Chiller', 'Multi-Split');
CREATE TYPE maintenance_frequency AS ENUM ('Mensal', 'Bimestral', 'Trimestral', 'Semestral', 'Anual');
CREATE TYPE transaction_type AS ENUM ('income', 'expense');
CREATE TYPE entity_document_type AS ENUM ('CPF', 'CNPJ');

-- 3. Tabelas

-- Tabela de Perfis de Usuário (Espelho do auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR UNIQUE NOT NULL,
    full_name VARCHAR,
    role user_role DEFAULT 'operator',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    company VARCHAR DEFAULT 'N/A',
    email VARCHAR,
    phone VARCHAR,
    document VARCHAR, -- CPF/CNPJ
    address VARCHAR,
    city VARCHAR,
    state VARCHAR(2),
    source lead_source DEFAULT 'Google',
    status lead_status DEFAULT 'Novo',
    value DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES public.users(id) -- Dono do lead
);

-- Agendamentos
CREATE TABLE public.schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR NOT NULL,
    client_name VARCHAR NOT NULL, -- Desnormalizado para facilitar, ou poderia ser FK
    lead_id UUID REFERENCES public.leads(id),
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    service_type schedule_service_type DEFAULT 'Instalação',
    address VARCHAR,
    status schedule_status DEFAULT 'Agendado',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tarefas (Kanban)
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR NOT NULL,
    description TEXT,
    due_date DATE,
    start_time TIME,
    end_time TIME,
    collaborator_name VARCHAR, -- Simplificado para esta versão
    status task_status DEFAULT 'Pendente',
    priority task_priority DEFAULT 'Média',
    type VARCHAR DEFAULT 'Avulsa',
    quote_id UUID, -- FK opcional para orçamentos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipamentos (Manutenção)
CREATE TABLE public.equipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    brand VARCHAR,
    model VARCHAR,
    serial VARCHAR,
    btu VARCHAR,
    type equipment_type DEFAULT 'Split',
    install_date DATE,
    frequency maintenance_frequency DEFAULT 'Mensal',
    next_maintenance DATE,
    qr_code_id VARCHAR UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financeiro
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    description VARCHAR NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_date DATE NOT NULL,
    category VARCHAR DEFAULT 'Serviços',
    type transaction_type NOT NULL,
    entity entity_document_type DEFAULT 'CNPJ',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orçamentos Salvos
CREATE TABLE public.quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_number VARCHAR NOT NULL,
    client_name VARCHAR NOT NULL,
    total_value DECIMAL(10,2) NOT NULL,
    data JSONB NOT NULL, -- Armazena todo o objeto do orçamento para recriar o PDF
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Colaboradores (Equipe)
CREATE TABLE public.collaborators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    role VARCHAR NOT NULL,
    team VARCHAR,
    phone VARCHAR,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Segurança (RLS)
-- Habilitando RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;

-- Políticas Permissivas (Para desenvolvimento rápido - Em prod refinar por user_id)
CREATE POLICY "Acesso total para autenticados" ON public.users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acesso total leads" ON public.leads FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acesso total schedules" ON public.schedules FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acesso total tasks" ON public.tasks FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acesso total equipments" ON public.equipments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acesso total transactions" ON public.transactions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acesso total quotes" ON public.quotes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acesso total collaborators" ON public.collaborators FOR ALL USING (auth.role() = 'authenticated');

-- Trigger para criar perfil público ao criar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
