import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, numeric, jsonb, uuid, date, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Companies table for multi-tenant support
export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").unique(),
  phone: text("phone"),
  address: text("address"),
  logo: text("logo"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Users table for authentication (linked to companies)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id").references(() => companies.id).notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("employee"), // "owner", "manager", "employee"
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueEmailPerCompany: index("unique_email_per_company").on(table.email, table.companyId),
}));

// Customers table (linked to companies)
export const customers = pgTable("customers", {
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
  createdAt: timestamp("created_at").defaultNow(),
});

// Pets table
export const pets = pgTable("pets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  name: text("name").notNull(),
  species: text("species").notNull(), // "dog", "cat", "bird", "rabbit", "other"
  breed: text("breed"),
  weight: numeric("weight", { precision: 5, scale: 2 }),
  birthDate: date("birth_date"),
  gender: text("gender"), // "male", "female"
  color: text("color"),
  specialNeeds: text("special_needs"), // Any special care requirements
  preferredFood: text("preferred_food"), // Preferred pet food brand/type
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Services table (linked to companies)
export const services = pgTable("services", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id").references(() => companies.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  basePrice: numeric("base_price", { precision: 10, scale: 2 }),
  duration: integer("duration"), // minutes
  active: boolean("active").default(true),
});

// Package types table (linked to companies)
export const packageTypes = pgTable("package_types", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id").references(() => companies.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  validityDays: integer("validity_days").notNull(),
  totalUses: integer("total_uses").notNull(), // Total uses across all services
  price: numeric("price", { precision: 10, scale: 2 }).notNull(), // Total package price
  maxPets: integer("max_pets").default(1), // How many pets can use this package
  active: boolean("active").default(true),
});

// Package type services (many-to-many)
export const packageTypeServices = pgTable("package_type_services", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  packageTypeId: uuid("package_type_id").references(() => packageTypes.id).notNull(),
  serviceId: uuid("service_id").references(() => services.id).notNull(),
  includedUses: integer("included_uses").default(1), // How many uses of this service in the package
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(), // Individual service price in this package
});

// Customer packages table
export const customerPackages = pgTable("customer_packages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  packageTypeId: uuid("package_type_id").references(() => packageTypes.id).notNull(),
  remainingUses: integer("remaining_uses").notNull(), // Total remaining uses across all services
  validUntil: timestamp("valid_until").notNull(),
  status: text("status").notNull().default("active"), // "active", "consumed", "expired", "renewed"
  renewedFromId: uuid("renewed_from_id"),
  purchasePrice: numeric("purchase_price", { precision: 10, scale: 2 }).notNull(),
  acquiredAt: timestamp("acquired_at").defaultNow(),
});

// Customer package services (tracks remaining uses per service)
export const customerPackageServices = pgTable("customer_package_services", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerPackageId: uuid("customer_package_id").references(() => customerPackages.id).notNull(),
  serviceId: uuid("service_id").references(() => services.id).notNull(),
  remainingUses: integer("remaining_uses").notNull(), // Remaining uses for this specific service
  totalUses: integer("total_uses").notNull(), // Original total uses for this service
});

// Package usages table
export const packageUsages = pgTable("package_usages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerPackageId: uuid("customer_package_id").references(() => customerPackages.id).notNull(),
  petId: uuid("pet_id").references(() => pets.id).notNull(),
  serviceId: uuid("service_id").references(() => services.id).notNull(),
  notes: text("notes"),
  usedAt: timestamp("used_at").defaultNow(),
});

// Appointments table
export const appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  petId: uuid("pet_id").references(() => pets.id).notNull(),
  serviceId: uuid("service_id").references(() => services.id).notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  status: text("status").notNull().default("scheduled"), // "scheduled", "confirmed", "checked_in", "in_service", "ready", "picked_up", "canceled"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  type: text("type").notNull(), // "confirmation", "check_in", "ready", "reminder"
  message: text("message").notNull(),
  channel: text("channel").notNull(), // "whatsapp", "email"
  status: text("status").notNull().default("pending"), // "pending", "sent", "failed"
  metadata: jsonb("metadata"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true, createdAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, lastLoginAt: true, companyId: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true, companyId: true });
export const insertPetSchema = createInsertSchema(pets).omit({ id: true, createdAt: true });
export const insertServiceSchema = createInsertSchema(services).omit({ id: true });
export const insertPackageTypeSchema = createInsertSchema(packageTypes).omit({ id: true });
export const insertPackageTypeServiceSchema = createInsertSchema(packageTypeServices).omit({ id: true });
export const insertCustomerPackageSchema = createInsertSchema(customerPackages).omit({ id: true, acquiredAt: true });
export const insertCustomerPackageServiceSchema = createInsertSchema(customerPackageServices).omit({ id: true });
export const insertPackageUsageSchema = createInsertSchema(packageUsages).omit({ id: true, usedAt: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, sentAt: true, createdAt: true });

// Types
export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;
export type Pet = typeof pets.$inferSelect;
export type InsertPet = typeof pets.$inferInsert;
export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;
export type PackageType = typeof packageTypes.$inferSelect;
export type InsertPackageType = typeof packageTypes.$inferInsert;
export type PackageTypeService = typeof packageTypeServices.$inferSelect;
export type InsertPackageTypeService = typeof packageTypeServices.$inferInsert;
export type CustomerPackage = typeof customerPackages.$inferSelect;
export type InsertCustomerPackage = typeof customerPackages.$inferInsert;
export type CustomerPackageService = typeof customerPackageServices.$inferSelect;
export type InsertCustomerPackageService = typeof customerPackageServices.$inferInsert;
export type PackageUsage = typeof packageUsages.$inferSelect;
export type InsertPackageUsage = typeof packageUsages.$inferInsert;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
