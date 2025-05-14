import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema, insertAdminSchema, insertExchangeRateSchema } from "@shared/schema";
import { z } from "zod";
import { db } from "@db";
import { admins, exchangeRates, providers } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { scrypt as _scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import session from "express-session";

// Extend Express session with our custom properties
declare module "express-session" {
  interface SessionData {
    adminId?: number;
    adminUsername?: string;
    adminRole?: string;
  }
}

// Promisify scrypt for async password hashing
const scrypt = promisify(_scrypt);

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Define the API routes
  const apiPrefix = '/api';
  
  // Helper function to hash passwords
  async function hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const buf = (await scrypt(password, salt, 64)) as Buffer;
    return `${buf.toString('hex')}.${salt}`;
  }
  
  // Helper function to compare passwords
  async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
    const [hashed, salt] = stored.split('.');
    const hashedBuf = Buffer.from(hashed, 'hex');
    const suppliedBuf = (await scrypt(supplied, salt, 64)) as Buffer;
    return hashedBuf.length === suppliedBuf.length && 
      hashedBuf.every((b, i) => b === suppliedBuf[i]);
  }
  
  // Admin middleware to check authentication
  const isAdminAuthenticated = (req: Request & { session: session.Session & Partial<session.SessionData> }, res: Response, next: NextFunction) => {
    if (req.session && req.session.adminId) {
      return next();
    }
    return res.status(401).json({ message: 'Unauthorized' });
  };
  
  // Get exchange rates for a specific country and currency
  app.get(`${apiPrefix}/exchange-rates/:countryCode/:currency`, async (req, res) => {
    try {
      const { countryCode, currency } = req.params;
      
      // Validate request parameters
      if (!countryCode || !currency) {
        return res.status(400).json({ 
          message: 'Country code and currency are required' 
        });
      }
      
      // Get exchange rates
      const data = await storage.getExchangeRates(countryCode, currency);
      
      // Return the complete data structure with rates array and lastUpdated
      return res.json(data);
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      return res.status(500).json({ 
        message: 'Failed to fetch exchange rates' 
      });
    }
  });
  
  // Create a new lead (from the lead capture form)
  app.post(`${apiPrefix}/leads`, async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertLeadSchema.parse(req.body);
      
      // Save lead to database
      const newLead = await storage.createLead(validatedData);
      
      return res.status(201).json({ 
        message: 'Successfully subscribed to rate alerts',
        lead: { id: newLead.id }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation failed',
          errors: error.errors 
        });
      }
      
      console.error('Error creating lead:', error);
      return res.status(500).json({ 
        message: 'Failed to process your subscription' 
      });
    }
  });
  
  // Get all available countries
  app.get(`${apiPrefix}/countries`, async (req, res) => {
    try {
      const countries = await storage.getCountries();
      return res.json(countries);
    } catch (error) {
      console.error('Error fetching countries:', error);
      return res.status(500).json({ 
        message: 'Failed to fetch countries' 
      });
    }
  });

  // Admin login
  app.post(`${apiPrefix}/admin/login`, async (req: Request & { session: session.Session & Partial<session.SessionData> }, res) => {
    try {
      const { username, password } = req.body;
      
      // Find admin by username
      const admin = await db.query.admins.findFirst({
        where: eq(admins.username, username)
      });
      
      if (!admin) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Compare passwords
      const passwordValid = await comparePasswords(password, admin.passwordHash);
      if (!passwordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Set admin session
      if (req.session) {
        req.session.adminId = admin.id;
        req.session.adminUsername = admin.username;
        req.session.adminRole = admin.role || 'editor';
      }
      
      // Update last login time
      await db.update(admins)
        .set({ lastLogin: new Date() })
        .where(eq(admins.id, admin.id));
      
      return res.status(200).json({ 
        message: 'Logged in successfully',
        admin: { 
          id: admin.id, 
          username: admin.username,
          fullName: admin.fullName,
          role: admin.role 
        }
      });
    } catch (error) {
      console.error('Admin login error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Admin logout
  app.post(`${apiPrefix}/admin/logout`, (req: Request & { session: session.Session & Partial<session.SessionData> }, res) => {
    if (req.session) {
      req.session.destroy((err: Error) => {
        if (err) {
          return res.status(500).json({ message: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        return res.status(200).json({ message: 'Logged out successfully' });
      });
    } else {
      return res.status(200).json({ message: 'Already logged out' });
    }
  });
  
  // Get all exchange rates (admin)
  app.get(`${apiPrefix}/admin/exchange-rates`, isAdminAuthenticated, async (req, res) => {
    try {
      const rates = await db.query.exchangeRates.findMany({
        with: {
          provider: true
        },
        orderBy: [
          desc(exchangeRates.lastUpdated)
        ],
      });
      
      return res.json(rates);
    } catch (error) {
      console.error('Error fetching admin exchange rates:', error);
      return res.status(500).json({ message: 'Failed to fetch exchange rates' });
    }
  });
  
  // Get all providers (admin)
  app.get(`${apiPrefix}/admin/providers`, isAdminAuthenticated, async (req, res) => {
    try {
      const allProviders = await db.query.providers.findMany({
        orderBy: [
          providers.name,
        ],
      });
      
      return res.json(allProviders);
    } catch (error) {
      console.error('Error fetching providers:', error);
      return res.status(500).json({ message: 'Failed to fetch providers' });
    }
  });
  
  // Update an exchange rate (admin)
  app.patch(`${apiPrefix}/admin/exchange-rates/:id`, isAdminAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const rateId = parseInt(id);
      
      if (isNaN(rateId)) {
        return res.status(400).json({ message: 'Invalid rate ID' });
      }
      
      // Update the exchange rate
      const updateData = {
        ...req.body,
        lastUpdated: new Date(),
      };
      
      await db.update(exchangeRates)
        .set(updateData)
        .where(eq(exchangeRates.id, rateId));
      
      const updatedRate = await db.query.exchangeRates.findFirst({
        where: eq(exchangeRates.id, rateId),
        with: {
          provider: true
        }
      });
      
      return res.json(updatedRate);
    } catch (error) {
      console.error('Error updating exchange rate:', error);
      return res.status(500).json({ message: 'Failed to update exchange rate' });
    }
  });
  
  // Create a new exchange rate (admin)
  app.post(`${apiPrefix}/admin/exchange-rates`, isAdminAuthenticated, async (req, res) => {
    try {
      // Create a new exchange rate record
      const [newRate] = await db.insert(exchangeRates)
        .values({
          ...req.body,
          lastUpdated: new Date(),
        })
        .returning();
      
      const createdRate = await db.query.exchangeRates.findFirst({
        where: eq(exchangeRates.id, newRate.id),
        with: {
          provider: true
        }
      });
      
      return res.status(201).json(createdRate);
    } catch (error) {
      console.error('Error creating exchange rate:', error);
      return res.status(500).json({ message: 'Failed to create exchange rate' });
    }
  });
  
  // Create a default admin user if none exists
  // Remove in production or add proper security
  app.post(`${apiPrefix}/admin/setup`, async (req, res) => {
    try {
      // Check if admin already exists
      const existingAdmin = await db.query.admins.findFirst();
      
      if (existingAdmin) {
        return res.status(400).json({ message: 'Admin already exists' });
      }
      
      // Create default admin
      const hashedPassword = await hashPassword('admin123');
      const [admin] = await db.insert(admins)
        .values({
          username: 'admin',
          passwordHash: hashedPassword,
          fullName: 'Admin User',
          email: 'admin@gulfrate.com',
          role: 'admin'
        })
        .returning();
      
      return res.status(201).json({ 
        message: 'Admin setup successful',
        admin: { id: admin.id, username: admin.username }
      });
    } catch (error) {
      console.error('Error in admin setup:', error);
      return res.status(500).json({ message: 'Admin setup failed' });
    }
  });
  
  return httpServer;
}
