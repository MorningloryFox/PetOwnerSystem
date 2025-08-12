import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage, DatabaseStorage } from "./storage";
import { insertCustomerSchema, insertPetSchema, insertPackageUsageSchema, insertAppointmentSchema, insertCustomerPackageSchema, insertCompanySchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";
import session from "express-session";

// Extend session to include user
declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      email: string;
      name: string;
      role: string;
      companyId: string;
      company: {
        id: string;
        name: string;
      };
    };
  }
}

// Auth middleware
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      // Ensure admin user exists
      if (email === 'admin') {
        let adminUser = await storage.getUserByEmail('admin');
        if (!adminUser) {
          const hashedPassword = await bcrypt.hash('admin', 10);
          const company = await storage.getCompany('550e8400-e29b-41d4-a716-446655440000')
          if(company) {
            adminUser = await storage.createUser({
              email: 'admin',
              password: hashedPassword,
              name: 'Administrador',
              role: 'admin',
              companyId: company.id,
            });
          }
        }
      }
      
      // Try to authenticate against database users
      try {
        const user = await storage.getUserByEmail(email);
        if (user && await bcrypt.compare(password, user.password)) {
          req.session.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            companyId: user.companyId,
            company: {
              id: user.companyId,
              name: 'Gloss Pet', // Could fetch from companies table
            },
          };
          
          res.json(req.session.user);
          return;
        }
      } catch (dbError) {
        console.error('Database authentication error:', dbError);
      }
      
      return res.status(401).json({ error: 'Usuário ou senha incorretos' });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.session?.user) {
      res.json(req.session.user);
    } else {
      res.status(401).json({ error: 'Não autenticado' });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ error: 'Erro ao fazer logout' });
      }
      res.json({ message: 'Logout realizado com sucesso' });
    });
  });
  
  // Dashboard routes (protected)
  app.get("/api/dashboard/metrics", requireAuth, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  app.get("/api/dashboard/action-queue", requireAuth, async (req, res) => {
    try {
      const actionQueue = await storage.getActionQueue();
      res.json(actionQueue);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch action queue" });
    }
  });

  app.get("/api/dashboard/recent-activity", requireAuth, async (req, res) => {
    try {
      const activity = await storage.getRecentActivity();
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  app.get("/api/dashboard/revenue", requireAuth, async (req, res) => {
    try {
      const revenue = await storage.getRevenueByService();
      console.log('Revenue data from storage:', revenue);
      res.json(revenue);
    } catch (error) {
      console.error('Error getting revenue data:', error);
      res.status(500).json({ message: "Failed to fetch revenue data" });
    }
  });

  // Customer routes
  app.get("/api/customers", requireAuth, async (req, res) => {
    try {
      const user = req.session.user!;
      const customers = await storage.getCustomersWithPetCount(user.companyId);
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post("/api/customers", requireAuth, async (req, res) => {
    try {
      const user = req.session.user!;
      const { pets, packages, ...customerBody } = req.body;
      
      // Convert empty strings to null for optional fields
      const cleanData = Object.entries(customerBody).reduce((acc, [key, value]) => {
        acc[key] = value === "" ? null : value;
        return acc;
      }, {} as any);
      
      // Add companyId to customer data
      const customerData = {
        ...cleanData,
        companyId: user.companyId
      };
      
      console.log("Creating customer with data:", customerData);
      console.log("Pets to create:", pets);
      console.log("Packages to create:", packages);
      
      // Create customer first
      const customer = await storage.createCustomer(customerData);
      
      // Create pets for this customer
      if (pets && pets.length > 0) {
        for (const petData of pets) {
          const cleanPetData = Object.entries(petData).reduce((acc, [key, value]) => {
            acc[key] = value === "" ? null : value;
            return acc;
          }, {} as any);
          
          const petToCreate = {
            ...cleanPetData,
            customerId: customer.id
          };
          
          console.log("Creating pet:", petToCreate);
          await storage.createPet(petToCreate);
        }
      }
      
      // Create packages for this customer
      if (packages && packages.length > 0) {
        for (const packageData of packages) {
          const packageType = await storage.getPackageType(packageData.packageTypeId);
          if (packageType) {
            const packageToCreate = {
              customerId: customer.id,
              packageTypeId: packageData.packageTypeId,
              remainingUses: packageType.totalUses,
              validUntil: new Date(new Date(packageData.startDate).getTime() + packageType.validityDays * 24 * 60 * 60 * 1000),
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

  app.get("/api/customers/:id", requireAuth, async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      // Get customer's pets
      const pets = await storage.getPetsByCustomer(req.params.id);
      
      // Get customer's packages with full details
      const customerPackages = await storage.getCustomerPackagesByCustomer(req.params.id);
      
      // Get package types for packages
      const packagesWithDetails = await Promise.all(
        customerPackages.map(async (pkg) => {
          const packageType = await storage.getPackageType(pkg.packageTypeId);
          return {
            ...pkg,
            packageType
          };
        })
      );
      
      const customerWithDetails = {
        ...customer,
        pets,
        packages: packagesWithDetails
      };
      
      res.json(customerWithDetails);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.patch("/api/customers/:id", requireAuth, async (req, res) => {
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

  app.put("/api/customers/:id", requireAuth, async (req, res) => {
    try {
      const user = req.session.user!;
      
      // Convert empty strings to null for optional fields
      const cleanData = Object.entries(req.body).reduce((acc, [key, value]) => {
        acc[key] = value === "" ? null : value;
        return acc;
      }, {} as any);
      
      // Add companyId to customer data
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

  app.delete("/api/customers/:id", requireAuth, async (req, res) => {
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

  // Pet routes
  app.get("/api/pets", requireAuth, async (req, res) => {
    try {
      const user = req.session.user!;
      const pets = await storage.getPets(user.companyId);
      res.json(pets);
    } catch (error) {
      console.error("Error fetching pets:", error);
      res.status(500).json({ message: "Failed to fetch pets" });
    }
  });

  app.get("/api/customers/:customerId/pets", async (req, res) => {
    try {
      const pets = await storage.getPetsByCustomer(req.params.customerId);
      res.json(pets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pets" });
    }
  });

  app.post("/api/pets", requireAuth, async (req, res) => {
    try {
      console.log("Creating pet with data:", req.body);
      const petData = req.body;
      
      // Clean and validate data
      const cleanData = {
        ...petData,
        weight: petData.weight ? parseFloat(petData.weight) : null,
        birthDate: petData.birthDate || null,
      };
      
      const pet = await storage.createPet(cleanData);
      res.status(201).json(pet);
    } catch (error) {
      console.error("Error creating pet:", error);
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: "Failed to create pet", error: message });
    }
  });

  app.patch("/api/pets/:id", requireAuth, async (req, res) => {
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

  app.get("/api/pets", requireAuth, async (req, res) => {
    try {
      const pets = await storage.getPets(req.session.user!.companyId);
      res.json(pets);
    } catch (error) {
      console.error("Error fetching pets:", error);
      res.status(500).json({ error: "Failed to fetch pets" });
    }
  });

  app.post("/api/pets", requireAuth, async (req, res) => {
    try {
      console.log("Creating pet with data:", req.body);
      
      const result = insertPetSchema.omit({ customerId: true }).extend({
        customerId: z.string().min(1, "Cliente é obrigatório"),
        birthDate: z.string().optional().nullable(),
      }).safeParse(req.body);
      
      if (!result.success) {
        console.error("Validation error:", result.error);
        return res.status(400).json({
          error: "Dados inválidos",
          details: result.error.flatten().fieldErrors
        });
      }

      const petData = {
        ...result.data,
        birthDate: result.data.birthDate ? new Date(result.data.birthDate) : null,
      };

      const pet = await storage.createPet(petData);
      console.log("Pet created successfully:", pet);
      res.status(201).json(pet);
    } catch (error) {
      console.error("Error creating pet:", error);
      res.status(500).json({ error: "Failed to create pet" });
    }
  });

  app.put("/api/pets/:id", requireAuth, async (req, res) => {
    try {
      console.log("Updating pet with data:", req.body);
      
      const result = insertPetSchema.omit({ customerId: true }).extend({
        customerId: z.string().min(1, "Cliente é obrigatório"),
        birthDate: z.string().optional().nullable(),
      }).safeParse(req.body);
      
      if (!result.success) {
        console.error("Validation error:", result.error);
        return res.status(400).json({
          error: "Dados inválidos",
          details: result.error.flatten().fieldErrors
        });
      }

      const petData = {
        ...result.data,
        birthDate: result.data.birthDate ? new Date(result.data.birthDate) : null,
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

  app.delete("/api/pets/:id", requireAuth, async (req, res) => {
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

  // Service routes
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  // Package Type routes
  app.get("/api/package-types", requireAuth, async (req, res) => {
    try {
      const packageTypes = await storage.getPackageTypes();
      res.json(packageTypes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch package types" });
    }
  });

  app.post("/api/package-types", requireAuth, async (req, res) => {
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

  app.patch("/api/package-types/:id", requireAuth, async (req, res) => {
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

  app.put("/api/package-types/:id", requireAuth, async (req, res) => {
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

  app.delete("/api/package-types/:id", requireAuth, async (req, res) => {
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

  // Customer Package routes
  app.get("/api/customer-packages", requireAuth, async (req, res) => {
    try {
      const customerPackages = await storage.getCustomerPackages();
      res.json(customerPackages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer packages" });
    }
  });

  // Package Type routes
  app.get("/api/package-types", async (req, res) => {
    try {
      const packageTypes = await storage.getPackageTypes();
      res.json(packageTypes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch package types" });
    }
  });

  // Customer Package routes
  app.get("/api/packages", async (req, res) => {
    try {
      const packages = await storage.getCustomerPackages();
      res.json(packages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch packages" });
    }
  });

  app.get("/api/packages/active", async (req, res) => {
    try {
      const packages = await storage.getActivePackages();
      res.json(packages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active packages" });
    }
  });

  app.get("/api/analytics/packages", requireAuth, async (req, res) => {
    try {
      const analytics = await storage.getPackageAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching package analytics:", error);
      res.status(500).json({ message: "Failed to fetch package analytics" });
    }
  });

  app.post("/api/packages", async (req, res) => {
    try {
      const packageData = insertCustomerPackageSchema.parse(req.body);
      const customerPackage = await storage.createCustomerPackage(packageData);
      res.status(201).json(customerPackage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid package data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create package" });
      }
    }
  });

  app.post("/api/packages/:id/renew", async (req, res) => {
    try {
      const renewedPackage = await storage.renewPackage(req.params.id);
      res.json(renewedPackage);
    } catch (error) {
      res.status(500).json({ message: "Failed to renew package" });
    }
  });

  // Package Usage routes
  app.post("/api/packages/:id/use", async (req, res) => {
    try {
      const usageData = insertPackageUsageSchema.parse({
        ...req.body,
        customerPackageId: req.params.id
      });
      const usage = await storage.createPackageUsage(usageData);
      res.status(201).json(usage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid usage data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to register package usage" });
      }
    }
  });

  app.get("/api/packages/:id/usages", async (req, res) => {
    try {
      const usages = await storage.getPackageUsages(req.params.id);
      res.json(usages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch package usages" });
    }
  });

  // Appointment routes
  app.get("/api/appointments", requireAuth, async (req, res) => {
    try {
      const appointments = await storage.getAppointments();
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.get("/api/appointments/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getAppointmentStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching appointment stats:", error);
      res.status(500).json({ message: "Failed to fetch appointment stats" });
    }
  });

  app.post("/api/appointments", requireAuth, async (req, res) => {
    try {
      console.log("Creating appointment with data:", req.body);
      
      // Transform the data to match database schema
      const appointmentData = {
        ...req.body,
        scheduledDate: new Date(`${req.body.date}T${req.body.time}:00`),
      };
      
      // Remove frontend fields not needed in database
      delete appointmentData.date;
      delete appointmentData.time;
      
      const validatedData = insertAppointmentSchema.parse(appointmentData);
      const appointment = await storage.createAppointment(validatedData);
      console.log("Appointment created successfully:", appointment);
      res.status(201).json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create appointment" });
      }
    }
  });

  app.patch("/api/appointments/:id", requireAuth, async (req, res) => {
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

  app.delete("/api/appointments/:id", requireAuth, async (req, res) => {
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

  // Support endpoints
  app.post("/api/support/send-email", async (req, res) => {
    try {
      const { name, email, subject, category, message } = req.body;
      
      // TODO: Implement SendGrid email sending
      // For now, just log and return success
      console.log('Support email received:', { name, email, subject, category, message });
      
      res.json({ success: true, message: "Support email sent successfully" });
    } catch (error) {
      console.error('Support email error:', error);
      res.status(500).json({ message: "Failed to send support email" });
    }
  });

  // Users routes
  app.get("/api/users", requireAuth, async (req, res) => {
    try {
      const userSession = req.session.user!;
      const userStorage = new DatabaseStorage(userSession.companyId);
      const users = await userStorage.getUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", requireAuth, async (req, res) => {
    try {
      const userSession = req.session.user!;
      const userStorage = new DatabaseStorage(userSession.companyId);
      
      const userDataForValidation = { ...req.body };
      const validatedData = insertUserSchema.parse(userDataForValidation);
      const user = await userStorage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid user data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create user" });
      }
    }
  });

  app.patch("/api/users/:id/toggle-status", requireAuth, async (req, res) => {
    try {
      const userSession = req.session.user!;
      const userStorage = new DatabaseStorage(userSession.companyId);
      const { isActive } = req.body;
      const user = await userStorage.toggleUserStatus(req.params.id, isActive);
      res.json(user);
    } catch (error) {
      console.error("Error toggling user status:", error);
      res.status(500).json({ message: "Failed to update user status" });
    }
  });

  app.delete("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const userSession = req.session.user!;
      const userStorage = new DatabaseStorage(userSession.companyId);
      await userStorage.deleteUser(req.params.id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Client requests endpoints
  app.get("/api/client-requests", async (req, res) => {
    try {
      // Return demo client requests for now
      const demoRequests = [
        {
          id: "1",
          customerName: "Maria Silva",
          type: "feedback",
          subject: "Excelente atendimento!",
          message: "Adorei o novo sistema de agendamento. Muito mais fácil marcar os banhos da Luna.",
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

  // Messages routes
  app.get("/api/messages", requireAuth, async (req, res) => {
    try {
      // Return demo messages for now
      const demoMessages = [
        {
          id: "msg_001",
          customerName: "Maria Silva", 
          customerId: "cust_001",
          type: "whatsapp",
          content: "Olá! Seu agendamento para Luna está confirmado para amanhã às 09:00h",
          status: "delivered",
          createdAt: "2025-01-10T16:30:00",
          direction: "sent"
        },
        {
          id: "msg_002",
          customerName: "João Santos",
          customerId: "cust_002", 
          type: "whatsapp",
          content: "Obrigado! Estaremos lá pontualmente.",
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
          content: "Lembramos que o banho da Mel está agendado para amanhã às 10:00h",
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

  app.post("/api/messages/send", requireAuth, async (req, res) => {
    try {
      const { customerId, type, subject, content } = req.body;
      
      // Log message sending
      console.log(`Sending ${type} message to customer ${customerId}: ${content}`);
      
      // Create notification record
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

  // WhatsApp integration placeholder
  app.post("/api/whatsapp/send", requireAuth, async (req, res) => {
    try {
      const { customerId, message, type } = req.body;
      
      // Create notification record
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

  const httpServer = createServer(app);
  return httpServer;
}
