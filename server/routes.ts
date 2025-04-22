import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { isAuthenticated, isAdmin, hasActiveSubscription, isResourceOwner } from "./middleware";
import { insertProductSchema, insertAnimalSchema, insertVaccineSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

if (process.env.STRIPE_SECRET_KEY) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // Dashboard stats
  app.get("/api/dashboard/stats", isAuthenticated, hasActiveSubscription, async (req, res, next) => {
    try {
      const stats = await storage.getDashboardStats(req.user.id);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  });
  
  // Alerts routes
  app.get("/api/alerts", isAuthenticated, hasActiveSubscription, async (req, res, next) => {
    try {
      const alerts = await storage.getAlertsByUser(req.user.id);
      res.json(alerts);
    } catch (error) {
      next(error);
    }
  });
  
  app.put("/api/alerts/:id/resolve", isAuthenticated, hasActiveSubscription, async (req, res, next) => {
    try {
      const alertId = parseInt(req.params.id);
      if (isNaN(alertId)) {
        return res.status(400).json({ message: "ID de alerta inválido" });
      }
      
      const alert = await storage.getAlert(alertId);
      if (!alert) {
        return res.status(404).json({ message: "Alerta não encontrado" });
      }
      
      if (alert.userId !== req.user.id && req.user.userType !== "admin") {
        return res.status(403).json({ message: "Permissão negada" });
      }
      
      const updatedAlert = await storage.resolveAlert(alertId);
      res.json(updatedAlert);
    } catch (error) {
      next(error);
    }
  });
  
  // Products routes
  app.get("/api/products", isAuthenticated, hasActiveSubscription, async (req, res, next) => {
    try {
      const products = await storage.getProductsByUser(req.user.id);
      res.json(products);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/products", isAuthenticated, hasActiveSubscription, async (req, res, next) => {
    try {
      const productData = insertProductSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });
  
  app.get("/api/products/:id", isAuthenticated, hasActiveSubscription, async (req, res, next) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "ID de produto inválido" });
      }
      
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      
      if (product.userId !== req.user.id && req.user.userType !== "admin") {
        return res.status(403).json({ message: "Permissão negada" });
      }
      
      res.json(product);
    } catch (error) {
      next(error);
    }
  });
  
  app.put("/api/products/:id", 
    isAuthenticated, 
    hasActiveSubscription, 
    isResourceOwner("Produto", storage.getProduct.bind(storage)), 
    async (req, res, next) => {
      try {
        const productId = parseInt(req.params.id);
        const updatedProduct = await storage.updateProduct(productId, req.body);
        res.json(updatedProduct);
      } catch (error) {
        next(error);
      }
    }
  );
  
  app.delete("/api/products/:id", 
    isAuthenticated, 
    hasActiveSubscription, 
    isResourceOwner("Produto", storage.getProduct.bind(storage)), 
    async (req, res, next) => {
      try {
        const productId = parseInt(req.params.id);
        await storage.deleteProduct(productId);
        res.status(204).end();
      } catch (error) {
        next(error);
      }
    }
  );
  
  // Animals routes
  app.get("/api/animals", isAuthenticated, hasActiveSubscription, async (req, res, next) => {
    try {
      const animals = await storage.getAnimalsByUser(req.user.id);
      res.json(animals);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/animals", isAuthenticated, hasActiveSubscription, async (req, res, next) => {
    try {
      const animalData = insertAnimalSchema.parse({
        ...req.body,
        tutorId: req.user.id
      });
      
      const animal = await storage.createAnimal(animalData);
      res.status(201).json(animal);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });
  
  app.get("/api/animals/:id", 
    isAuthenticated, 
    hasActiveSubscription, 
    isResourceOwner("Animal", storage.getAnimal.bind(storage)), 
    async (req, res, next) => {
      try {
        const animalId = parseInt(req.params.id);
        const animal = await storage.getAnimal(animalId);
        res.json(animal);
      } catch (error) {
        next(error);
      }
    }
  );
  
  app.put("/api/animals/:id", 
    isAuthenticated, 
    hasActiveSubscription, 
    isResourceOwner("Animal", storage.getAnimal.bind(storage)), 
    async (req, res, next) => {
      try {
        const animalId = parseInt(req.params.id);
        const updatedAnimal = await storage.updateAnimal(animalId, req.body);
        res.json(updatedAnimal);
      } catch (error) {
        next(error);
      }
    }
  );
  
  app.delete("/api/animals/:id", 
    isAuthenticated, 
    hasActiveSubscription, 
    isResourceOwner("Animal", storage.getAnimal.bind(storage)), 
    async (req, res, next) => {
      try {
        const animalId = parseInt(req.params.id);
        await storage.deleteAnimal(animalId);
        res.status(204).end();
      } catch (error) {
        next(error);
      }
    }
  );
  
  // Vaccines routes
  app.get("/api/vaccines", isAuthenticated, hasActiveSubscription, async (req, res, next) => {
    try {
      const vaccines = await storage.getVaccinesByUser(req.user.id);
      
      // Enrich vaccine data with animal information
      const enrichedVaccines = await Promise.all(
        vaccines.map(async (vaccine) => {
          const animal = await storage.getAnimal(vaccine.animalId);
          return {
            ...vaccine,
            animal: animal || { name: "Desconhecido", species: "Desconhecido" },
          };
        })
      );
      
      res.json(enrichedVaccines);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/vaccines", isAuthenticated, hasActiveSubscription, async (req, res, next) => {
    try {
      const vaccineData = insertVaccineSchema.parse(req.body);
      
      // Verify the animal belongs to the user
      const animal = await storage.getAnimal(vaccineData.animalId);
      if (!animal) {
        return res.status(404).json({ message: "Animal não encontrado" });
      }
      
      if (animal.tutorId !== req.user.id && req.user.userType !== "admin") {
        return res.status(403).json({ message: "Permissão negada" });
      }
      
      const vaccine = await storage.createVaccine(vaccineData);
      res.status(201).json(vaccine);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });
  
  app.get("/api/vaccines/:id", isAuthenticated, hasActiveSubscription, async (req, res, next) => {
    try {
      const vaccineId = parseInt(req.params.id);
      if (isNaN(vaccineId)) {
        return res.status(400).json({ message: "ID de vacina inválido" });
      }
      
      const vaccine = await storage.getVaccine(vaccineId);
      if (!vaccine) {
        return res.status(404).json({ message: "Vacina não encontrada" });
      }
      
      // Verify the animal belongs to the user
      const animal = await storage.getAnimal(vaccine.animalId);
      if (!animal) {
        return res.status(404).json({ message: "Animal não encontrado" });
      }
      
      if (animal.tutorId !== req.user.id && req.user.userType !== "admin") {
        return res.status(403).json({ message: "Permissão negada" });
      }
      
      res.json(vaccine);
    } catch (error) {
      next(error);
    }
  });
  
  app.put("/api/vaccines/:id", isAuthenticated, hasActiveSubscription, async (req, res, next) => {
    try {
      const vaccineId = parseInt(req.params.id);
      if (isNaN(vaccineId)) {
        return res.status(400).json({ message: "ID de vacina inválido" });
      }
      
      const vaccine = await storage.getVaccine(vaccineId);
      if (!vaccine) {
        return res.status(404).json({ message: "Vacina não encontrada" });
      }
      
      // Verify the animal belongs to the user
      const animal = await storage.getAnimal(vaccine.animalId);
      if (!animal) {
        return res.status(404).json({ message: "Animal não encontrado" });
      }
      
      if (animal.tutorId !== req.user.id && req.user.userType !== "admin") {
        return res.status(403).json({ message: "Permissão negada" });
      }
      
      const updatedVaccine = await storage.updateVaccine(vaccineId, req.body);
      res.json(updatedVaccine);
    } catch (error) {
      next(error);
    }
  });
  
  app.delete("/api/vaccines/:id", isAuthenticated, hasActiveSubscription, async (req, res, next) => {
    try {
      const vaccineId = parseInt(req.params.id);
      if (isNaN(vaccineId)) {
        return res.status(400).json({ message: "ID de vacina inválido" });
      }
      
      const vaccine = await storage.getVaccine(vaccineId);
      if (!vaccine) {
        return res.status(404).json({ message: "Vacina não encontrada" });
      }
      
      // Verify the animal belongs to the user
      const animal = await storage.getAnimal(vaccine.animalId);
      if (!animal) {
        return res.status(404).json({ message: "Animal não encontrado" });
      }
      
      if (animal.tutorId !== req.user.id && req.user.userType !== "admin") {
        return res.status(403).json({ message: "Permissão negada" });
      }
      
      await storage.deleteVaccine(vaccineId);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });
  
  // Subscription endpoint
  if (process.env.STRIPE_SECRET_KEY) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });
    
    app.post('/api/get-or-create-subscription', isAuthenticated, async (req, res) => {
      try {
        const user = req.user;
        
        if (user.stripeSubscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
          
          return res.send({
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
          });
        }
        
        // Create a new customer
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
        });
        
        // Create a subscription
        const subscription = await stripe.subscriptions.create({
          customer: customer.id,
          items: [{
            price: process.env.STRIPE_PRICE_ID || 'price_1234567890',
          }],
          payment_behavior: 'default_incomplete',
          expand: ['latest_invoice.payment_intent'],
        });
        
        // Update user with Stripe info
        await storage.updateUserStripeInfo(user.id, {
          stripeCustomerId: customer.id,
          stripeSubscriptionId: subscription.id
        });
        
        res.send({
          subscriptionId: subscription.id,
          clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
        });
      } catch (error: any) {
        return res.status(400).send({ error: { message: error.message } });
      }
    });
    
    // Webhook for Stripe events
    app.post('/api/webhook/stripe', async (req, res) => {
      const sig = req.headers['stripe-signature'] as string;
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      let event;
      
      try {
        if (!endpointSecret) {
          return res.status(400).send('Webhook secret not configured');
        }
        
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          endpointSecret
        );
      } catch (err: any) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
      
      // Handle subscription events
      if (event.type === 'customer.subscription.updated' ||
          event.type === 'customer.subscription.deleted') {
          
        const subscription = event.data.object as Stripe.Subscription;
        
        // Find the user with this subscription
        const users = Array.from(storage.users.values());
        const user = users.find(u => u.stripeSubscriptionId === subscription.id);
        
        if (user) {
          // Update subscription status based on the event
          if (event.type === 'customer.subscription.deleted') {
            await storage.updateUser(user.id, { stripeSubscriptionId: null });
          }
        }
      }
      
      res.send({ received: true });
    });
  }

  const httpServer = createServer(app);
  return httpServer;
}
