import { db } from './db';
import * as schema from '@shared/schema';
import { sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// Helper function to generate random dates
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to get random element from array
function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper function to generate random phone number
function generatePhone(): string {
  return `(${Math.floor(Math.random() * 90) + 10}) 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`;
}

// Helper function to generate random email
function generateEmail(name: string): string {
  const domains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com'];
  const cleanName = name.toLowerCase().replace(/\s+/g, '.');
  return `${cleanName}${Math.floor(Math.random() * 100)}@${randomElement(domains)}`;
}

// Sample data
const firstNames = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Julia', 'Lucas', 'Fernanda', 'Rafael', 'Beatriz', 'Gustavo', 'Camila', 'Felipe', 'Amanda', 'André', 'Letícia', 'Bruno', 'Marina', 'Diego', 'Patricia'];
const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Ferreira', 'Costa', 'Pereira', 'Rodrigues', 'Almeida', 'Carvalho', 'Gomes', 'Martins', 'Rocha', 'Barbosa', 'Ribeiro', 'Mendes', 'Nascimento', 'Moreira', 'Araujo'];
const petNames = ['Rex', 'Luna', 'Thor', 'Bella', 'Max', 'Nina', 'Duke', 'Mel', 'Rocky', 'Lola', 'Zeus', 'Princesa', 'Toby', 'Mia', 'Simba', 'Cacau', 'Buddy', 'Sophie', 'Bruce', 'Lili'];
const breeds = {
  dog: ['Golden Retriever', 'Labrador', 'Poodle', 'Bulldog', 'Beagle', 'German Shepherd', 'Yorkshire', 'Boxer', 'Dachshund', 'Shih Tzu'],
  cat: ['Persa', 'Siamês', 'Maine Coon', 'Ragdoll', 'British Shorthair', 'Sphynx', 'Bengal', 'Scottish Fold', 'Russian Blue', 'American Shorthair']
};
const serviceNames = ['Banho', 'Tosa', 'Banho e Tosa', 'Hidratação', 'Tosa Higiênica', 'Tosa de Raça', 'Desembolamento', 'Limpeza de Dentes', 'Corte de Unhas', 'Spa Day'];
const packageNames = ['Básico Mensal', 'Premium Mensal', 'Anual Completo', 'Spa VIP', 'Cuidados Especiais', 'Pacote Família', 'Fidelidade Premium', 'Bem-Estar Total'];

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await db.delete(schema.notifications);
    await db.delete(schema.appointments);
    await db.delete(schema.packageUsages);
    await db.delete(schema.customerPackageServices);
    await db.delete(schema.customerPackages);
    await db.delete(schema.packageTypeServices);
    await db.delete(schema.packageTypes);
    await db.delete(schema.services);
    await db.delete(schema.pets);
    await db.delete(schema.customers);
    await db.delete(schema.users);
    await db.delete(schema.companies);

    // Create company
    console.log('🏢 Creating company...');
    const companyId = uuidv4();
    await db.insert(schema.companies).values({
      id: companyId,
      name: 'PetCare Brasil',
      email: 'contato@petcarebrasil.com',
      phone: '(11) 9999-8888',
      address: 'Rua dos Pets, 123 - Jardim Animal - São Paulo/SP',
      logo: 'https://example.com/logo.png',
      isActive: true,
    });

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminId = uuidv4();
    await db.insert(schema.users).values({
      id: adminId,
      companyId,
      email: 'admin@petcarebrasil.com',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // bcrypt hash for 'password'
      name: 'Administrador PetCare',
      role: 'owner',
      isActive: true,
    });

    // Create customers
    console.log('👥 Creating customers...');
    const customers = [];
    for (let i = 0; i < 20; i++) {
      const firstName = randomElement(firstNames);
      const lastName = randomElement(lastNames);
      const fullName = `${firstName} ${lastName}`;
      
      const customer = {
        id: uuidv4(),
        companyId,
        name: fullName,
        phone: generatePhone(),
        email: generateEmail(fullName),
        notes: `Cliente ${i + 1} - ${randomElement(['Prefere agendar pela manhã', 'Pet ansioso', 'Cliente VIP', 'Primeira visita', 'Cliente recorrente'])}`,
        address: `${randomElement(['Rua', 'Avenida', 'Alameda'])} ${randomElement(['das Flores', 'Principal', 'dos Pets', 'Comercial'])}, ${Math.floor(Math.random() * 1000)}`,
        cep: `${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 900) + 100}`,
        city: randomElement(['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre']),
        state: randomElement(['SP', 'RJ', 'MG', 'PR', 'RS']),
        neighborhood: randomElement(['Centro', 'Jardim', 'Vila', 'Bairro Novo']),
        complement: randomElement(['Apto 101', 'Casa', 'Sala 5', '']),
      };
      
      customers.push(customer);
      await db.insert(schema.customers).values(customer);
    }

    // Create pets
    console.log('🐕 Creating pets...');
    const pets = [];
    for (let i = 0; i < 30; i++) {
      const customer = randomElement(customers);
      const species = randomElement(['dog', 'cat']);
      const breed = randomElement(breeds[species]);
      
      const pet = {
        id: uuidv4(),
        customerId: customer.id,
        name: randomElement(petNames),
        species,
        breed,
        weight: (Math.random() * 30 + 2).toFixed(2),
        birthDate: randomDate(new Date('2015-01-01'), new Date('2023-12-31')),
        gender: randomElement(['male', 'female']),
        color: randomElement(['Preto', 'Branco', 'Marrom', 'Dourado', 'Cinza', 'Malhado']),
        specialNeeds: randomElement(['Nenhum', 'Alergia a grãos', 'Medicação diária', 'Nervoso', '']),
        preferredFood: randomElement(['Royal Canin', 'Pedigree', 'Hills', 'Premier', 'Golden']),
        notes: randomElement(['Pet muito dócil', 'Precisa de cuidado especial', 'Alergico a shampoo', '']),
        imageUrl: `https://example.com/pets/${i + 1}.jpg`,
      };
      
      pets.push(pet);
      await db.insert(schema.pets).values(pet);
    }

    // Create services
    console.log('💈 Creating services...');
    const services = [];
    for (let i = 0; i < serviceNames.length; i++) {
      const service = {
        id: uuidv4(),
        companyId,
        name: serviceNames[i],
        description: `${serviceNames[i]} profissional para seu pet com produtos de alta qualidade`,
        basePrice: (Math.random() * 100 + 30).toFixed(2),
        duration: Math.floor(Math.random() * 120 + 30),
        active: true,
      };
      
      services.push(service);
      await db.insert(schema.services).values(service);
    }

    // Create package types
    console.log('📦 Creating package types...');
    const packageTypes = [];
    for (let i = 0; i < packageNames.length; i++) {
      const packageType = {
        id: uuidv4(),
        companyId,
        name: packageNames[i],
        description: `Pacote ${packageNames[i]} com os melhores serviços para seu pet`,
        validityDays: randomElement([30, 60, 90, 365]),
        totalUses: randomElement([5, 10, 15, 20, 30]),
        price: (Math.random() * 500 + 200).toFixed(2),
        maxPets: randomElement([1, 2, 3]),
        active: true,
      };
      
      packageTypes.push(packageType);
      await db.insert(schema.packageTypes).values(packageType);
    }

    // Create package type services
    console.log('🔗 Creating package type services...');
    for (const packageType of packageTypes) {
      const selectedServices = services.slice(0, Math.floor(Math.random() * 3) + 2);
      
      for (const service of selectedServices) {
        await db.insert(schema.packageTypeServices).values({
          id: uuidv4(),
          packageTypeId: packageType.id,
          serviceId: service.id,
          includedUses: Math.floor(Math.random() * 5) + 1,
          unitPrice: service.basePrice,
        });
      }
    }

    // Create customer packages
    console.log('🎫 Creating customer packages...');
    const customerPackages = [];
    for (let i = 0; i < 15; i++) {
      const customer = randomElement(customers);
      const packageType = randomElement(packageTypes);
      
      const customerPackage = {
        id: uuidv4(),
        customerId: customer.id,
        packageTypeId: packageType.id,
        remainingUses: packageType.totalUses,
        validUntil: randomDate(new Date('2024-12-31'), new Date('2025-12-31')),
        status: 'active',
        purchasePrice: packageType.price,
      };
      
      customerPackages.push(customerPackage);
      await db.insert(schema.customerPackages).values(customerPackage);
    }

    // Create customer package services
    console.log('📋 Creating customer package services...');
    for (const customerPackage of customerPackages) {
      const packageServices = await db.select()
        .from(schema.packageTypeServices)
        .where(sql`${schema.packageTypeServices.packageTypeId} = ${customerPackage.packageTypeId}`);
      
      for (const packageService of packageServices) {
        await db.insert(schema.customerPackageServices).values({
          id: uuidv4(),
          customerPackageId: customerPackage.id,
          serviceId: packageService.serviceId,
          remainingUses: packageService.includedUses,
          totalUses: packageService.includedUses,
        });
      }
    }

    // Create appointments
    console.log('📅 Creating appointments...');
    for (let i = 0; i < 25; i++) {
      const customer = randomElement(customers);
      const customerPets = pets.filter(p => p.customerId === customer.id);
      if (customerPets.length === 0) continue;
      
      const pet = randomElement(customerPets);
      const service = randomElement(services);
      
      await db.insert(schema.appointments).values({
        id: uuidv4(),
        customerId: customer.id,
        petId: pet.id,
        serviceId: service.id,
        scheduledDate: randomDate(new Date('2024-11-01'), new Date('2024-12-31')),
        status: randomElement(['scheduled', 'confirmed', 'checked_in', 'ready', 'picked_up']),
        notes: randomElement(['Cliente solicitou horário especial', 'Pet precisa de cuidado extra', '']),
      });
    }

    // Create package usages
    console.log('✅ Creating package usages...');
    for (let i = 0; i < 20; i++) {
      const customerPackage = randomElement(customerPackages);
      const customerPets = pets.filter(p => p.customerId === customerPackage.customerId);
      if (customerPets.length === 0) continue;
      
      const pet = randomElement(customerPets);
      const service = randomElement(services);
      
      await db.insert(schema.packageUsages).values({
        id: uuidv4(),
        customerPackageId: customerPackage.id,
        petId: pet.id,
        serviceId: service.id,
        notes: `Uso do pacote ${randomElement([1, 2, 3])} de ${randomElement([5, 10, 15])}`,
      });
    }

    // Create notifications
    console.log('📱 Creating notifications...');
    for (let i = 0; i < 15; i++) {
      const customer = randomElement(customers);
      
      await db.insert(schema.notifications).values({
        id: uuidv4(),
        customerId: customer.id,
        type: randomElement(['confirmation', 'check_in', 'ready', 'reminder']),
        message: randomElement([
          'Seu pet está pronto para retirada!',
          'Confirmação de agendamento realizada',
          'Lembrete: seu pet tem horário amanhã',
          'Seu pet está sendo atendido'
        ]),
        channel: 'whatsapp',
        status: randomElement(['pending', 'sent']),
      });
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - 1 Company created`);
    console.log(`   - 1 Admin user created`);
    console.log(`   - ${customers.length} Customers created`);
    console.log(`   - ${pets.length} Pets created`);
    console.log(`   - ${services.length} Services created`);
    console.log(`   - ${packageTypes.length} Package types created`);
    console.log(`   - ${customerPackages.length} Customer packages created`);
    console.log(`   - 25 Appointments created`);
    console.log(`   - 20 Package usages created`);
    console.log(`   - 15 Notifications created`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Seeding process finished!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };
