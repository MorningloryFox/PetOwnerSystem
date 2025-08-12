import { 
  type Company, type InsertCompany, type User, type InsertUser, type Customer, type InsertCustomer,
  type Pet, type InsertPet, type Service, type InsertService,
  type PackageType, type InsertPackageType, type PackageTypeService, type InsertPackageTypeService,
  type CustomerPackage, type InsertCustomerPackage, type CustomerPackageService, type InsertCustomerPackageService,
  type PackageUsage, type InsertPackageUsage, type Appointment, type InsertAppointment,
  type Notification, type InsertNotification,
  companies, users, customers, pets, services, packageTypes, packageTypeServices, customerPackages, 
  customerPackageServices, packageUsages, appointments, notifications
} from "@shared/schema";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, and, gte, lte, desc, count, sql, sum, asc } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Extended interfaces for dashboard data
export interface DashboardMetrics {
  activePackages: number;
  renewalsThisMonth: number;
  churnRate: number;
  riskyClients: number;
}

export interface ActionQueueItem {
  id: string;
  customerId: string;
  customerName: string;
  petName: string;
  petBreed: string;
  petImage: string;
  packageId: string;
  priority: "high" | "medium" | "low";
  reason: string;
  expiresIn?: number;
  remainingUses?: number;
  lastUsedDays?: number;
}

export interface CustomerWithPackages extends Customer {
  packages: CustomerPackage[];
  pets: Pet[];
}

export interface IStorage {
  // Companies
  getCompany(id: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;

  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string, companyId?: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastLogin(id: string): Promise<void>;

  // Customers
  getCustomers(companyId?: string): Promise<Customer[]>;
  getCustomersWithPetCount(companyId?: string): Promise<(Customer & { petCount: number })[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer | undefined>;
  deleteCustomer(id: string): Promise<boolean>;

  // Pets
  getPets(companyId?: string): Promise<(Pet & { customerName?: string })[]>;
  getPetsByCustomer(customerId: string): Promise<Pet[]>;
  createPet(pet: InsertPet): Promise<Pet>;
  updatePet(id: string, pet: Partial<Pet>): Promise<Pet | undefined>;
  deletePet(id: string): Promise<boolean>;

  // Services
  getServices(): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, service: Partial<Service>): Promise<Service | undefined>;

  // Package Types
  getPackageTypes(): Promise<PackageType[]>;
  createPackageType(packageType: InsertPackageType): Promise<PackageType>;
  updatePackageType(id: string, packageType: Partial<PackageType>): Promise<PackageType | undefined>;

  // Customer Packages
  getCustomerPackages(): Promise<CustomerPackage[]>;
  getActivePackages(): Promise<CustomerPackage[]>;
  createCustomerPackage(customerPackage: InsertCustomerPackage): Promise<CustomerPackage>;
  updateCustomerPackage(id: string, customerPackage: Partial<CustomerPackage>): Promise<CustomerPackage | undefined>;
  renewPackage(packageId: string): Promise<CustomerPackage>;

  // Package Usage
  createPackageUsage(usage: InsertPackageUsage): Promise<PackageUsage>;
  getPackageUsages(packageId: string): Promise<PackageUsage[]>;

  // Appointments
  getAppointments(): Promise<any[]>;
  getAppointmentStats(): Promise<{ today: number; thisWeek: number; pending: number; occupancyRate: number; }>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, appointment: Partial<Appointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: string): Promise<boolean>;

  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(customerId?: string): Promise<Notification[]>;

  // Dashboard specific methods
  getDashboardMetrics(): Promise<DashboardMetrics>;
  getActionQueue(): Promise<ActionQueueItem[]>;
  getRecentActivity(): Promise<any[]>;
  getRevenueByService(): Promise<any[]>;
}

// Initialize database connection
const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("SUPABASE_DB_URL must be set. Did you forget to provision a database?");
}
const sql = postgres(connectionString);
const db = drizzle(sql);

export class DatabaseStorage implements IStorage {
  private companyId: string;

  constructor(companyId: string = '550e8400-e29b-41d4-a716-446655440000') {
    this.companyId = companyId;
  }

  // Seed method removed - data should be seeded via migrations or admin interface

  // Companies
  async getCompany(id: string): Promise<Company | undefined> {
    try {
      const result = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.log('Database error getting company:', error);
      return undefined;
    }
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const result = await db.insert(companies).values(insertCompany).returning();
    return result[0];
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    try {
      const result = await db.select()
        .from(users)
        .leftJoin(companies, eq(users.companyId, companies.id))
        .where(eq(users.id, id))
        .limit(1);
      
      if (result[0]) {
        return {
          ...result[0].users,
          company: result[0].companies
        } as any;
      }
      return undefined;
    } catch (error) {
      console.log('Database error getting user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string, companyId?: string): Promise<User | undefined> {
    try {
      let query = db.select()
        .from(users)
        .leftJoin(companies, eq(users.companyId, companies.id))
        .where(eq(users.email, email));

      if (companyId) {
        query = query.where(and(eq(users.email, email), eq(users.companyId, companyId))) as any;
      }

      const result = await query.limit(1);
      
      if (result[0]) {
        return {
          ...result[0].users,
          company: result[0].companies
        } as any;
      }
      return undefined;
    } catch (error) {
      console.log('Database error getting user by email:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUserLastLogin(id: string): Promise<void> {
    try {
      await db.update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, id));
    } catch (error) {
      console.log('Database error updating user last login:', error);
    }
  }

  // Customers
  async getCustomers(companyId?: string): Promise<Customer[]> {
    if (companyId) {
      return await db.select().from(customers).where(eq(customers.companyId, companyId)).orderBy(desc(customers.createdAt));
    }
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getCustomersWithPetCount(companyId?: string): Promise<(Customer & { petCount: number })[]> {
    const query = db
      .select({
        id: customers.id,
        companyId: customers.companyId,
        name: customers.name,
        phone: customers.phone,
        email: customers.email,
        notes: customers.notes,
        address: customers.address,
        cep: customers.cep,
        city: customers.city,
        state: customers.state,
        neighborhood: customers.neighborhood,
        complement: customers.complement,
        createdAt: customers.createdAt,
        petCount: count(pets.id).as('petCount')
      })
      .from(customers)
      .leftJoin(pets, eq(customers.id, pets.customerId))
      .groupBy(customers.id)
      .orderBy(desc(customers.createdAt));

    if (companyId) {
      return await query.where(eq(customers.companyId, companyId));
    }
    return await query;
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    return result[0];
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const result = await db.insert(customers).values(insertCustomer).returning();
    return result[0];
  }

  async updateCustomer(id: string, customerUpdate: Partial<Customer>): Promise<Customer | undefined> {
    const result = await db.update(customers)
      .set(customerUpdate)
      .where(eq(customers.id, id))
      .returning();
    return result[0];
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const result = await db.delete(customers).where(eq(customers.id, id));
    return result.rowCount > 0;
  }

  // Pets
  async getAllPets(): Promise<Pet[]> {
    return await db.select().from(pets);
  }

  async getPets(companyId?: string): Promise<(Pet & { customerName?: string })[]> {
    try {
      let query = db.select({
        id: pets.id,
        customerId: pets.customerId,
        name: pets.name,
        species: pets.species,
        breed: pets.breed,
        weight: pets.weight,
        birthDate: pets.birthDate,
        gender: pets.gender,
        color: pets.color,
        specialNeeds: pets.specialNeeds,
        preferredFood: pets.preferredFood,
        notes: pets.notes,
        imageUrl: pets.imageUrl,
        createdAt: pets.createdAt,
        updatedAt: pets.updatedAt,
        customerName: customers.name,
      })
      .from(pets)
      .leftJoin(customers, eq(pets.customerId, customers.id));

      if (companyId) {
        query = query.where(eq(customers.companyId, companyId));
      }
      
      const result = await query.orderBy(desc(pets.createdAt));
      return result as (Pet & { customerName?: string })[];
    } catch (error) {
      console.error('Database error getting pets:', error);
      return [];
    }
  }

  async getPetsByCustomer(customerId: string): Promise<Pet[]> {
    try {
      return await db.select().from(pets).where(eq(pets.customerId, customerId));
    } catch (error) {
      console.log('Database error:', error);
      return [];
    }
  }

  async createPet(insertPet: InsertPet): Promise<Pet> {
    const petData = {
      ...insertPet,
      id: undefined, // Let DB generate
      weight: insertPet.weight ? parseFloat(insertPet.weight.toString()) : null,
      birthDate: insertPet.birthDate ? new Date(insertPet.birthDate) : null,
    };
    const result = await db.insert(pets).values(petData).returning();
    return result[0];
  }

  async updatePet(id: string, petUpdate: Partial<Pet>): Promise<Pet | null> {
    try {
      const updateData = {
        ...petUpdate,
        weight: petUpdate.weight ? parseFloat(petUpdate.weight.toString()) : null,
        birthDate: petUpdate.birthDate ? new Date(petUpdate.birthDate) : null,
        updatedAt: new Date(),
      };
      const result = await db.update(pets)
        .set(updateData)
        .where(eq(pets.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.log('Database error updating pet:', error);
      return null;
    }
  }

  async deletePet(id: string): Promise<boolean> {
    try {
      const result = await db.delete(pets)
        .where(eq(pets.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.log('Database error deleting pet:', error);
      return false;
    }
  }

  // Services
  async getServices(): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.active, true));
  }

  async createService(insertService: InsertService): Promise<Service> {
    const result = await db.insert(services).values(insertService).returning();
    return result[0];
  }

  async updateService(id: string, serviceUpdate: Partial<Service>): Promise<Service | undefined> {
    const result = await db.update(services)
      .set(serviceUpdate)
      .where(eq(services.id, id))
      .returning();
    return result[0];
  }

  // Package Types
  async getPackageTypes(): Promise<PackageType[]> {
    return await db.select().from(packageTypes).where(eq(packageTypes.active, true));
  }

  async getPackageType(id: string): Promise<PackageType | undefined> {
    const result = await db.select().from(packageTypes).where(eq(packageTypes.id, id)).limit(1);
    return result[0];
  }

  async createPackageType(insertPackageType: InsertPackageType): Promise<PackageType> {
    const result = await db.insert(packageTypes).values(insertPackageType).returning();
    return result[0];
  }

  async updatePackageType(id: string, packageTypeUpdate: Partial<PackageType>): Promise<PackageType | undefined> {
    const result = await db.update(packageTypes)
      .set(packageTypeUpdate)
      .where(eq(packageTypes.id, id))
      .returning();
    return result[0];
  }

  async deletePackageType(id: string): Promise<boolean> {
    const result = await db.update(packageTypes)
      .set({ active: false })
      .where(eq(packageTypes.id, id))
      .returning();
    return result.length > 0;
  }

  // Customer Packages
  async getCustomerPackages(): Promise<any[]> {
    try {
      const result = await db.select({
        id: customerPackages.id,
        customerName: customers.name,
        packageTypeName: packageTypes.name,
        purchaseDate: customerPackages.acquiredAt,
        expiryDate: customerPackages.validUntil,
        remainingUses: customerPackages.remainingUses,
        totalUses: packageTypes.totalUses,
        status: customerPackages.status,
        customerId: customerPackages.customerId,
        packageTypeId: customerPackages.packageTypeId
      })
      .from(customerPackages)
      .leftJoin(customers, eq(customerPackages.customerId, customers.id))
      .leftJoin(packageTypes, eq(customerPackages.packageTypeId, packageTypes.id))
      .orderBy(desc(customerPackages.acquiredAt));
      
      console.log('Customer packages fetched:', result.length);
      return result;
    } catch (error) {
      console.error('Error fetching customer packages:', error);
      return [];
    }
  }

  // Package Analytics
  async getPackageAnalytics(): Promise<any> {
    try {
      // Get package types with active clients and revenue
      const packageTypesQuery = await db
        .select({
          id: packageTypes.id,
          name: packageTypes.name,
          price: packageTypes.price,
          totalUses: packageTypes.totalUses,
          activeClients: count(customerPackages.id).as('activeClients'),
          totalRevenue: sum(customerPackages.purchasePrice).as('totalRevenue'),
          usedCount: sum(sql`${packageTypes.totalUses} - ${customerPackages.remainingUses}`).as('usedCount'),
          totalPossibleUses: sum(packageTypes.totalUses).as('totalPossibleUses')
        })
        .from(packageTypes)
        .leftJoin(customerPackages, and(
          eq(packageTypes.id, customerPackages.packageTypeId),
          eq(customerPackages.status, 'ativo')
        ))
        .where(eq(packageTypes.active, true))
        .groupBy(packageTypes.id);

      // Calculate average usage for each package type
      const packageAnalytics = packageTypesQuery.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        price: pkg.price,
        activeClients: pkg.activeClients,
        totalRevenue: Number(pkg.totalRevenue) || 0,
        averageUsage: pkg.totalPossibleUses ? Math.round((Number(pkg.usedCount) / Number(pkg.totalPossibleUses)) * 100) : 0
      }));

      // Get most used services (mock data for now - would need service usage tracking)
      const mostUsedServices = [
        { serviceName: "Banho e Tosa", usageCount: 45, percentage: 35 },
        { serviceName: "Apenas Banho", usageCount: 38, percentage: 30 },
        { serviceName: "Corte de Unhas", usageCount: 25, percentage: 20 },
        { serviceName: "Limpeza de Ouvidos", usageCount: 19, percentage: 15 }
      ];

      // Overall statistics
      const totalActivePackages = await db
        .select({ count: count() })
        .from(customerPackages)
        .where(eq(customerPackages.status, 'ativo'));

      const totalActiveClients = await db
        .select({ count: count(customers.id) })
        .from(customers)
        .innerJoin(customerPackages, eq(customers.id, customerPackages.customerId))
        .where(eq(customerPackages.status, 'ativo'));

      const totalRevenue = packageAnalytics.reduce((sum, pkg) => sum + pkg.totalRevenue, 0);
      const averageUtilization = packageAnalytics.length > 0 
        ? Math.round(packageAnalytics.reduce((sum, pkg) => sum + pkg.averageUsage, 0) / packageAnalytics.length)
        : 0;

      return {
        packageTypes: packageAnalytics,
        mostUsedServices,
        overallStats: {
          totalActivePackages: totalActivePackages[0]?.count || 0,
          totalActiveClients: totalActiveClients[0]?.count || 0,
          averagePackageUtilization: averageUtilization,
          monthlyRecurringRevenue: totalRevenue
        }
      };
    } catch (error) {
      console.error('Error fetching package analytics:', error);
      return {
        packageTypes: [],
        mostUsedServices: [],
        overallStats: {
          totalActivePackages: 0,
          totalActiveClients: 0,
          averagePackageUtilization: 0,
          monthlyRecurringRevenue: 0
        }
      };
    }
  }

  async getCustomerPackagesByCustomer(customerId: string): Promise<CustomerPackage[]> {
    return await db.select().from(customerPackages).where(eq(customerPackages.customerId, customerId));
  }

  async getActivePackages(): Promise<CustomerPackage[]> {
    const now = new Date();
    return await db.select().from(customerPackages).where(
      and(
        eq(customerPackages.status, "ativo"),
        gte(customerPackages.validUntil, now),
        gte(customerPackages.remainingUses, 1)
      )
    );
  }

  async createCustomerPackage(insertCustomerPackage: InsertCustomerPackage): Promise<CustomerPackage> {
    const result = await db.insert(customerPackages).values(insertCustomerPackage).returning();
    return result[0];
  }

  async updateCustomerPackage(id: string, packageUpdate: Partial<CustomerPackage>): Promise<CustomerPackage | undefined> {
    const result = await db.update(customerPackages)
      .set(packageUpdate)
      .where(eq(customerPackages.id, id))
      .returning();
    return result[0];
  }

  async renewPackage(packageId: string): Promise<CustomerPackage> {
    const originalPackage = await db.select().from(customerPackages)
      .where(eq(customerPackages.id, packageId))
      .limit(1);
    
    if (!originalPackage[0]) throw new Error("Package not found");

    const packageType = await db.select().from(packageTypes)
      .where(eq(packageTypes.id, originalPackage[0].packageTypeId))
      .limit(1);
    
    if (!packageType[0]) throw new Error("Package type not found");

    // Mark original as renewed
    await this.updateCustomerPackage(packageId, { status: "renewed" });

    // Create new package
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + packageType[0].validityDays);

    return this.createCustomerPackage({
      customerId: originalPackage[0].customerId,
      packageTypeId: originalPackage[0].packageTypeId,
      remainingUses: packageType[0].totalUses,
      validUntil,
      status: "ativo",
      renewedFromId: packageId,
      purchasePrice: packageType[0].price,
    });
  }

  // Package Usage
  async createPackageUsage(insertUsage: InsertPackageUsage): Promise<PackageUsage> {
    const result = await db.insert(packageUsages).values(insertUsage).returning();

    // Update package remaining uses
    const customerPackage = await db.select().from(customerPackages)
      .where(eq(customerPackages.id, insertUsage.customerPackageId))
      .limit(1);
      
    if (customerPackage[0]) {
      const newRemainingUses = customerPackage[0].remainingUses - 1;
      const newStatus = newRemainingUses <= 0 ? "consumido" : "ativo";
      await this.updateCustomerPackage(insertUsage.customerPackageId, {
        remainingUses: newRemainingUses,
        status: newStatus
      });
    }

    return result[0];
  }

  async getPackageUsages(packageId: string): Promise<PackageUsage[]> {
    return await db.select().from(packageUsages)
      .where(eq(packageUsages.customerPackageId, packageId));
  }

  // Users Management
  async getUsers(): Promise<User[]> {
    try {
      const allUsers = await db.select().from(users).where(eq(users.companyId, this.companyId));
      return allUsers;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async createUser(userData: any): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      if (!this.companyId) {
        throw new Error('CompanyId é obrigatório');
      }
      
      const [user] = await db
        .insert(users)
        .values({
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          isActive: userData.isActive !== undefined ? userData.isActive : true,
          companyId: this.companyId,
        })
        .returning();
      
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async toggleUserStatus(userId: string, isActive: boolean): Promise<User> {
    try {
      const [user] = await db
        .update(users)
        .set({ isActive, updatedAt: new Date() })
        .where(and(eq(users.id, userId), eq(users.companyId, this.companyId)))
        .returning();
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      
      return user;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const result = await db
        .delete(users)
        .where(and(eq(users.id, userId), eq(users.companyId, this.companyId)));
      
      console.log('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Appointments
  async getAppointments(): Promise<any[]> {
    try {
      // First get all appointments using basic Drizzle queries
      const allAppointments = await db.select().from(appointments).orderBy(appointments.scheduledDate);
      
      // Fetch related data for each appointment
      const appointmentsWithDetails = await Promise.all(
        allAppointments.map(async (appointment) => {
          const [customer] = await db.select().from(customers).where(eq(customers.id, appointment.customerId));
          const [pet] = await db.select().from(pets).where(eq(pets.id, appointment.petId));
          const [service] = await db.select().from(services).where(eq(services.id, appointment.serviceId));
          
          return {
            ...appointment,
            customerName: customer?.name || 'Cliente não encontrado',
            petName: pet?.name || 'Pet não encontrado',
            serviceName: service?.name || 'Serviço não encontrado',
            servicePrice: service?.basePrice || 0,
            serviceDuration: service?.estimatedDuration || 0
          };
        })
      );

      console.log('Appointments fetched from database:', appointmentsWithDetails.length);
      return appointmentsWithDetails;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  }

  async getAppointmentStats(): Promise<{ 
    today: number; 
    thisWeek: number; 
    pending: number; 
    occupancyRate: number; 
  }> {
    try {
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfToday = new Date(startOfToday);
      endOfToday.setDate(endOfToday.getDate() + 1);

      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      // Count appointments for different periods
      const todayAppointments = await db.select().from(appointments)
        .where(and(
          gte(appointments.scheduledDate, startOfToday),
          lte(appointments.scheduledDate, endOfToday)
        ));

      const weekAppointments = await db.select().from(appointments)
        .where(and(
          gte(appointments.scheduledDate, startOfWeek),
          lte(appointments.scheduledDate, endOfWeek)
        ));

      const pendingAppointments = await db.select().from(appointments)
        .where(
          eq(appointments.status, 'agendado')
        );

      // Calculate occupancy rate (assuming 10 hours * 4 slots per hour = 40 slots per day)
      const availableSlots = 40;
      const todayCount = todayAppointments.length;
      const occupancyRate = availableSlots > 0 ? Math.round((todayCount / availableSlots) * 100) : 0;

      return {
        today: todayCount,
        thisWeek: weekAppointments.length,
        pending: pendingAppointments.length,
        occupancyRate
      };
    } catch (error) {
      console.error('Error calculating appointment stats:', error);
      return { today: 0, thisWeek: 0, pending: 0, occupancyRate: 0 };
    }
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const result = await db.insert(appointments).values(insertAppointment).returning();
    return result[0];
  }

  async updateAppointment(id: string, appointmentUpdate: Partial<Appointment>): Promise<Appointment | undefined> {
    const result = await db.update(appointments)
      .set(appointmentUpdate)
      .where(eq(appointments.id, id))
      .returning();
    return result[0];
  }

  async deleteAppointment(id: string): Promise<boolean> {
    try {
      const result = await db.delete(appointments)
        .where(eq(appointments.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting appointment:', error);
      return false;
    }
  }

  // Notifications
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications).values(insertNotification).returning();
    return result[0];
  }

  async getNotifications(customerId?: string): Promise<Notification[]> {
    if (customerId) {
      return await db.select().from(notifications)
        .where(eq(notifications.customerId, customerId));
    }
    return await db.select().from(notifications);
  }

  // Dashboard specific methods
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Count active packages
      const activePackagesResult = await db.select().from(customerPackages).where(eq(customerPackages.status, 'ativo'));
      const activePackages = activePackagesResult.length;

      // Count renewals this month (packages acquired this month)
      const renewalsResult = await db.select().from(customerPackages).where(
        and(
          gte(customerPackages.acquiredAt, monthStart),
          eq(customerPackages.status, 'ativo')
        )
      );
      const renewalsThisMonth = renewalsResult.length;

      // Calculate churn rate (expired packages vs total packages)
      const totalPackagesResult = await db.select().from(customerPackages);
      const totalPackages = totalPackagesResult.length;

      const expiredPackagesResult = await db.select().from(customerPackages).where(eq(customerPackages.status, 'expirado'));
      const expiredPackages = expiredPackagesResult.length;

      const churnRate = totalPackages > 0 ? (expiredPackages / totalPackages) * 100 : 0;

      // Clients at risk: packages expiring in 15 days or less
      const riskDate = new Date();
      riskDate.setDate(riskDate.getDate() + 15);
      
      const riskyClientsResult = await db.select().from(customerPackages).where(
        and(
          eq(customerPackages.status, 'ativo'),
          lte(customerPackages.validUntil, riskDate)
        )
      );
      const riskyClients = riskyClientsResult.length;

      console.log('Dashboard metrics calculated:', {
        activePackages,
        renewalsThisMonth,
        churnRate: Number(churnRate.toFixed(1)),
        riskyClients,
      });

      return {
        activePackages,
        renewalsThisMonth,
        churnRate: Number(churnRate.toFixed(1)),
        riskyClients,
      };
    } catch (error) {
      console.error('Database error calculating metrics:', error);
      return {
        activePackages: 0,
        renewalsThisMonth: 0,
        churnRate: 0,
        riskyClients: 0,
      };
    }
  }

  async getActionQueue(): Promise<ActionQueueItem[]> {
    try {
      const items: ActionQueueItem[] = [];
      const now = new Date();
      
      // Get packages that need attention
      const activePackages = await this.getActivePackages();
      
      for (const pkg of activePackages) {
        const customer = await this.getCustomer(pkg.customerId);
        const petsResult = await this.getPetsByCustomer(pkg.customerId);
        const usages = await this.getPackageUsages(pkg.id);
        
        if (!customer || petsResult.length === 0) continue;

        const pet = petsResult[0]; // Take first pet for simplicity
        const daysTillExpiry = Math.ceil((pkg.validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const lastUsage = usages.sort((a, b) => {
          const aTime = a.usedAt ? a.usedAt.getTime() : 0;
          const bTime = b.usedAt ? b.usedAt.getTime() : 0;
          return bTime - aTime;
        })[0];
        const daysSinceLastUse = lastUsage && lastUsage.usedAt
          ? Math.floor((now.getTime() - lastUsage.usedAt.getTime()) / (1000 * 60 * 60 * 24))
          : 999;

        let priority: "high" | "medium" | "low" = "low";
        let reason = "";

        if (daysTillExpiry <= 3) {
          priority = "high";
          reason = `Pacote expira em ${daysTillExpiry} dias`;
        } else if (pkg.remainingUses <= 1) {
          priority = "medium";
          reason = `Saldo: ${pkg.remainingUses} uso restante`;
        } else if (daysSinceLastUse >= 25) {
          priority = "low";
          reason = `Inativo há ${daysSinceLastUse} dias`;
        } else {
          continue; // Skip if no action needed
        }

        items.push({
          id: pkg.id,
          customerId: customer.id,
          customerName: customer.name,
          petName: pet.name,
          petBreed: pet.breed || pet.species,
          petImage: this.getPetImageUrl(pet.species),
          packageId: pkg.id,
          priority,
          reason,
          expiresIn: daysTillExpiry > 0 ? daysTillExpiry : undefined,
          remainingUses: pkg.remainingUses,
          lastUsedDays: daysSinceLastUse < 999 ? daysSinceLastUse : undefined,
        });
      }

      // Sort by priority
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return items.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    } catch (error) {
      console.error('Database error in getActionQueue:', error);
      throw error;
    }
  }

  private getPetImageUrl(species: string): string {
    const images = {
      dog: "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60",
      cat: "https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60",
    };
    return images[species as keyof typeof images] || images.dog;
  }

  async getRecentActivity(): Promise<any[]> {
    try {
      const activities = [];
      
      // Get recent package usages
      const recentUsages = await db.select().from(packageUsages)
        .orderBy(desc(packageUsages.usedAt))
        .limit(5);

      for (const usage of recentUsages) {
        const customerPackage = await db.select().from(customerPackages)
          .where(eq(customerPackages.id, usage.customerPackageId))
          .limit(1);
          
        const customer = customerPackage[0] ? await this.getCustomer(customerPackage[0].customerId) : null;
        const pet = await db.select().from(pets).where(eq(pets.id, usage.petId)).limit(1);
        const service = await db.select().from(services).where(eq(services.id, usage.serviceId)).limit(1);

        if (customer && pet[0] && service[0] && usage.usedAt) {
          activities.push({
            type: "package_used",
            title: "Pacote usado",
            description: `${pet[0].name} (${pet[0].breed || pet[0].species})`,
            details: `${service[0].name} • ${this.formatTimeAgo(usage.usedAt)}`,
            icon: "check",
            color: "green",
          });
        }
      }

      return activities;
    } catch (error) {
      console.error('Database error in getRecentActivity:', error);
      throw error;
    }
  }

  async getRevenueByService(): Promise<any[]> {
    try {
      // Get all active packages with their types
      const packagesWithTypes = await db.select({
        packageTypeName: packageTypes.name,
        purchasePrice: customerPackages.purchasePrice
      })
      .from(customerPackages)
      .leftJoin(packageTypes, eq(customerPackages.packageTypeId, packageTypes.id))
      .where(eq(customerPackages.status, 'ativo'));

      // Group and sum revenues manually
      const revenueMap = new Map<string, { revenue: number, count: number }>();
      
      for (const pkg of packagesWithTypes) {
        const name = pkg.packageTypeName || 'Pacote Desconhecido';
        const price = Number(pkg.purchasePrice || 0);
        
        if (revenueMap.has(name)) {
          const current = revenueMap.get(name)!;
          revenueMap.set(name, {
            revenue: current.revenue + price,
            count: current.count + 1
          });
        } else {
          revenueMap.set(name, { revenue: price, count: 1 });
        }
      }

      const revenues = Array.from(revenueMap.entries()).map(([name, data]) => ({
        name,
        revenue: data.revenue,
        color: this.getServiceColor(name),
        packages: data.count
      }));

      console.log('Revenue by service calculated:', revenues);
      return revenues.sort((a, b) => b.revenue - a.revenue);
    } catch (error) {
      console.error('Database error calculating revenue by service:', error);
      return [];
    }
  }

  private getServiceColor(serviceName: string): string {
    const colors: Record<string, string> = {
      "Banho & Tosa": "blue",
      "Tosa Higiênica": "green", 
      "Corte de Unhas": "purple",
      "Hidratação": "orange",
      "Pacote Básico": "blue",
      "Pacote Premium": "purple",
      "Pacote Completo": "green",
      "Pacote Teste": "orange",
    };
    
    // Generate color based on hash if not found
    if (!colors[serviceName]) {
      const colorOptions = ["blue", "green", "orange", "purple", "red", "yellow", "pink", "gray"];
      const hash = serviceName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return colorOptions[hash % colorOptions.length];
    }
    
    return colors[serviceName];
  }

  private formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "há poucos minutos";
    if (diffInHours < 24) return `há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;
  }
}

export const storage = new DatabaseStorage();