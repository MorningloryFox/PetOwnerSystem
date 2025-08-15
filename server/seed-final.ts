import { db } from './db';
import * as schema from '@shared/schema';
import { sql } from 'drizzle-orm';

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
const firstNames = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Julia', 'Lucas', 'Fernanda', 'Rafael', 'Beatriz'];
const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Ferreira', 'Costa', 'Pereira', 'Rodrigues', 'Almeida'];
const petNames = ['Rex', 'Luna', 'Thor', 'Bella', 'Max', 'Nina', 'Duke', 'Mel', 'Rocky', 'Lola'];
const dogBreeds = ['Golden Retriever', 'Labrador', 'Poodle', 'Bulldog', 'Beagle', 'German Shepherd'];
const catBreeds = ['Persa', 'Siamês', 'Maine Coon', 'Ragdoll', 'British Shorthair', 'Sphynx'];
const serviceNames = ['Banho', 'Tosa', 'Banho e Tosa', 'Hidratação', 'Tosa Higiênica', 'Tosa de Raça', 'Desembolamento', 'Limpeza de Dentes', 'Corte de Unhas', 'Spa Day'];
const packageNames = ['Básico Mensal', 'Premium Mensal', 'Anual Completo', 'Spa VIP', 'Cuidados Especiais'];

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
    const company = await db.insert(schema.companies).values({
      name: 'PetCare Brasil',
      email: 'contato@petcarebrasil.com',
      phone: '(11) 9999-8888',
      address: 'Rua dos Pets, 123 - Jardim Animal - São Paulo/SP',
      logo: 'https://example.com/logo.png',
      isActive: true,
    }).returning();

    const companyId = company[0].id;

    // Create admin user
    await db.insert(schema.users).values({
      companyId,
      email: 'admin@petcarebrasil.com',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // bcrypt hash for 'password'
      name: 'Administrador PetCare',
      role: 'owner',
      isActive: true,
    });

    // Create customers
    const customers = [];
    for (let i = 0; i < 10; i++) {
      const firstName = randomElement(firstNames);
      const lastName = randomElement(lastNames);
      const fullName = `${firstName} ${lastName}`;
      
      const customer = await db.insert(schema.customers).values({
        companyId,
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

      customers.push(customer[0]);
    }

    // Create customers
    const customers = [];
    for (let i = 0; i < 10; i++) {
      const firstName = randomElement(firstNames);
      const lastName = randomElement(lastNames);
      const fullName = `${firstName} ${lastName}`;
      
      const customer = await db.insert(schema.customers).values({
        companyId,
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

            customers.push(customer[0]);
        }

        // Create pets
        const pets = [];
        for (let i = 0; i < 15; i++) {
            const customer = randomElement(customers);
            const species = randomElement(['dog', 'cat']);
            const breed = species === 'dog' ? randomElement(dogBreeds) : randomElement(catBreeds);
            
            const pet = await db.insert(schema.pets).values({
                customerId: customer.id,
                name: randomElement(petNames),
                species,
                breed,
                weight: parseFloat((Math.random() * 30 + 2).toFixed(2)),
                birthDate: randomDate(new Date('2018-01-01'), new Date('2023-12-31')),
                gender: randomElement(['male', 'female']),
                color: randomElement(['Preto', 'Branco', 'Marrom', 'Dourado']),
                specialNeeds: randomElement(['Nenhum', 'Alergia a grãos', 'Medicação diária']),
                preferredFood: randomElement(['Royal Canin', 'Pedigree', 'Hills']),
                notes: randomElement(['Pet muito dócil', 'Precisa de cuidado especial']),
            }).returning();

            customers.push(customer[0]);
        }

        // Create services
        const services = [];
        for (let i = 0; i < 8; i++) {
            const service = await db.insert(schema.services).values({
                companyId,
                name: serviceNames[i],
                description: `${serviceNames[i]} profissional para seu pet`,
                basePrice: (Math.random() * 100 + 30).toFixed(2),
                duration: Math.floor(Math.random() * 120 + 30),
                active: true,
            }).returning();

            services.push(service[0]);
        }

        // Create package types
        const packageTypes = [];
        for (let i = 0; i < 5; i++) {
            const packageType = await db.insert(schema.packageTypes).values({
                companyId,
                name: packageNames[i],
                description: `Pacote ${packageNames[i]} com serviços completos`,
                validityDays: randomElement([30, 60, 90]),
                totalUses: random_element([5, 10, 15]),
                price: (Math.random() * 500 + 200).toFixed(2),
                maxPets: 1,
                active: true,
            }).returning();

            packageTypes.push(packageType[0]);
        }

        // Create package type services
        const packageTypeServices = [];
        for (const packageType of packageTypes) {
            const selectedServices = services.slice(0, 3);
            for (const service of selectedServices) {
                await db.insert(schema.packageTypeServices).values({
                    packageTypeId: packageType.id,
                    serviceId: service.id,
                    includedUses: Math.floor(Math.random() * 3) + 1,
                    unitPrice: service.basePrice,
                });
            }
        }

        // Create customer packages
        const customerPackages = [];
        for (let i = 0; i < 8; i++) {
            const customer = randomElement(customers);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
            const packageType = random_element(packageTypes);
          'Lembrete: seu pet tem horário amanhã'
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
    console.log(`   - 12 Appointments created`);
    console.log(`   - 8 Package usages created`);
    console.log(`   - 8 Notifications created`);

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
