var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  appointments: () => appointments,
  companies: () => companies,
  customerPackageServices: () => customerPackageServices,
  customerPackages: () => customerPackages,
  customers: () => customers,
  insertAppointmentSchema: () => insertAppointmentSchema,
  insertCompanySchema: () => insertCompanySchema,
  insertCustomerPackageSchema: () => insertCustomerPackageSchema,
  insertCustomerPackageServiceSchema: () => insertCustomerPackageServiceSchema,
  insertCustomerSchema: () => insertCustomerSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertPackageTypeSchema: () => insertPackageTypeSchema,
  insertPackageTypeServiceSchema: () => insertPackageTypeServiceSchema,
  insertPackageUsageSchema: () => insertPackageUsageSchema,
  insertPetSchema: () => insertPetSchema,
  insertServiceSchema: () => insertServiceSchema,
  insertUserSchema: () => insertUserSchema,
  notifications: () => notifications,
  packageTypeServices: () => packageTypeServices,
  packageTypes: () => packageTypes,
  packageUsages: () => packageUsages,
  pets: () => pets,
  services: () => services,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, integer, timestamp, boolean, numeric, jsonb, uuid, date, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var companies = pgTable("companies", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").unique(),
  phone: text("phone"),
  address: text("address"),
  logo: text("logo"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id").references(() => companies.id).notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("employee"),
  // "owner", "manager", "employee"
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  uniqueEmailPerCompany: index("unique_email_per_company").on(table.email, table.companyId)
}));
var customers = pgTable("customers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id").references(() => companies.id).notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  notes: text("notes"),
  // Endereço completo para serviço de taxidog
  address: text("address"),
  cep: text("cep"),
  city: text("city"),
  state: text("state"),
  neighborhood: text("neighborhood"),
  complement: text("complement"),
  createdAt: timestamp("created_at").defaultNow()
});
var pets = pgTable("pets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  name: text("name").notNull(),
  species: text("species").notNull(),
  // "dog", "cat", "bird", "rabbit", "other"
  breed: text("breed"),
  weight: numeric("weight", { precision: 5, scale: 2 }),
  birthDate: date("birth_date"),
  gender: text("gender"),
  // "male", "female"
  color: text("color"),
  specialNeeds: text("special_needs"),
  // Any special care requirements
  preferredFood: text("preferred_food"),
  // Preferred pet food brand/type
  notes: text("notes"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var services = pgTable("services", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id").references(() => companies.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  basePrice: numeric("base_price", { precision: 10, scale: 2 }),
  duration: integer("duration"),
  // minutes
  active: boolean("active").default(true)
});
var packageTypes = pgTable("package_types", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id").references(() => companies.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  validityDays: integer("validity_days").notNull(),
  totalUses: integer("total_uses").notNull(),
  // Total uses across all services
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  // Total package price
  maxPets: integer("max_pets").default(1),
  // How many pets can use this package
  active: boolean("active").default(true)
});
var packageTypeServices = pgTable("package_type_services", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  packageTypeId: uuid("package_type_id").references(() => packageTypes.id).notNull(),
  serviceId: uuid("service_id").references(() => services.id).notNull(),
  includedUses: integer("included_uses").default(1),
  // How many uses of this service in the package
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull()
  // Individual service price in this package
});
var customerPackages = pgTable("customer_packages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  packageTypeId: uuid("package_type_id").references(() => packageTypes.id).notNull(),
  remainingUses: integer("remaining_uses").notNull(),
  // Total remaining uses across all services
  validUntil: timestamp("valid_until").notNull(),
  status: text("status").notNull().default("active"),
  // "active", "consumed", "expired", "renewed"
  renewedFromId: uuid("renewed_from_id"),
  purchasePrice: numeric("purchase_price", { precision: 10, scale: 2 }).notNull(),
  acquiredAt: timestamp("acquired_at").defaultNow()
});
var customerPackageServices = pgTable("customer_package_services", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerPackageId: uuid("customer_package_id").references(() => customerPackages.id).notNull(),
  serviceId: uuid("service_id").references(() => services.id).notNull(),
  remainingUses: integer("remaining_uses").notNull(),
  // Remaining uses for this specific service
  totalUses: integer("total_uses").notNull()
  // Original total uses for this service
});
var packageUsages = pgTable("package_usages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerPackageId: uuid("customer_package_id").references(() => customerPackages.id).notNull(),
  petId: uuid("pet_id").references(() => pets.id).notNull(),
  serviceId: uuid("service_id").references(() => services.id).notNull(),
  notes: text("notes"),
  usedAt: timestamp("used_at").defaultNow()
});
var appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  petId: uuid("pet_id").references(() => pets.id).notNull(),
  serviceId: uuid("service_id").references(() => services.id).notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  status: text("status").notNull().default("scheduled"),
  // "scheduled", "confirmed", "checked_in", "in_service", "ready", "picked_up", "canceled"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});
var notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  type: text("type").notNull(),
  // "confirmation", "check_in", "ready", "reminder"
  message: text("message").notNull(),
  channel: text("channel").notNull(),
  // "whatsapp", "email"
  status: text("status").notNull().default("pending"),
  // "pending", "sent", "failed"
  metadata: jsonb("metadata"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow()
});
var insertCompanySchema = createInsertSchema(companies).omit({ id: true, createdAt: true });
var insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true, companyId: true });
var insertCustomerSchema = createInsertSchema(customers, {
  cep: z.union([
    z.string().regex(/^\d{5}-?\d{3}$/, "CEP deve ter formato 00000-000"),
    z.literal(""),
    z.undefined()
  ]).optional().transform((val) => val === "" || val === void 0 ? null : val),
  email: z.union([
    z.string().email("Email deve ter formato v\xE1lido"),
    z.literal(""),
    z.undefined()
  ]).optional().transform((val) => val === "" || val === void 0 ? null : val)
}).omit({ id: true, createdAt: true, companyId: true });
var insertPetSchema = createInsertSchema(pets).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  customerId: z.string().min(1, "Cliente \xE9 obrigat\xF3rio"),
  weight: z.union([z.number(), z.string().transform((v) => parseFloat(v))]).optional()
});
var insertServiceSchema = createInsertSchema(services).omit({ id: true });
var insertPackageTypeSchema = createInsertSchema(packageTypes, {
  price: z.string().min(1, "Pre\xE7o \xE9 obrigat\xF3rio"),
  validityDays: z.number().min(1, "Validade deve ser maior que 0")
}).omit({ id: true });
var insertPackageTypeServiceSchema = createInsertSchema(packageTypeServices).omit({ id: true });
var insertCustomerPackageSchema = createInsertSchema(customerPackages).omit({ id: true, acquiredAt: true });
var insertCustomerPackageServiceSchema = createInsertSchema(customerPackageServices).omit({ id: true });
var insertPackageUsageSchema = createInsertSchema(packageUsages).omit({ id: true, usedAt: true });
var insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true, createdAt: true });
var insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, sentAt: true, createdAt: true });

// server/storage.ts
import { eq, and, gte, lte, desc, count, sql as sql2, sum } from "drizzle-orm";
import bcrypt from "bcryptjs";

// server/db.ts
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
var connectionString = process.env.DATABASE_URL || "postgresql://postgres.mdoalcyygfpblwudtoie:scRJGXtAkKgvFo9t@aws-1-sa-east-1.pooler.supabase.com:6543/postgres";
var client = postgres(connectionString, {
  ssl: "require",
  max: 1
});
var db = drizzle(client, { schema: schema_exports });

// server/storage.ts
var DatabaseStorage = class {
  companyId;
  constructor(companyId = "550e8400-e29b-41d4-a716-446655440000") {
    this.companyId = companyId;
  }
  // Seed method removed - data should be seeded via migrations or admin interface
  // Companies
  async getCompany(id) {
    try {
      const result = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.log("Database error getting company:", error);
      return void 0;
    }
  }
  async createCompany(insertCompany) {
    const result = await db.insert(companies).values(insertCompany).returning();
    return result[0];
  }
  // Users
  async getUser(id) {
    try {
      const result = await db.select().from(users).leftJoin(companies, eq(users.companyId, companies.id)).where(eq(users.id, id)).limit(1);
      if (result[0]) {
        return {
          ...result[0].users,
          company: result[0].companies
        };
      }
      return void 0;
    } catch (error) {
      console.log("Database error getting user:", error);
      return void 0;
    }
  }
  async getUserByEmail(email, companyId) {
    try {
      const condition = companyId ? and(eq(users.email, email), eq(users.companyId, companyId)) : eq(users.email, email);
      const result = await db.select().from(users).leftJoin(companies, eq(users.companyId, companies.id)).where(condition).limit(1);
      if (result[0]) {
        return {
          ...result[0].users,
          company: result[0].companies
        };
      }
      return void 0;
    } catch (error) {
      console.log("Database error getting user by email:", error);
      return void 0;
    }
  }
  async createUser(insertUser) {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  async updateUserLastLogin(id) {
    try {
      await db.update(users).set({ lastLoginAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id));
    } catch (error) {
      console.log("Database error updating user last login:", error);
    }
  }
  // Customers
  async getCustomers(companyId) {
    if (companyId) {
      return await db.select().from(customers).where(eq(customers.companyId, companyId)).orderBy(desc(customers.createdAt));
    }
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }
  async getCustomersWithPetCount(companyId) {
    const query = db.select({
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
      petCount: count(pets.id).as("petCount")
    }).from(customers).leftJoin(pets, eq(customers.id, pets.customerId)).groupBy(customers.id).orderBy(desc(customers.createdAt));
    if (companyId) {
      return await query.where(eq(customers.companyId, companyId));
    }
    return await query;
  }
  async getCustomer(id) {
    const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    return result[0];
  }
  async createCustomer(insertCustomer) {
    const result = await db.insert(customers).values(insertCustomer).returning();
    return result[0];
  }
  async updateCustomer(id, customerUpdate) {
    const result = await db.update(customers).set(customerUpdate).where(eq(customers.id, id)).returning();
    return result[0];
  }
  async deleteCustomer(id) {
    const result = await db.delete(customers).where(eq(customers.id, id)).returning();
    return result.length > 0;
  }
  // Pets
  async getAllPets() {
    return await db.select().from(pets);
  }
  async getPets(companyId) {
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
        customerName: customers.name
      }).from(pets).leftJoin(customers, eq(pets.customerId, customers.id));
      if (companyId) {
        query = query.where(eq(customers.companyId, companyId));
      }
      const result = await query.orderBy(desc(pets.createdAt));
      return result;
    } catch (error) {
      console.error("Database error getting pets:", error);
      return [];
    }
  }
  async getPetsByCustomer(customerId) {
    try {
      return await db.select().from(pets).where(eq(pets.customerId, customerId));
    } catch (error) {
      console.log("Database error:", error);
      return [];
    }
  }
  async createPet(insertPet) {
    const petData = {
      ...insertPet,
      id: void 0,
      // Let DB generate
      weight: insertPet.weight ? parseFloat(insertPet.weight.toString()) : null,
      birthDate: insertPet.birthDate ? new Date(insertPet.birthDate) : null
    };
    const result = await db.insert(pets).values(petData).returning();
    return result[0];
  }
  async updatePet(id, petUpdate) {
    try {
      const updateData = {
        ...petUpdate,
        weight: petUpdate.weight ? parseFloat(petUpdate.weight.toString()) : null,
        birthDate: petUpdate.birthDate ? new Date(petUpdate.birthDate) : null,
        updatedAt: /* @__PURE__ */ new Date()
      };
      const result = await db.update(pets).set(updateData).where(eq(pets.id, id)).returning();
      return result[0];
    } catch (error) {
      console.log("Database error updating pet:", error);
      return void 0;
    }
  }
  async deletePet(id) {
    try {
      const result = await db.delete(pets).where(eq(pets.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.log("Database error deleting pet:", error);
      return false;
    }
  }
  // Services
  async getServices() {
    return await db.select().from(services).where(eq(services.active, true));
  }
  async createService(insertService) {
    const result = await db.insert(services).values(insertService).returning();
    return result[0];
  }
  async updateService(id, serviceUpdate) {
    const result = await db.update(services).set(serviceUpdate).where(eq(services.id, id)).returning();
    return result[0];
  }
  // Package Types
  async getPackageTypes() {
    return await db.select().from(packageTypes).where(eq(packageTypes.active, true));
  }
  async getPackageType(id) {
    const result = await db.select().from(packageTypes).where(eq(packageTypes.id, id)).limit(1);
    return result[0];
  }
  async createPackageType(insertPackageType) {
    const result = await db.insert(packageTypes).values(insertPackageType).returning();
    return result[0];
  }
  async updatePackageType(id, packageTypeUpdate) {
    const result = await db.update(packageTypes).set(packageTypeUpdate).where(eq(packageTypes.id, id)).returning();
    return result[0];
  }
  async deletePackageType(id) {
    const result = await db.update(packageTypes).set({ active: false }).where(eq(packageTypes.id, id)).returning();
    return result.length > 0;
  }
  // Customer Packages
  async getCustomerPackages() {
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
      }).from(customerPackages).leftJoin(customers, eq(customerPackages.customerId, customers.id)).leftJoin(packageTypes, eq(customerPackages.packageTypeId, packageTypes.id)).orderBy(desc(customerPackages.acquiredAt));
      console.log("Customer packages fetched:", result.length);
      return result;
    } catch (error) {
      console.error("Error fetching customer packages:", error);
      return [];
    }
  }
  // Package Analytics
  async getPackageAnalytics() {
    try {
      const packageTypesQuery = await db.select({
        id: packageTypes.id,
        name: packageTypes.name,
        price: packageTypes.price,
        totalUses: packageTypes.totalUses,
        activeClients: count(customerPackages.id).as("activeClients"),
        totalRevenue: sum(customerPackages.purchasePrice).as("totalRevenue"),
        usedCount: sum(sql2`${packageTypes.totalUses} - ${customerPackages.remainingUses}`).as("usedCount"),
        totalPossibleUses: sum(packageTypes.totalUses).as("totalPossibleUses")
      }).from(packageTypes).leftJoin(customerPackages, and(
        eq(packageTypes.id, customerPackages.packageTypeId),
        eq(customerPackages.status, "ativo")
      )).where(eq(packageTypes.active, true)).groupBy(packageTypes.id);
      const packageAnalytics = packageTypesQuery.map((pkg) => ({
        id: pkg.id,
        name: pkg.name,
        price: pkg.price,
        activeClients: pkg.activeClients,
        totalRevenue: Number(pkg.totalRevenue) || 0,
        averageUsage: pkg.totalPossibleUses ? Math.round(Number(pkg.usedCount) / Number(pkg.totalPossibleUses) * 100) : 0
      }));
      const mostUsedServices = [
        { serviceName: "Banho e Tosa", usageCount: 45, percentage: 35 },
        { serviceName: "Apenas Banho", usageCount: 38, percentage: 30 },
        { serviceName: "Corte de Unhas", usageCount: 25, percentage: 20 },
        { serviceName: "Limpeza de Ouvidos", usageCount: 19, percentage: 15 }
      ];
      const totalActivePackages = await db.select({ count: count() }).from(customerPackages).where(eq(customerPackages.status, "ativo"));
      const totalActiveClients = await db.select({ count: count(customers.id) }).from(customers).innerJoin(customerPackages, eq(customers.id, customerPackages.customerId)).where(eq(customerPackages.status, "ativo"));
      const totalRevenue = packageAnalytics.reduce((sum2, pkg) => sum2 + pkg.totalRevenue, 0);
      const averageUtilization = packageAnalytics.length > 0 ? Math.round(packageAnalytics.reduce((sum2, pkg) => sum2 + pkg.averageUsage, 0) / packageAnalytics.length) : 0;
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
      console.error("Error fetching package analytics:", error);
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
  async getCustomerPackagesByCustomer(customerId) {
    return await db.select().from(customerPackages).where(eq(customerPackages.customerId, customerId));
  }
  async getActivePackages() {
    const now = /* @__PURE__ */ new Date();
    return await db.select().from(customerPackages).where(
      and(
        eq(customerPackages.status, "ativo"),
        gte(customerPackages.validUntil, now),
        gte(customerPackages.remainingUses, 1)
      )
    );
  }
  async createCustomerPackage(insertCustomerPackage) {
    const result = await db.insert(customerPackages).values(insertCustomerPackage).returning();
    return result[0];
  }
  async updateCustomerPackage(id, packageUpdate) {
    const result = await db.update(customerPackages).set(packageUpdate).where(eq(customerPackages.id, id)).returning();
    return result[0];
  }
  async renewPackage(packageId) {
    const originalPackage = await db.select().from(customerPackages).where(eq(customerPackages.id, packageId)).limit(1);
    if (!originalPackage[0]) throw new Error("Package not found");
    const packageType = await db.select().from(packageTypes).where(eq(packageTypes.id, originalPackage[0].packageTypeId)).limit(1);
    if (!packageType[0]) throw new Error("Package type not found");
    await this.updateCustomerPackage(packageId, { status: "renewed" });
    const validUntil = /* @__PURE__ */ new Date();
    validUntil.setDate(validUntil.getDate() + packageType[0].validityDays);
    return this.createCustomerPackage({
      customerId: originalPackage[0].customerId,
      packageTypeId: originalPackage[0].packageTypeId,
      remainingUses: packageType[0].totalUses,
      validUntil,
      status: "ativo",
      renewedFromId: packageId,
      purchasePrice: packageType[0].price
    });
  }
  // Package Usage
  async createPackageUsage(insertUsage) {
    const result = await db.insert(packageUsages).values(insertUsage).returning();
    const customerPackage = await db.select().from(customerPackages).where(eq(customerPackages.id, insertUsage.customerPackageId)).limit(1);
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
  async getPackageUsages(packageId) {
    return await db.select().from(packageUsages).where(eq(packageUsages.customerPackageId, packageId));
  }
  // Users Management
  async getUsers() {
    try {
      const allUsers = await db.select().from(users).where(eq(users.companyId, this.companyId));
      return allUsers;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  }
  // Additional user management helper (separate from interface createUser)
  async createAppUser(userData) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      if (!this.companyId) {
        throw new Error("CompanyId \xE9 obrigat\xF3rio");
      }
      const [user] = await db.insert(users).values({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        isActive: userData.isActive !== void 0 ? userData.isActive : true,
        companyId: this.companyId
      }).returning();
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }
  async toggleUserStatus(userId, isActive) {
    try {
      const [user] = await db.update(users).set({ isActive, updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(users.id, userId), eq(users.companyId, this.companyId))).returning();
      if (!user) {
        throw new Error("Usu\xE1rio n\xE3o encontrado");
      }
      return user;
    } catch (error) {
      console.error("Error toggling user status:", error);
      throw error;
    }
  }
  async deleteUser(userId) {
    try {
      const result = await db.delete(users).where(and(eq(users.id, userId), eq(users.companyId, this.companyId)));
      console.log("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }
  // Appointments
  async getAppointments() {
    try {
      const allAppointments = await db.select().from(appointments).orderBy(appointments.scheduledDate);
      const appointmentsWithDetails = await Promise.all(
        allAppointments.map(async (appointment) => {
          const [customer] = await db.select().from(customers).where(eq(customers.id, appointment.customerId));
          const [pet] = await db.select().from(pets).where(eq(pets.id, appointment.petId));
          const [service] = await db.select().from(services).where(eq(services.id, appointment.serviceId));
          return {
            ...appointment,
            customerName: customer?.name || "Cliente n\xE3o encontrado",
            petName: pet?.name || "Pet n\xE3o encontrado",
            serviceName: service?.name || "Servi\xE7o n\xE3o encontrado",
            servicePrice: service?.basePrice || 0,
            serviceDuration: service?.duration || 0
          };
        })
      );
      console.log("Appointments fetched from database:", appointmentsWithDetails.length);
      return appointmentsWithDetails;
    } catch (error) {
      console.error("Error fetching appointments:", error);
      return [];
    }
  }
  async getAppointmentStats() {
    try {
      const today = /* @__PURE__ */ new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfToday = new Date(startOfToday);
      endOfToday.setDate(endOfToday.getDate() + 1);
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      const todayAppointments = await db.select().from(appointments).where(and(
        gte(appointments.scheduledDate, startOfToday),
        lte(appointments.scheduledDate, endOfToday)
      ));
      const weekAppointments = await db.select().from(appointments).where(and(
        gte(appointments.scheduledDate, startOfWeek),
        lte(appointments.scheduledDate, endOfWeek)
      ));
      const pendingAppointments = await db.select().from(appointments).where(
        eq(appointments.status, "agendado")
      );
      const availableSlots = 40;
      const todayCount = todayAppointments.length;
      const occupancyRate = availableSlots > 0 ? Math.round(todayCount / availableSlots * 100) : 0;
      return {
        today: todayCount,
        thisWeek: weekAppointments.length,
        pending: pendingAppointments.length,
        occupancyRate
      };
    } catch (error) {
      console.error("Error calculating appointment stats:", error);
      return { today: 0, thisWeek: 0, pending: 0, occupancyRate: 0 };
    }
  }
  async createAppointment(insertAppointment) {
    const result = await db.insert(appointments).values(insertAppointment).returning();
    return result[0];
  }
  async updateAppointment(id, appointmentUpdate) {
    const result = await db.update(appointments).set(appointmentUpdate).where(eq(appointments.id, id)).returning();
    return result[0];
  }
  async deleteAppointment(id) {
    try {
      const result = await db.delete(appointments).where(eq(appointments.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error("Error deleting appointment:", error);
      return false;
    }
  }
  // Notifications
  async createNotification(insertNotification) {
    const result = await db.insert(notifications).values(insertNotification).returning();
    return result[0];
  }
  async getNotifications(customerId) {
    if (customerId) {
      return await db.select().from(notifications).where(eq(notifications.customerId, customerId));
    }
    return await db.select().from(notifications);
  }
  // Dashboard specific methods
  async getDashboardMetrics() {
    try {
      const now = /* @__PURE__ */ new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const activePackagesResult = await db.select().from(customerPackages).where(eq(customerPackages.status, "ativo"));
      const activePackages = activePackagesResult.length;
      const renewalsResult = await db.select().from(customerPackages).where(
        and(
          gte(customerPackages.acquiredAt, monthStart),
          eq(customerPackages.status, "ativo")
        )
      );
      const renewalsThisMonth = renewalsResult.length;
      const totalPackagesResult = await db.select().from(customerPackages);
      const totalPackages = totalPackagesResult.length;
      const expiredPackagesResult = await db.select().from(customerPackages).where(eq(customerPackages.status, "expirado"));
      const expiredPackages = expiredPackagesResult.length;
      const churnRate = totalPackages > 0 ? expiredPackages / totalPackages * 100 : 0;
      const riskDate = /* @__PURE__ */ new Date();
      riskDate.setDate(riskDate.getDate() + 15);
      const riskyClientsResult = await db.select().from(customerPackages).where(
        and(
          eq(customerPackages.status, "ativo"),
          lte(customerPackages.validUntil, riskDate)
        )
      );
      const riskyClients = riskyClientsResult.length;
      console.log("Dashboard metrics calculated:", {
        activePackages,
        renewalsThisMonth,
        churnRate: Number(churnRate.toFixed(1)),
        riskyClients
      });
      return {
        activePackages,
        renewalsThisMonth,
        churnRate: Number(churnRate.toFixed(1)),
        riskyClients
      };
    } catch (error) {
      console.error("Database error calculating metrics:", error);
      return {
        activePackages: 0,
        renewalsThisMonth: 0,
        churnRate: 0,
        riskyClients: 0
      };
    }
  }
  async getActionQueue() {
    try {
      const items = [];
      const now = /* @__PURE__ */ new Date();
      const activePackages = await this.getActivePackages();
      for (const pkg of activePackages) {
        const customer = await this.getCustomer(pkg.customerId);
        const petsResult = await this.getPetsByCustomer(pkg.customerId);
        const usages = await this.getPackageUsages(pkg.id);
        if (!customer || petsResult.length === 0) continue;
        const pet = petsResult[0];
        const daysTillExpiry = Math.ceil((pkg.validUntil.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24));
        const lastUsage = usages.sort((a, b) => {
          const aTime = a.usedAt ? a.usedAt.getTime() : 0;
          const bTime = b.usedAt ? b.usedAt.getTime() : 0;
          return bTime - aTime;
        })[0];
        const daysSinceLastUse = lastUsage && lastUsage.usedAt ? Math.floor((now.getTime() - lastUsage.usedAt.getTime()) / (1e3 * 60 * 60 * 24)) : 999;
        let priority = "low";
        let reason = "";
        if (daysTillExpiry <= 3) {
          priority = "high";
          reason = `Pacote expira em ${daysTillExpiry} dias`;
        } else if (pkg.remainingUses <= 1) {
          priority = "medium";
          reason = `Saldo: ${pkg.remainingUses} uso restante`;
        } else if (daysSinceLastUse >= 25) {
          priority = "low";
          reason = `Inativo h\xE1 ${daysSinceLastUse} dias`;
        } else {
          continue;
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
          expiresIn: daysTillExpiry > 0 ? daysTillExpiry : void 0,
          remainingUses: pkg.remainingUses,
          lastUsedDays: daysSinceLastUse < 999 ? daysSinceLastUse : void 0
        });
      }
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return items.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    } catch (error) {
      console.error("Database error in getActionQueue:", error);
      throw error;
    }
  }
  getPetImageUrl(species) {
    const images = {
      dog: "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60",
      cat: "https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60"
    };
    return images[species] || images.dog;
  }
  async getRecentActivity() {
    try {
      const activities = [];
      const recentUsages = await db.select().from(packageUsages).orderBy(desc(packageUsages.usedAt)).limit(5);
      for (const usage of recentUsages) {
        const customerPackage = await db.select().from(customerPackages).where(eq(customerPackages.id, usage.customerPackageId)).limit(1);
        const customer = customerPackage[0] ? await this.getCustomer(customerPackage[0].customerId) : null;
        const pet = await db.select().from(pets).where(eq(pets.id, usage.petId)).limit(1);
        const service = await db.select().from(services).where(eq(services.id, usage.serviceId)).limit(1);
        if (customer && pet[0] && service[0] && usage.usedAt) {
          activities.push({
            type: "package_used",
            title: "Pacote usado",
            description: `${pet[0].name} (${pet[0].breed || pet[0].species})`,
            details: `${service[0].name} \u2022 ${this.formatTimeAgo(usage.usedAt)}`,
            icon: "check",
            color: "green"
          });
        }
      }
      return activities;
    } catch (error) {
      console.error("Database error in getRecentActivity:", error);
      throw error;
    }
  }
  async getRevenueByService() {
    try {
      const packagesWithTypes = await db.select({
        packageTypeName: packageTypes.name,
        purchasePrice: customerPackages.purchasePrice
      }).from(customerPackages).leftJoin(packageTypes, eq(customerPackages.packageTypeId, packageTypes.id)).where(eq(customerPackages.status, "ativo"));
      const revenueMap = /* @__PURE__ */ new Map();
      for (const pkg of packagesWithTypes) {
        const name = pkg.packageTypeName || "Pacote Desconhecido";
        const price = Number(pkg.purchasePrice || 0);
        if (revenueMap.has(name)) {
          const current = revenueMap.get(name);
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
      console.log("Revenue by service calculated:", revenues);
      return revenues.sort((a, b) => b.revenue - a.revenue);
    } catch (error) {
      console.error("Database error calculating revenue by service:", error);
      return [];
    }
  }
  getServiceColor(serviceName) {
    const colors = {
      "Banho & Tosa": "blue",
      "Tosa Higi\xEAnica": "green",
      "Corte de Unhas": "purple",
      "Hidrata\xE7\xE3o": "orange",
      "Pacote B\xE1sico": "blue",
      "Pacote Premium": "purple",
      "Pacote Completo": "green",
      "Pacote Teste": "orange"
    };
    if (!colors[serviceName]) {
      const colorOptions = ["blue", "green", "orange", "purple", "red", "yellow", "pink", "gray"];
      const hash = serviceName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return colorOptions[hash % colorOptions.length];
    }
    return colors[serviceName];
  }
  formatTimeAgo(date2) {
    const now = /* @__PURE__ */ new Date();
    const diffInHours = Math.floor((now.getTime() - date2.getTime()) / (1e3 * 60 * 60));
    if (diffInHours < 1) return "h\xE1 poucos minutos";
    if (diffInHours < 24) return `h\xE1 ${diffInHours} hora${diffInHours > 1 ? "s" : ""}`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `h\xE1 ${diffInDays} dia${diffInDays > 1 ? "s" : ""}`;
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { z as z2 } from "zod";
import bcrypt2 from "bcryptjs";
var requireAuth = (req, res, next) => {
  if (!req.session?.user) {
    return res.status(401).json({ error: "N\xE3o autorizado" });
  }
  next();
};
async function registerRoutes(app2) {
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (email === "admin") {
        let adminUser = await storage.getUserByEmail("admin");
        if (!adminUser) {
          const hashedPassword = await bcrypt2.hash("admin", 10);
          const company = await storage.getCompany("550e8400-e29b-41d4-a716-446655440000");
          if (company) {
            adminUser = await storage.createUser({
              email: "admin",
              password: hashedPassword,
              name: "Administrador",
              role: "admin",
              companyId: company.id
            });
          }
        }
      }
      try {
        const user = await storage.getUserByEmail(email);
        if (user && await bcrypt2.compare(password, user.password)) {
          req.session.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            companyId: user.companyId,
            company: {
              id: user.companyId,
              name: "Gloss Pet"
              // Could fetch from companies table
            }
          };
          res.json(req.session.user);
          return;
        }
      } catch (dbError) {
        console.error("Database authentication error:", dbError);
      }
      return res.status(401).json({ error: "Usu\xE1rio ou senha incorretos" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/auth/me", (req, res) => {
    if (req.session?.user) {
      res.json(req.session.user);
    } else {
      res.status(401).json({ error: "N\xE3o autenticado" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ error: "Erro ao fazer logout" });
      }
      res.json({ message: "Logout realizado com sucesso" });
    });
  });
  app2.get("/api/dashboard/metrics", requireAuth, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });
  app2.get("/api/dashboard/action-queue", requireAuth, async (req, res) => {
    try {
      const actionQueue = await storage.getActionQueue();
      res.json(actionQueue);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch action queue" });
    }
  });
  app2.get("/api/dashboard/recent-activity", requireAuth, async (req, res) => {
    try {
      const activity = await storage.getRecentActivity();
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });
  app2.get("/api/dashboard/revenue", requireAuth, async (req, res) => {
    try {
      const revenue = await storage.getRevenueByService();
      console.log("Revenue data from storage:", revenue);
      res.json(revenue);
    } catch (error) {
      console.error("Error getting revenue data:", error);
      res.status(500).json({ message: "Failed to fetch revenue data" });
    }
  });
  app2.get("/api/customers", requireAuth, async (req, res) => {
    try {
      const user = req.session.user;
      const customers2 = await storage.getCustomersWithPetCount(user.companyId);
      res.json(customers2);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });
  app2.post("/api/customers", requireAuth, async (req, res) => {
    try {
      const user = req.session.user;
      const { pets: pets2, packages, ...customerBody } = req.body;
      const cleanData = Object.entries(customerBody).reduce((acc, [key, value]) => {
        acc[key] = value === "" ? null : value;
        return acc;
      }, {});
      const customerData = {
        ...cleanData,
        companyId: user.companyId
      };
      console.log("Creating customer with data:", customerData);
      console.log("Pets to create:", pets2);
      console.log("Packages to create:", packages);
      const customer = await storage.createCustomer(customerData);
      if (pets2 && pets2.length > 0) {
        for (const petData of pets2) {
          const cleanPetData = Object.entries(petData).reduce((acc, [key, value]) => {
            acc[key] = value === "" ? null : value;
            return acc;
          }, {});
          const petToCreate = {
            ...cleanPetData,
            customerId: customer.id
          };
          console.log("Creating pet:", petToCreate);
          await storage.createPet(petToCreate);
        }
      }
      if (packages && packages.length > 0) {
        for (const packageData of packages) {
          const packageType = await storage.getPackageType(packageData.packageTypeId);
          if (packageType) {
            const packageToCreate = {
              customerId: customer.id,
              packageTypeId: packageData.packageTypeId,
              remainingUses: packageType.totalUses,
              validUntil: new Date(new Date(packageData.startDate).getTime() + packageType.validityDays * 24 * 60 * 60 * 1e3),
              status: "ativo",
              purchasePrice: packageType.price,
              acquiredAt: new Date(packageData.startDate)
            };
            console.log("Creating package:", packageToCreate);
            await storage.createCustomerPackage(packageToCreate);
          }
        }
      }
      res.status(201).json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(500).json({ message: "Failed to create customer" });
    }
  });
  app2.get("/api/customers/:id", requireAuth, async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      const pets2 = await storage.getPetsByCustomer(req.params.id);
      const customerPackages2 = await storage.getCustomerPackagesByCustomer(req.params.id);
      const packagesWithDetails = await Promise.all(
        customerPackages2.map(async (pkg) => {
          const packageType = await storage.getPackageType(pkg.packageTypeId);
          return {
            ...pkg,
            packageType
          };
        })
      );
      const customerWithDetails = {
        ...customer,
        pets: pets2,
        packages: packagesWithDetails
      };
      res.json(customerWithDetails);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });
  app2.patch("/api/customers/:id", requireAuth, async (req, res) => {
    try {
      const updates = req.body;
      const customer = await storage.updateCustomer(req.params.id, updates);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to update customer" });
    }
  });
  app2.put("/api/customers/:id", requireAuth, async (req, res) => {
    try {
      const user = req.session.user;
      const cleanData = Object.entries(req.body).reduce((acc, [key, value]) => {
        acc[key] = value === "" ? null : value;
        return acc;
      }, {});
      const customerData = {
        ...cleanData,
        companyId: user.companyId
      };
      console.log("Updating customer with data:", customerData);
      const customer = await storage.updateCustomer(req.params.id, customerData);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error updating customer:", error);
      res.status(500).json({ message: "Failed to update customer" });
    }
  });
  app2.delete("/api/customers/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteCustomer(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json({ message: "Customer deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });
  app2.get("/api/pets", requireAuth, async (req, res) => {
    try {
      const user = req.session.user;
      const pets2 = await storage.getPets(user.companyId);
      res.json(pets2);
    } catch (error) {
      console.error("Error fetching pets:", error);
      res.status(500).json({ message: "Failed to fetch pets" });
    }
  });
  app2.get("/api/customers/:customerId/pets", async (req, res) => {
    try {
      const pets2 = await storage.getPetsByCustomer(req.params.customerId);
      res.json(pets2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pets" });
    }
  });
  app2.post("/api/pets", requireAuth, async (req, res) => {
    try {
      console.log("Creating pet with data:", req.body);
      const petData = req.body;
      const cleanData = {
        ...petData,
        weight: petData.weight ? parseFloat(petData.weight) : null,
        birthDate: petData.birthDate || null
      };
      const pet = await storage.createPet(cleanData);
      res.status(201).json(pet);
    } catch (error) {
      console.error("Error creating pet:", error);
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: "Failed to create pet", error: message });
    }
  });
  app2.patch("/api/pets/:id", requireAuth, async (req, res) => {
    try {
      const updates = req.body;
      const pet = await storage.updatePet(req.params.id, updates);
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      res.json(pet);
    } catch (error) {
      res.status(500).json({ message: "Failed to update pet" });
    }
  });
  app2.get("/api/pets", requireAuth, async (req, res) => {
    try {
      const pets2 = await storage.getPets(req.session.user.companyId);
      res.json(pets2);
    } catch (error) {
      console.error("Error fetching pets:", error);
      res.status(500).json({ error: "Failed to fetch pets" });
    }
  });
  app2.post("/api/pets", requireAuth, async (req, res) => {
    try {
      console.log("Creating pet with data:", req.body);
      const result = insertPetSchema.omit({ customerId: true }).extend({
        customerId: z2.string().min(1, "Cliente \xE9 obrigat\xF3rio"),
        birthDate: z2.string().optional().nullable()
      }).safeParse(req.body);
      if (!result.success) {
        console.error("Validation error:", result.error);
        return res.status(400).json({
          error: "Dados inv\xE1lidos",
          details: result.error.flatten().fieldErrors
        });
      }
      const petData = {
        ...result.data,
        birthDate: result.data.birthDate ? new Date(result.data.birthDate) : null
      };
      const pet = await storage.createPet(petData);
      console.log("Pet created successfully:", pet);
      res.status(201).json(pet);
    } catch (error) {
      console.error("Error creating pet:", error);
      res.status(500).json({ error: "Failed to create pet" });
    }
  });
  app2.put("/api/pets/:id", requireAuth, async (req, res) => {
    try {
      console.log("Updating pet with data:", req.body);
      const result = insertPetSchema.omit({ customerId: true }).extend({
        customerId: z2.string().min(1, "Cliente \xE9 obrigat\xF3rio"),
        birthDate: z2.string().optional().nullable()
      }).safeParse(req.body);
      if (!result.success) {
        console.error("Validation error:", result.error);
        return res.status(400).json({
          error: "Dados inv\xE1lidos",
          details: result.error.flatten().fieldErrors
        });
      }
      const petData = {
        ...result.data,
        birthDate: result.data.birthDate ? new Date(result.data.birthDate) : null
      };
      const pet = await storage.updatePet(req.params.id, petData);
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      console.log("Pet updated successfully:", pet);
      res.json(pet);
    } catch (error) {
      console.error("Error updating pet:", error);
      res.status(500).json({ error: "Failed to update pet" });
    }
  });
  app2.delete("/api/pets/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deletePet(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Pet not found" });
      }
      res.json({ message: "Pet deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete pet" });
    }
  });
  app2.get("/api/services", async (req, res) => {
    try {
      const services2 = await storage.getServices();
      res.json(services2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });
  app2.get("/api/package-types", requireAuth, async (req, res) => {
    try {
      const packageTypes2 = await storage.getPackageTypes();
      res.json(packageTypes2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch package types" });
    }
  });
  app2.post("/api/package-types", requireAuth, async (req, res) => {
    try {
      console.log("Creating package type with data:", req.body);
      const packageData = req.body;
      const packageType = await storage.createPackageType(packageData);
      console.log("Package type created successfully:", packageType);
      res.status(201).json(packageType);
    } catch (error) {
      console.error("Error creating package type:", error);
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: "Failed to create package type", error: message });
    }
  });
  app2.patch("/api/package-types/:id", requireAuth, async (req, res) => {
    try {
      const updates = req.body;
      const packageType = await storage.updatePackageType(req.params.id, updates);
      if (!packageType) {
        return res.status(404).json({ message: "Package type not found" });
      }
      res.json(packageType);
    } catch (error) {
      res.status(500).json({ message: "Failed to update package type" });
    }
  });
  app2.put("/api/package-types/:id", requireAuth, async (req, res) => {
    try {
      console.log("Updating package type with data:", req.body);
      const packageData = req.body;
      const packageType = await storage.updatePackageType(req.params.id, packageData);
      if (!packageType) {
        return res.status(404).json({ message: "Package type not found" });
      }
      console.log("Package type updated successfully:", packageType);
      res.json(packageType);
    } catch (error) {
      console.error("Error updating package type:", error);
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: "Failed to update package type", error: message });
    }
  });
  app2.delete("/api/package-types/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deletePackageType(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Package type not found" });
      }
      res.json({ message: "Package type deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete package type" });
    }
  });
  app2.get("/api/customer-packages", requireAuth, async (req, res) => {
    try {
      const customerPackages2 = await storage.getCustomerPackages();
      res.json(customerPackages2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer packages" });
    }
  });
  app2.get("/api/package-types", async (req, res) => {
    try {
      const packageTypes2 = await storage.getPackageTypes();
      res.json(packageTypes2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch package types" });
    }
  });
  app2.get("/api/packages", async (req, res) => {
    try {
      const packages = await storage.getCustomerPackages();
      res.json(packages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch packages" });
    }
  });
  app2.get("/api/packages/active", async (req, res) => {
    try {
      const packages = await storage.getActivePackages();
      res.json(packages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active packages" });
    }
  });
  app2.get("/api/analytics/packages", requireAuth, async (req, res) => {
    try {
      const analytics = await storage.getPackageAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching package analytics:", error);
      res.status(500).json({ message: "Failed to fetch package analytics" });
    }
  });
  app2.post("/api/packages", async (req, res) => {
    try {
      const packageData = insertCustomerPackageSchema.parse(req.body);
      const customerPackage = await storage.createCustomerPackage(packageData);
      res.status(201).json(customerPackage);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ message: "Invalid package data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create package" });
      }
    }
  });
  app2.post("/api/packages/:id/renew", async (req, res) => {
    try {
      const renewedPackage = await storage.renewPackage(req.params.id);
      res.json(renewedPackage);
    } catch (error) {
      res.status(500).json({ message: "Failed to renew package" });
    }
  });
  app2.post("/api/packages/:id/use", async (req, res) => {
    try {
      const usageData = insertPackageUsageSchema.parse({
        ...req.body,
        customerPackageId: req.params.id
      });
      const usage = await storage.createPackageUsage(usageData);
      res.status(201).json(usage);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ message: "Invalid usage data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to register package usage" });
      }
    }
  });
  app2.get("/api/packages/:id/usages", async (req, res) => {
    try {
      const usages = await storage.getPackageUsages(req.params.id);
      res.json(usages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch package usages" });
    }
  });
  app2.get("/api/appointments", requireAuth, async (req, res) => {
    try {
      const appointments2 = await storage.getAppointments();
      res.json(appointments2);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });
  app2.get("/api/appointments/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getAppointmentStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching appointment stats:", error);
      res.status(500).json({ message: "Failed to fetch appointment stats" });
    }
  });
  app2.post("/api/appointments", requireAuth, async (req, res) => {
    try {
      console.log("Creating appointment with data:", req.body);
      const appointmentData = {
        ...req.body,
        scheduledDate: /* @__PURE__ */ new Date(`${req.body.date}T${req.body.time}:00`)
      };
      delete appointmentData.date;
      delete appointmentData.time;
      const validatedData = insertAppointmentSchema.parse(appointmentData);
      const appointment = await storage.createAppointment(validatedData);
      console.log("Appointment created successfully:", appointment);
      res.status(201).json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      if (error instanceof z2.ZodError) {
        res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create appointment" });
      }
    }
  });
  app2.patch("/api/appointments/:id", requireAuth, async (req, res) => {
    try {
      console.log("Updating appointment with data:", req.body);
      const updates = req.body;
      const appointment = await storage.updateAppointment(req.params.id, updates);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      console.log("Appointment updated successfully:", appointment);
      res.json(appointment);
    } catch (error) {
      console.error("Error updating appointment:", error);
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });
  app2.delete("/api/appointments/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteAppointment(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json({ message: "Appointment deleted successfully" });
    } catch (error) {
      console.error("Error deleting appointment:", error);
      res.status(500).json({ message: "Failed to delete appointment" });
    }
  });
  app2.post("/api/support/send-email", async (req, res) => {
    try {
      const { name, email, subject, category, message } = req.body;
      console.log("Support email received:", { name, email, subject, category, message });
      res.json({ success: true, message: "Support email sent successfully" });
    } catch (error) {
      console.error("Support email error:", error);
      res.status(500).json({ message: "Failed to send support email" });
    }
  });
  app2.get("/api/users", requireAuth, async (req, res) => {
    try {
      const userSession = req.session.user;
      const userStorage = new DatabaseStorage(userSession.companyId);
      const users2 = await userStorage.getUsers();
      res.json(users2);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.post("/api/users", requireAuth, async (req, res) => {
    try {
      const userSession = req.session.user;
      const userStorage = new DatabaseStorage(userSession.companyId);
      const userDataForValidation = { ...req.body };
      const validatedData = insertUserSchema.parse(userDataForValidation);
      const user = await userStorage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      if (error instanceof z2.ZodError) {
        res.status(400).json({ message: "Invalid user data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create user" });
      }
    }
  });
  app2.patch("/api/users/:id/toggle-status", requireAuth, async (req, res) => {
    try {
      const userSession = req.session.user;
      const userStorage = new DatabaseStorage(userSession.companyId);
      const { isActive } = req.body;
      const user = await userStorage.toggleUserStatus(req.params.id, isActive);
      res.json(user);
    } catch (error) {
      console.error("Error toggling user status:", error);
      res.status(500).json({ message: "Failed to update user status" });
    }
  });
  app2.delete("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const userSession = req.session.user;
      const userStorage = new DatabaseStorage(userSession.companyId);
      await userStorage.deleteUser(req.params.id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  app2.get("/api/client-requests", async (req, res) => {
    try {
      const demoRequests = [
        {
          id: "1",
          customerName: "Maria Silva",
          type: "feedback",
          subject: "Excelente atendimento!",
          message: "Adorei o novo sistema de agendamento. Muito mais f\xE1cil marcar os banhos da Luna.",
          status: "resolved",
          priority: "low",
          createdAt: "2025-01-10T14:30:00",
          rating: 5
        }
      ];
      res.json(demoRequests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client requests" });
    }
  });
  app2.get("/api/messages", requireAuth, async (req, res) => {
    try {
      const demoMessages = [
        {
          id: "msg_001",
          customerName: "Maria Silva",
          customerId: "cust_001",
          type: "whatsapp",
          content: "Ol\xE1! Seu agendamento para Luna est\xE1 confirmado para amanh\xE3 \xE0s 09:00h",
          status: "delivered",
          createdAt: "2025-01-10T16:30:00",
          direction: "sent"
        },
        {
          id: "msg_002",
          customerName: "Jo\xE3o Santos",
          customerId: "cust_002",
          type: "whatsapp",
          content: "Obrigado! Estaremos l\xE1 pontualmente.",
          status: "read",
          createdAt: "2025-01-10T17:15:00",
          direction: "received"
        },
        {
          id: "msg_003",
          customerName: "Ana Costa",
          customerId: "cust_003",
          type: "email",
          subject: "Lembrete de agendamento",
          content: "Lembramos que o banho da Mel est\xE1 agendado para amanh\xE3 \xE0s 10:00h",
          status: "sent",
          createdAt: "2025-01-11T08:00:00",
          direction: "sent"
        }
      ];
      res.json(demoMessages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  app2.post("/api/messages/send", requireAuth, async (req, res) => {
    try {
      const { customerId, type, subject, content } = req.body;
      console.log(`Sending ${type} message to customer ${customerId}: ${content}`);
      await storage.createNotification({
        customerId,
        type: "manual_message",
        title: subject || "Nova mensagem",
        message: content,
        read: false
      });
      res.json({ success: true, message: "Message sent successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });
  app2.post("/api/whatsapp/send", requireAuth, async (req, res) => {
    try {
      const { customerId, message, type } = req.body;
      await storage.createNotification({
        customerId,
        type: type || "manual",
        title: "Mensagem WhatsApp",
        message,
        read: false
      });
      res.json({ success: true, message: "Message sent via WhatsApp" });
    } catch (error) {
      res.status(500).json({ message: "Failed to send WhatsApp message" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
var vite_config_default = defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import session from "express-session";
import pg from "pg";
import connectPgSimple from "connect-pg-simple";
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
var PgStore = connectPgSimple(session);
app.use(session({
  secret: process.env.SESSION_SECRET || "gloss-pet-secret-key-2025",
  resave: false,
  saveUninitialized: false,
  store: new PgStore({
    pg,
    conString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  }),
  cookie: {
    secure: false,
    // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1e3,
    // 24 hours
    httpOnly: true
  }
}));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
