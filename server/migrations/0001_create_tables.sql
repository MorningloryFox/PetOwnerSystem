-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    logo TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'employee',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(email, company_id)
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    notes TEXT,
    address TEXT,
    cep TEXT,
    city TEXT,
    state TEXT,
    neighborhood TEXT,
    complement TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create pets table
CREATE TABLE IF NOT EXISTS pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) NOT NULL,
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    breed TEXT,
    weight NUMERIC(5,2),
    birth_date DATE,
    gender TEXT,
    color TEXT,
    special_needs TEXT,
    preferred_food TEXT,
    notes TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    base_price NUMERIC(10,2),
    duration INTEGER,
    active BOOLEAN DEFAULT true
);

-- Create package_types table
CREATE TABLE IF NOT EXISTS package_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    validity_days INTEGER NOT NULL,
    total_uses INTEGER NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    max_pets INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT true
);

-- Create package_type_services table
CREATE TABLE IF NOT EXISTS package_type_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_type_id UUID REFERENCES package_types(id) NOT NULL,
    service_id UUID REFERENCES services(id) NOT NULL,
    included_uses INTEGER DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL
);

-- Create customer_packages table
CREATE TABLE IF NOT EXISTS customer_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) NOT NULL,
    package_type_id UUID REFERENCES package_types(id) NOT NULL,
    remaining_uses INTEGER NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    renewed_from_id UUID REFERENCES customer_packages(id),
    purchase_price NUMERIC(10,2) NOT NULL,
    acquired_at TIMESTAMP DEFAULT NOW()
);

-- Create customer_package_services table
CREATE TABLE IF NOT EXISTS customer_package_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_package_id UUID REFERENCES customer_packages(id) NOT NULL,
    service_id UUID REFERENCES services(id) NOT NULL,
    remaining_uses INTEGER NOT NULL,
    total_uses INTEGER NOT NULL
);

-- Create package_usages table
CREATE TABLE IF NOT EXISTS package_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_package_id UUID REFERENCES customer_packages(id) NOT NULL,
    pet_id UUID REFERENCES pets(id) NOT NULL,
    service_id UUID REFERENCES services(id) NOT NULL,
    notes TEXT,
    used_at TIMESTAMP DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) NOT NULL,
    pet_id UUID REFERENCES pets(id) NOT NULL,
    service_id UUID REFERENCES services(id) NOT NULL,
    scheduled_date TIMESTAMP NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) NOT NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    channel TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    metadata JSONB,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_company_id ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_pets_customer_id ON pets(customer_id);
CREATE INDEX IF NOT EXISTS idx_services_company_id ON services(company_id);
CREATE INDEX IF NOT EXISTS idx_package_types_company_id ON package_types(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_packages_customer_id ON customer_packages(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_packages_package_type_id ON customer_packages(package_type_id);
CREATE INDEX IF NOT EXISTS idx_package_usages_customer_package_id ON package_usages(customer_package_id);
CREATE INDEX IF NOT EXISTS idx_package_usages_pet_id ON package_usages(pet_id);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_pet_id ON appointments(pet_id);
CREATE INDEX IF NOT EXISTS idx_notifications_customer_id ON notifications(customer_id);

-- Insert default company
INSERT INTO companies (id, name, email, phone, address, logo, is_active, created_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Gloss Pet',
    'admin@glosspet.com',
    '(11) 9999-9999',
    'São Paulo, SP',
    'https://via.placeholder.com/150',
    true,
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert admin user
INSERT INTO users (company_id, email, password, name, role, is_active, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'admin',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash for 'password'
    'Administrador',
    'admin',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email, company_id) DO NOTHING;

-- Insert sample services
INSERT INTO services (company_id, name, description, base_price, duration, active)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'Banho & Tosa', 'Banho completo com tosa higiênica', 80.00, 120, true),
    ('550e8400-e29b-41d4-a716-446655440000', 'Apenas Banho', 'Banho sem tosa', 50.00, 60, true),
    ('550e8400-e29b-41d4-a716-446655440000', 'Tosa Higiênica', 'Tosa apenas nas áreas necessárias', 40.00, 45, true),
    ('550e8400-e29b-41d4-a716-446655440000', 'Corte de Unhas', 'Corte de unhas e limpeza de orelhas', 25.00, 30, true)
ON CONFLICT DO NOTHING;

-- Insert sample package types
INSERT INTO package_types (company_id, name, description, validity_days, total_uses, price, max_pets, active)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'Pacote Básico', 'Pacote básico com 5 banhos', 30, 5, 200.00, 1, true),
    ('550e8400-e29b-41d4-a716-446655440000', 'Pacote Premium', 'Pacote premium com 10 serviços', 60, 10, 450.00, 2, true),
    ('550e8400-e29b-41d4-a716-446655440000', 'Pacote Completo', 'Pacote completo com 15 serviços', 90, 15, 600.00, 3, true)
ON CONFLICT DO NOTHING;
