import { storage } from './server/storage.js';
import bcrypt from 'bcryptjs';

async function createAdminUser() {
  console.log('?? Creating admin user...');
  try {
    const adminEmail = 'admin';
    const adminPassword = 'admin';
    const companyId = '550e8400-e29b-41d4-a716-446655440000';

    // Check if admin user already exists
    const existingAdmin = await storage.getUserByEmail(adminEmail, companyId);
    if (existingAdmin) {
      console.log('Admin user already exists.');
      return;
    }

    // Ensure company exists
    const company = await storage.getCompany(companyId);
    if (!company) {
      console.log('Creating default company...');
      await storage.createCompany({
        id: companyId,
        name: 'Gloss Pet',
        email: 'admin@glosspet.com',
        phone: '(11) 9999-9999',
        address: 'São Paulo, SP',
        logo: 'https://via.placeholder.com/150',
        isActive: true,
        createdAt: new Date(),
      });
      console.log('Default company created.');
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await storage.createUser({
      email: adminEmail,
      password: hashedPassword,
      name: 'Administrador',
      role: 'admin',
      companyId: companyId,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Admin user created successfully!');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser();