import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { User } from "@shared/schema";

// Middleware to check if user is authenticated
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({ message: "Não autenticado" });
}

// Middleware to check if user is an admin
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user.userType === "admin") {
    return next();
  }
  
  res.status(403).json({ message: "Permissão negada" });
}

// Middleware to check if user has an active subscription
export function hasActiveSubscription(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Não autenticado" });
  }
  
  const user = req.user as User;
  const isSubscribed = storage.isSubscriptionActive(user);
  
  if (isSubscribed) {
    return next();
  }
  
  const trialDaysLeft = storage.getTrialDaysLeft(user);
  
  if (trialDaysLeft > 0) {
    // Still in trial period, allow access
    return next();
  }
  
  // Trial ended and no subscription
  res.status(402).json({ 
    message: "Seu período de teste terminou. Por favor, assine o plano para continuar usando o sistema.",
    requiresPayment: true
  });
}

// Factory function to create a resource owner check middleware
export function isResourceOwner(
  resourceType: string,
  getResourceFn: (id: number) => Promise<any>
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }
    
    const resourceId = parseInt(req.params.id);
    if (isNaN(resourceId)) {
      return res.status(400).json({ message: "ID inválido" });
    }
    
    try {
      const resource = await getResourceFn(resourceId);
      
      if (!resource) {
        return res.status(404).json({ message: `${resourceType} não encontrado` });
      }
      
      const userId = resource.userId || resource.tutorId;
      
      // Admin can access all resources
      if (req.user.userType === "admin" || userId === req.user.id) {
        return next();
      }
      
      res.status(403).json({ message: "Permissão negada" });
    } catch (error) {
      next(error);
    }
  };
}
