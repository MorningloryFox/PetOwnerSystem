-- Pet Owner System - New Supabase Database Setup
-- Execute this in the Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    company_id UUID REFERENCES companies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    duration INTEGER, -- in minutes
    company_id UUID REFERENCES companies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create package_types table
CREATE TABLE IF NOT EXISTS package_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    company_id UUID REFERENCES companies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial data
INSERT INTO companies (id, name, email, phone) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Gloss Pet', 'admin@glosspet.com', '(11) 99999-9999')
ON CONFLICT DO NOTHING;

INSERT INTO users (email, name, role, company_id) VALUES 
('admin@glosspet.com', 'Admin User', 'admin', '550e8400-e29b-41d4-a716-446655440000')
ON CONFLICT DO NOTHING;

INSERT INTO services (name, description, price, duration, company_id) VALUES 
('Banho e Tosa', 'Banho completo com tosa higiênica', 50.00, 60, '550e8400-e29b-41d4-a716-446655440000'),
('Consulta Veterinária', 'Consulta completa com veterinário', 80.00, 30, '550e8400-e29b-41d4-a716-446655440000'),
('Vacinação', 'Aplicação de vacinas', 35.00, 15, '550e8400-e29b-41d4-a716-446655440000'),
('Corte de Unhas', 'Corte e limpeza das unhas', 20.00, 15, '550e8400-e29b-41d4-a716-446655440000'),
('Limpeza de Ouvido', 'Limpeza e higienização dos ouvidos', 25.00, 20, '550e8400-e29b-41d4-a716-446655440000')
ON CONFLICT DO NOTHING;

INSERT INTO package_types (name, description, company_id) VALUES 
('Básico', 'Pacote básico de cuidados essenciais', '550e8400-e29b-41d4-a716-446655440000'),
('Premium', 'Pacote premium com serviços extras', '550e8400-e29b-41d4-a716-446655440000'),
('VIP', 'Pacote VIP com todos os serviços inclusos', '550e8400-e29b-41d4-a716-446655440000')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_types ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed)
CREATE POLICY "Allow public read access on companies" ON companies FOR SELECT USING (true);
CREATE POLICY "Allow public read access on users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public read access on services" ON services FOR SELECT USING (true);
CREATE POLICY "Allow public read access on package_types" ON package_types FOR SELECT USING (true);
