import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums for database
export const userTypeEnum = pgEnum('user_type', ['admin', 'user']);
export const alertTypeEnum = pgEnum('alert_type', ['estoque', 'vacina']);

// Tables definitions
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  userType: userTypeEnum("user_type").notNull().default('user'),
  active: boolean("active").notNull().default(true),
  trialStartDate: timestamp("trial_start_date").notNull().defaultNow(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
});

export const animals = pgTable("animals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  species: text("species").notNull(),
  breed: text("breed"),
  tutorId: integer("tutor_id").notNull(),
});

export const vaccines = pgTable("vaccines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  applicationDate: timestamp("application_date").notNull(),
  expirationDate: timestamp("expiration_date").notNull(),
  animalId: integer("animal_id").notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull().default(0),
  minQuantity: integer("min_quantity").notNull().default(0),
  maxQuantity: integer("max_quantity"),
  category: text("category"),
  userId: integer("user_id").notNull(),
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  type: alertTypeEnum("type").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  userId: integer("user_id").notNull(),
  itemId: integer("item_id"),
  resolved: boolean("resolved").notNull().default(false),
});

// Schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  active: true, 
  trialStartDate: true,
  stripeCustomerId: true, 
  stripeSubscriptionId: true 
});

export const insertAnimalSchema = createInsertSchema(animals).omit({ 
  id: true 
});

export const insertVaccineSchema = createInsertSchema(vaccines).omit({ 
  id: true 
});

export const insertProductSchema = createInsertSchema(products).omit({ 
  id: true 
});

export const insertAlertSchema = createInsertSchema(alerts).omit({ 
  id: true, 
  createdAt: true,
  resolved: true
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;

export type Animal = typeof animals.$inferSelect;
export type InsertAnimal = z.infer<typeof insertAnimalSchema>;

export type Vaccine = typeof vaccines.$inferSelect;
export type InsertVaccine = z.infer<typeof insertVaccineSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

// Custom types for frontend usage
export interface UserWithSubscription extends User {
  isSubscribed: boolean;
  trialDaysLeft: number;
}

export interface DashboardStats {
  productCount: number;
  stockAlerts: number;
  animalCount: number;
  expiringVaccines: number;
}
