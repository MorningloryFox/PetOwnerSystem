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

// Sample data
const firstNames = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Julia', 'Lucas', 'Fernanda', 'Rafael', 'Beatriz'];
const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Ferreira', 'Costa', 'Pereira', 'Rodrigues', 'Almeida'];
const petNames = ['Rex', 'Luna', 'Thor', 'Bella', 'Max', 'Nina', 'Duke', 'Mel', 'Rocky', 'Lola'];
const dogBreeds = ['Golden Retriever', 'Labrador', 'Poodle', 'Bulldog', 'Beagle', 'German Shepherd'];
const catBreeds = ['Persa', 'Siamês', 'Maine Coon', 'Ragdoll', 'British Shorthair', 'Sphynx'];
const serviceNames = ['Banho', 'Tosa', 'Banho e Tosa', 'Hidratação', 'Tosa Higiênica', 'Tosa de Raça', 'Desembolamento', 'Limpeza de Dentes', 'Corte de Unhas', 'Spa Day'];
const packageNames = ['Básico Mensal', 'Premium Mensal', 'Anual Completo', 'Spa VIP', 'Cuidados Especiais'];

// Main seeding function
async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await db.delete(schema.notifications);
    await db.delete(schema.appointments);
    await db.delete(schema.packageUsages);
    await db.delete(schema.customerPackageServices);
    await db.delete(schema.customerPackageServices);
    await db.delete(schema.packageTypeServices);
    await db.delete(schema.packageTypes);
    await db.delete(schema.services);
    await db.delete(schema.pets);
    await db.delete(schema.customers);
    await db.delete(schema.users);
    await db.delete(schema.companies);

    // Create company
    console.log('🏢 Creating company...');
    const [company] = await db.insert(schema.companies).values({
      name: 'PetCare Brasil',
      email: 'contato@petcarebrasil.com',
      phone: '(11) 9999-8888',
      address: 'Rua dos Pets, 123 - Jardim Animal - São Paulo/SP',
      logo: 'https://example.com/logo.png',
      isActive: true,
    }).returning();

    const companyId = company.id;

    // Create admin user
    await db.insert(schema.users).values({
      companyId,
      email: 'admin@petcarebrasil.com',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      name: 'Administrador PetCare',
      role: 'owner',
      isActive: true,
    });

    // Create customers
    const customers = [];
    for (let i = 0; i < 15; i++) {
      const firstName = randomElement(firstNames);
      const lastName = randomElement(lastNames);
      const fullName = `${firstName} ${lastName}`;
      
      const [customer] = await db.insert(schema.customers).values({
        name: fullName,
        phone: generatePhone(),
        email: generateEmail(fullName),
        notes: `Cliente ${i + 1} - ${randomElement(['Prefere agendar pela manhã', 'Pet ansioso', 'Cliente VIP'])},
        address: `${randomElement(['Rua', 'Avenida'])} ${randomElement(['das Flores', 'Principal'])}, ${Math.floor(Math.random() * 1000)}`,
        cep: `${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 900) + 100}`,
        city: 'São Paulo',
        state: 'SP',
        neighborhood: 'Centro',
      }).returning();
      
      customers.push(customer);
    }

    // Create pets
    const pets = [];
    for (let i = 0; i < 20; i++) {
      const customer = randomElement(customers);
      const species = randomElement(['dog', 'cat']);
      const breed = species === 'dog' ? random_element(dogBreeds) : random_element(catBreeds);
      
      const [pet] = await db.insert(schema.pets).values({
        customerId: customer.id,
        name: random_element(petNames),
        species,
        breed,
        weight: parseFloat((Math.random() * 30 + 2).toFixed(2)),
        birthDate: random_date(new Date('2015-01-01'), new Date('2023-12-31')),
        gender: random_element(['male', 'female']),
        color: random_element(['Preto', 'Branco', 'Marrom', 'Dourado']),
        specialNeeds: random_element(['Nenhum', 'Alergia a grãos', 'Medicação diária']),
        preferredFood: random_element(['Royal Canin', 'Pedigree', 'Hills']),
        notes: random_element(['Pet muito dócil', 'Precisa de cuidado especial']),
        imageUrl: `https://example.com/pets/${i + 1}.jpg`,
      }).returning();
      
      pets.push(pet);
    }

    // Create services
    const services = [];
    for (let i = 0; i < serviceNames.length; i++) {
      const [service] = await db.insert(schema.services).values({
        companyId,
        name: serviceNames[i],
        description: `${serviceNames[i]} profissional para seu pet",
        basePrice: parseFloat((Math.random() * 100 + 30).toFixed(2)),
        duration: Math.floor(Math.random() * 120 + 30),
        active: true,
      }).returning();
      
      services.push(service);
    }

    // Create package types
    const packageTypes = [];
    for (let i = 0; i < packageNames.length; i++) {
      const [packageType] = await db.insert(schema.packageTypes).values({
        companyId,
        name: packageNames[i],
        description: `Pacote ${packageNames[i]} com os melhores serviços para seu pet`,
        validityDays: random_element([30, 60, 90, 365]),
        totalUses: random_element([5, 10, 15, 20, 30]),
        price: parse_float((Math.random() * 500 + 200).toFixed(2)),
        maxPets: random_element([1, 2, 3]),
        active: true,
      }).returning();
      
      packageTypes.push(packageType);
    }

    // Create package type services
    const packageTypeServices = [];
    for (const packageType of packageTypes) {
      const selectedServices = services.slice(0, Math.floor(Math.random() * 3) + 2);
      for (const service of selectedServices) {
        await db.insert(schema.packageTypeServices).values({
          packageTypeId: packageType.id,
          serviceId: service.id,
          includedUses: Math.floor(Math.random() * 5) + 1,
          unitPrice: service.basePrice,
        });
      }
    }

    // Create customer packages
    const customerPackages = [];
    for (let i = 0; i < 10; i++) {
      const customer = random_element(customers);
      const packageType = random_element(packageTypes);
      
      const [customerPackage] = await db.insert(schema.customerPackages).values({
        customerId: customer.id,
        packageTypeId: packageType.id,
        remainingUses: packageType.totalUses,
        valid_until: random_date(new Date('2024-12-31'), new Date('2025-12-31')),
        status: 'active',
        purchasePrice: packageType.price,
      }).returning();
      
      customerPackages.push(customerPackage);
    }

    // Create appointments
    const appointments = [];
    for (let i = 0; i < 25; i++) {
      const customer = random_element(customers);
      const customerPets = pets.filter(p => p.customerId === customer.id);
      if (customerPets.length === 0) continue;
      
      const pet = random_element(customers);
      const service = random_element(services);
      
      await db.insert(schema.appointments).values({
        customerId: customer.id,
        petId: pet.id,
        serviceId: service.id,
        scheduledDate: random_date(new Date('2024-11-01'), new Date('2024-12-31')),
        status: random_element(['scheduled', 'confirmed', 'checked_in', 'ready', 'picked_up']),
        notes: random_element(['Cliente solicitou horário especial', 'Pet precisa de cuidado extra']),
      });

      // Create appointments
      await db.insert(schema.appointments).values({
        customerId: customer.id,
        petId: pet.id,
        serviceId: service.id,
        scheduledDate: random_date(new Date('2024-11-01'), new Date('2024-12-31')),
        status: random_element(['scheduled', 'confirmed', 'checked_in', 'ready', 'picked_up']),
        notes: random_element(['Cliente solicitou horário especial', 'Pet precisa de cuidado extra']),
      });

      // Create notifications
      await db.insert(schema.notifications).values({
        customerId: customer.id,
        type: random_element(['confirmation', 'check_in', 'ready', 'reminder']),
        message: random_element([
          'Seu pet está pronto para retirada!',
          'Confirmação de agendamento realizada',
          'Lembrete: seu pet tem horário amanhã',
          'Seu pet está sendo atendido'
        ]),
        channel: 'whatsapp',
        status: random_element(['pending', 'sent']),
      });

      // Create notifications
      await db.insert(schema.notifications).values({
        customerId: customer.id,
        type: random_element(['confirmation', 'check_in', 'ready', 'reminder']),
        message: random_element([
          'Seu pet está pronto para retirada!',
          'Confirmação de agendamento realizada',
          'Lembrete: seu pet tem horário amanhã',
          'Seu pet está sendo atendido'
        ]),
        channel: 'whatsapp',
        status: random_element(['pending', 'sent']),
      });

      // Create notifications
      await db.insert(schema.notifications).values({
        customerId: customer.id,
        type: random_element(['confirmation', 'check_in', 'ready', 'reminder']),
        message: random_element([
          'Seu pet está pronto para retirada!',
          'Confirmação de agendamento realizada',
          'Lembrete: seu pet tem horário amanhã',
          'Seu pet está sendo atendido'
        ]),
        channel: 'whatsapp',
        status: random_element(['pending', 'sent']),
      });

      // Create notifications
          'Lembrete: seu pet tem horário amanhã'
        ]),
        channel: 'whatsapp',
        status: random_element(['pending', 'sent']),
      });

      // Create notifications
          'Lembrete: seu pet tem horário amanhã'
        ]),
        channel: 'whatsapp',
        status: random_element(['pending', 'sent']),
      });

      // Create notifications
          'Lembrete: seu pet tem horário amanhã'
        ]),
        channel: 'whatsapp',
        status: random_element(['pending', 'sent']),
      });

      // Create notifications
          'Lembrete: seu pet tem horário amanhã'
        ]),
        channel: 'whatsapp',
        status: random_element(['pending', 'sent']),
      });

      // Create notifications
          'Lembrete: seu pet tem horário amanhã'
        ]),
        channel: 'whatsapp',
        status: random_element(['pending', 'sent']),
      });

      // Create notifications
          'Lembrete: seu pet tem horário amanhã'
        ]),
        channel: 'whatsapp',
        status: random_element(['pending', 'sent']),
      });

      // Create notifications
          'Lembrete: seu pet tem horário amanhã'
        ]),
        channel: 'whatsapp',
        status: random_element(['pending', 'sent']),
      });

      // Create notifications
          'Lembrete: seu pet tem horário amanhã'
        ]),
        channel: 'whatsapp',
        status: random_element(['pending', 'sent']),
      });

      // Create notifications
          'Lembrete: seu pet tem horário amnhã'
        ]),
        channel: 'whatsapp',
        status: random_element(['pending', 'sent']),
      });

      // Create notifications
          'Lembrete: seu pet tem horário amnhã'
        ]),
        channel: 'whatsapp',
        status: random_element(['pending', 'sent']),
      });

      // Create notifications
          'Lembrete: seu pet tem horário amnhã'
        ]),
        channel: 'whatsapp',
        status: random_element(['pending', 'sent']),
      });

      // Create notifications
          'Lembrete: seu pet tem horário amnhã'
        ]),
        channel: 'whatsapp',
        status: random_element(['pending', 'sent']),
      });

      // Create notifications
          'Lembrete: seu pet tem horário amnhã'
        ]),
        channel: 'whatsapp',
        status: random_element(['pending', 'sent']),
      });

      // Create notifications
          'Lembrete: seu pet tem horário amnhã'
        ]),
        channel: 'whatsapp',
        status: random_element(['pending', 'sent']),
      });

      // Create notifications
          'Lembrete: seu pet tem horário amnhã'
        ]),
        channel: 'whatsapp',
        status: random_element(['pending', 'sent']),
      });

      // Create notifications
          'Lembrete: seu pet tem horário amnhã'
        ]),
        channel: 'whatsapp',
        status: random_element(['pending', 'sent']),
      });

      // Create notifications
          'Lembrete: seu pet tem horário amnhã'
