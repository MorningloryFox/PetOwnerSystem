const { storage } = require('./server/storage');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  try {
    const adminEmail = 'admin';
    const adminPassword = 'admin';
    
    const existingAdmin = await storage.getUserByEmail(adminEmail);
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const companyId = '550e8400-e29b-41d4-a716-446655440000';
      
      // Ensure company exists
      const company = await storage.getCompany(companyId);
      if (!company) {
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
      }
      
      // Create admin user
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
    } else {
      console.log('Admin user already exists.');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser();
