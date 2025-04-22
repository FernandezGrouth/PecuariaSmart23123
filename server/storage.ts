import { 
  User, InsertUser, Animal, InsertAnimal, 
  Vaccine, InsertVaccine, Product, InsertProduct, 
  Alert, InsertAlert, DashboardStats
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { addDays, differenceInDays, isBefore, isAfter } from "date-fns";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

// Utility to hash passwords
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Utility to check if a password matches a hash
export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  updateUserStripeInfo(id: number, info: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User | undefined>;
  
  // Animal methods
  getAnimal(id: number): Promise<Animal | undefined>;
  getAnimalsByUser(userId: number): Promise<Animal[]>;
  createAnimal(animal: InsertAnimal): Promise<Animal>;
  updateAnimal(id: number, updates: Partial<Animal>): Promise<Animal | undefined>;
  deleteAnimal(id: number): Promise<boolean>;
  
  // Vaccine methods
  getVaccine(id: number): Promise<Vaccine | undefined>;
  getVaccinesByAnimal(animalId: number): Promise<Vaccine[]>;
  getVaccinesByUser(userId: number): Promise<Vaccine[]>;
  getExpiringVaccines(userId: number, daysThreshold: number): Promise<Vaccine[]>;
  createVaccine(vaccine: InsertVaccine): Promise<Vaccine>;
  updateVaccine(id: number, updates: Partial<Vaccine>): Promise<Vaccine | undefined>;
  deleteVaccine(id: number): Promise<boolean>;
  
  // Product methods
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByUser(userId: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Alert methods
  getAlert(id: number): Promise<Alert | undefined>;
  getAlertsByUser(userId: number): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  resolveAlert(id: number): Promise<Alert | undefined>;
  
  // Stats methods
  getDashboardStats(userId: number): Promise<DashboardStats>;
  
  // Session store
  sessionStore: session.SessionStore;
  
  // Subscription verification
  isSubscriptionActive(user: User): boolean;
  getTrialDaysLeft(user: User): number;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private animals: Map<number, Animal>;
  private vaccines: Map<number, Vaccine>;
  private products: Map<number, Product>;
  private alerts: Map<number, Alert>;
  
  currentUserId: number;
  currentAnimalId: number;
  currentVaccineId: number;
  currentProductId: number;
  currentAlertId: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.animals = new Map();
    this.vaccines = new Map();
    this.products = new Map();
    this.alerts = new Map();
    
    this.currentUserId = 1;
    this.currentAnimalId = 1;
    this.currentVaccineId = 1;
    this.currentProductId = 1;
    this.currentAlertId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Add a default admin user
    this.createDefaultUser();
  }
  
  private async createDefaultUser() {
    const adminUser: InsertUser = {
      name: "Administrador",
      email: "admin@vetstock.com",
      password: await hashPassword("admin123"),
      userType: "admin",
    };
    
    await this.createUser(adminUser);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const trialStartDate = new Date();
    
    const user: User = {
      ...insertUser,
      id,
      active: true,
      trialStartDate,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
    };
    
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    
    return updatedUser;
  }

  async updateUserStripeInfo(id: number, info: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User | undefined> {
    return this.updateUser(id, info);
  }

  // Animal methods
  async getAnimal(id: number): Promise<Animal | undefined> {
    return this.animals.get(id);
  }

  async getAnimalsByUser(userId: number): Promise<Animal[]> {
    return Array.from(this.animals.values()).filter(
      (animal) => animal.tutorId === userId,
    );
  }

  async createAnimal(insertAnimal: InsertAnimal): Promise<Animal> {
    const id = this.currentAnimalId++;
    
    const animal: Animal = {
      ...insertAnimal,
      id,
    };
    
    this.animals.set(id, animal);
    return animal;
  }

  async updateAnimal(id: number, updates: Partial<Animal>): Promise<Animal | undefined> {
    const animal = await this.getAnimal(id);
    if (!animal) return undefined;
    
    const updatedAnimal = { ...animal, ...updates };
    this.animals.set(id, updatedAnimal);
    
    return updatedAnimal;
  }

  async deleteAnimal(id: number): Promise<boolean> {
    return this.animals.delete(id);
  }

  // Vaccine methods
  async getVaccine(id: number): Promise<Vaccine | undefined> {
    return this.vaccines.get(id);
  }

  async getVaccinesByAnimal(animalId: number): Promise<Vaccine[]> {
    return Array.from(this.vaccines.values()).filter(
      (vaccine) => vaccine.animalId === animalId,
    );
  }

  async getVaccinesByUser(userId: number): Promise<Vaccine[]> {
    const userAnimals = await this.getAnimalsByUser(userId);
    const animalIds = userAnimals.map(animal => animal.id);
    
    return Array.from(this.vaccines.values()).filter(
      (vaccine) => animalIds.includes(vaccine.animalId),
    );
  }

  async getExpiringVaccines(userId: number, daysThreshold: number): Promise<Vaccine[]> {
    const userVaccines = await this.getVaccinesByUser(userId);
    const today = new Date();
    const thresholdDate = addDays(today, daysThreshold);
    
    return userVaccines.filter(vaccine => {
      return isAfter(vaccine.expirationDate, today) && 
             isBefore(vaccine.expirationDate, thresholdDate);
    });
  }

  async createVaccine(insertVaccine: InsertVaccine): Promise<Vaccine> {
    const id = this.currentVaccineId++;
    
    const vaccine: Vaccine = {
      ...insertVaccine,
      id,
    };
    
    this.vaccines.set(id, vaccine);
    
    // Generate alert for vaccines expiring in 30 days
    const today = new Date();
    const expirationDate = new Date(insertVaccine.expirationDate);
    const daysUntilExpiration = differenceInDays(expirationDate, today);
    
    if (daysUntilExpiration <= 30) {
      const animal = await this.getAnimal(insertVaccine.animalId);
      if (animal) {
        const alert: InsertAlert = {
          type: "vacina",
          message: `Vacina ${insertVaccine.name} para ${animal.name} vence em ${daysUntilExpiration} dias`,
          userId: animal.tutorId,
          itemId: id,
        };
        
        await this.createAlert(alert);
      }
    }
    
    return vaccine;
  }

  async updateVaccine(id: number, updates: Partial<Vaccine>): Promise<Vaccine | undefined> {
    const vaccine = await this.getVaccine(id);
    if (!vaccine) return undefined;
    
    const updatedVaccine = { ...vaccine, ...updates };
    this.vaccines.set(id, updatedVaccine);
    
    return updatedVaccine;
  }

  async deleteVaccine(id: number): Promise<boolean> {
    return this.vaccines.delete(id);
  }

  // Product methods
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByUser(userId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.userId === userId,
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    
    const product: Product = {
      ...insertProduct,
      id,
    };
    
    this.products.set(id, product);
    
    // Check if we need to create alerts for stock levels
    await this.checkProductAlerts(product);
    
    return product;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined> {
    const product = await this.getProduct(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    
    // Check if we need to create alerts for updated stock levels
    await this.checkProductAlerts(updatedProduct);
    
    return updatedProduct;
  }
  
  private async checkProductAlerts(product: Product): Promise<void> {
    // Alert for low stock
    if (product.quantity < product.minQuantity) {
      const alert: InsertAlert = {
        type: "estoque",
        message: `Produto ${product.name} está abaixo do estoque mínimo (${product.quantity} unidades)`,
        userId: product.userId,
        itemId: product.id,
      };
      
      await this.createAlert(alert);
    }
    
    // Alert for high stock
    if (product.maxQuantity && product.quantity > product.maxQuantity) {
      const alert: InsertAlert = {
        type: "estoque",
        message: `Produto ${product.name} está acima do estoque máximo (${product.quantity} unidades)`,
        userId: product.userId,
        itemId: product.id,
      };
      
      await this.createAlert(alert);
    }
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Alert methods
  async getAlert(id: number): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }

  async getAlertsByUser(userId: number): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter(alert => alert.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.currentAlertId++;
    
    const alert: Alert = {
      ...insertAlert,
      id,
      createdAt: new Date(),
      resolved: false,
    };
    
    this.alerts.set(id, alert);
    return alert;
  }

  async resolveAlert(id: number): Promise<Alert | undefined> {
    const alert = await this.getAlert(id);
    if (!alert) return undefined;
    
    const updatedAlert = { ...alert, resolved: true };
    this.alerts.set(id, updatedAlert);
    
    return updatedAlert;
  }

  // Dashboard stats
  async getDashboardStats(userId: number): Promise<DashboardStats> {
    const products = await this.getProductsByUser(userId);
    const animals = await this.getAnimalsByUser(userId);
    
    // Count stock alerts
    const lowStockProducts = products.filter(p => p.quantity < p.minQuantity);
    const highStockProducts = products.filter(p => p.maxQuantity && p.quantity > p.maxQuantity);
    const stockAlerts = lowStockProducts.length + highStockProducts.length;
    
    // Count expiring vaccines
    const expiringVaccines = await this.getExpiringVaccines(userId, 30);
    
    return {
      productCount: products.length,
      stockAlerts,
      animalCount: animals.length,
      expiringVaccines: expiringVaccines.length,
    };
  }
  
  // Subscription and trial management
  isSubscriptionActive(user: User): boolean {
    // If user has an active subscription ID, they're subscribed
    if (user.stripeSubscriptionId) {
      return true;
    }
    
    // Otherwise, check if they're still in trial period
    return this.getTrialDaysLeft(user) > 0;
  }
  
  getTrialDaysLeft(user: User): number {
    const trialEndDate = addDays(user.trialStartDate, 7); // 7-day trial
    const today = new Date();
    
    if (isAfter(today, trialEndDate)) {
      return 0;
    }
    
    return differenceInDays(trialEndDate, today);
  }
}

export const storage = new MemStorage();
