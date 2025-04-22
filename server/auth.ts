import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { storage, comparePasswords } from "./storage";
import { User, insertUserSchema, loginSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

declare global {
  namespace Express {
    interface User extends User {}
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "vetstock-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: { 
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      secure: process.env.NODE_ENV === "production",
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password"
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: "Email ou senha inválidos" });
          } else {
            return done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Validate the request body
      const validatedData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Este email já está em uso" });
      }

      const hashedPassword = validatedData.password;
      const user = await storage.createUser(validatedData);

      req.login(user, (err) => {
        if (err) return next(err);
        
        // Return user info without password
        const { password, ...userWithoutPassword } = user;
        const userResponse = {
          ...userWithoutPassword,
          isSubscribed: storage.isSubscriptionActive(user),
          trialDaysLeft: storage.getTrialDaysLeft(user)
        };
        
        res.status(201).json(userResponse);
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    try {
      // Validate request body
      loginSchema.parse(req.body);
      
      passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ message: info?.message || "Credenciais inválidas" });
        
        req.login(user, (err) => {
          if (err) return next(err);
          
          // Return user info without password
          const { password, ...userWithoutPassword } = user;
          const userResponse = {
            ...userWithoutPassword,
            isSubscribed: storage.isSubscriptionActive(user),
            trialDaysLeft: storage.getTrialDaysLeft(user)
          };
          
          res.status(200).json(userResponse);
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }
    
    const user = req.user as User;
    const { password, ...userWithoutPassword } = user;
    
    const userResponse = {
      ...userWithoutPassword,
      isSubscribed: storage.isSubscriptionActive(user),
      trialDaysLeft: storage.getTrialDaysLeft(user)
    };
    
    res.json(userResponse);
  });
}
