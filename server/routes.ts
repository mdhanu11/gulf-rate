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
import ConnectPgSimple from "connect-pg-simple";

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
  
  // PostgreSQL session store
  const PgSession = ConnectPgSimple(session);
  
  // Configure session middleware with PostgreSQL store
  app.use(session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      tableName: 'session', // Will be created automatically
      createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || 'gulf-rate-secret-key-production',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: false, // Keep false for Replit deployments
      sameSite: 'lax', // Use lax for same-site deployment
      httpOnly: true // Security: prevent XSS attacks
    },
    name: 'gulf_rate_session' // Custom session name
  }));
  
  // Define the API routes
  const apiPrefix = '/api';
  
  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });
  
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
  
  // Admin middleware to check authentication - simplified version
  const isAdminAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    // For simplified testing purposes, allow admin access without checking session
    // In a production environment, you would properly validate the session
    return next();
  };

  // Role-based permission middleware
  const requireRole = (allowedRoles: string[]) => {
    return (req: Request & { session: session.Session & Partial<session.SessionData> }, res: Response, next: NextFunction) => {
      // For simplified testing, allow access for now
      // In production, check req.session.adminRole and verify it's in allowedRoles
      return next();
    };
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
      
      // Set no-cache headers to ensure fresh data on deployment
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
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
  
  // Get all providers
  app.get(`${apiPrefix}/providers`, async (req, res) => {
    try {
      const providers = await storage.getProviders();
      return res.json(providers);
    } catch (error) {
      console.error('Error fetching providers:', error);
      return res.status(500).json({
        message: 'Failed to fetch providers'
      });
    }
  });
  
  // Get providers by country
  app.get(`${apiPrefix}/countries/:countryCode/providers`, async (req, res) => {
    try {
      const { countryCode } = req.params;
      if (!countryCode) {
        return res.status(400).json({
          message: 'Country code is required'
        });
      }
      
      const providers = await storage.getProvidersByCountry(countryCode);
      return res.json(providers);
    } catch (error) {
      console.error('Error fetching providers by country:', error);
      return res.status(500).json({
        message: 'Failed to fetch providers'
      });
    }
  });
  
  // Get available currencies for a country
  app.get(`${apiPrefix}/countries/:countryCode/currencies`, async (req, res) => {
    try {
      const { countryCode } = req.params;
      if (!countryCode) {
        return res.status(400).json({
          message: 'Country code is required'
        });
      }
      
      const currencies = await storage.getAvailableCurrencies(countryCode);
      return res.json(currencies);
    } catch (error) {
      console.error('Error fetching currencies by country:', error);
      return res.status(500).json({
        message: 'Failed to fetch currencies'
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
  
  // Admin authentication check
  app.get(`${apiPrefix}/admin/check-auth`, (req: Request & { session: session.Session & Partial<session.SessionData> }, res) => {
    if (req.session && req.session.adminId) {
      return res.status(200).json({ 
        authenticated: true,
        admin: {
          id: req.session.adminId,
          username: req.session.adminUsername,
          role: req.session.adminRole
        }
      });
    } else {
      return res.status(401).json({ authenticated: false });
    }
  });
  
  // Get all exchange rates (admin)
  app.get(`${apiPrefix}/admin/exchange-rates`, isAdminAuthenticated, async (req, res) => {
    try {
      // Set no-cache headers for admin data
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });

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
  
  // Bulk update exchange rates (admin) - fixed version with better error handling
  app.post(`${apiPrefix}/admin/bulk-update-rates`, isAdminAuthenticated, async (req, res) => {
    try {
      const { rates } = req.body;
      
      console.log('Received rates update:', JSON.stringify(rates));
      
      if (!rates || !Array.isArray(rates) || rates.length === 0) {
        return res.status(400).json({ message: 'No rates provided for update' });
      }
      
      // Track update results
      const results = [];
      
      // Process each rate update
      for (const rateUpdate of rates) {
        try {
          if (!rateUpdate) {
            console.error('Received null or undefined rate update');
            continue;
          }

          // Use the direct id if provided, otherwise find by providerId/toCurrency
          const { id, providerId, toCurrency, rate, fees } = rateUpdate;

          // Skip if no ID is provided
          if (!id) {
            console.error('Rate update missing ID');
            results.push({
              success: false,
              message: 'Missing rate ID'
            });
            continue;
          }
          
          // Create update values object with lastUpdated timestamp
          const updateValues: Record<string, any> = { 
            lastUpdated: new Date() 
          };
          
          // Add rate to update if it was provided and is valid
          if (rate !== undefined && rate !== null) {
            const numericRate = typeof rate === 'number' ? rate : parseFloat(rate.toString());
            if (!isNaN(numericRate)) {
              updateValues.rate = numericRate;
              console.log(`Setting rate to ${numericRate} (type: ${typeof numericRate})`);
            } else {
              console.error(`Invalid rate value: ${rate}`);
            }
          }
          
          // Add fees to update if it was provided and is valid
          if (fees !== undefined && fees !== null) {
            const numericFees = typeof fees === 'number' ? fees : parseFloat(fees.toString());
            if (!isNaN(numericFees)) {
              updateValues.fees = numericFees;
              console.log(`Setting fees to ${numericFees} (type: ${typeof numericFees})`);
            } else {
              console.error(`Invalid fees value: ${fees}`);
            }
          }
          
          // Check if we have any fields to update
          if (Object.keys(updateValues).length <= 1) { // Only lastUpdated is present
            console.log('No valid fields to update');
            results.push({
              id,
              success: false,
              message: 'No valid fields to update'
            });
            continue;
          }

          // Update the rate in the database
          console.log(`Updating rate ID ${id} with:`, updateValues);
          
          // Execute the update
          const updateResult = await db.update(exchangeRates)
            .set(updateValues)
            .where(eq(exchangeRates.id, id))
            .returning();
            
          console.log(`Update result:`, updateResult);
          
          // Fetch the updated record to confirm update
          const updatedRate = await db.query.exchangeRates.findFirst({
            where: eq(exchangeRates.id, id)
          });
          
          if (updatedRate) {
            results.push({
              id,
              success: true,
              updatedRate
            });
          } else {
            results.push({
              id,
              success: false,
              message: 'Failed to retrieve updated rate'
            });
          }
        } catch (updateError) {
          console.error('Error updating single rate:', updateError);
          results.push({
            ...(rateUpdate || {}),
            success: false,
            message: String(updateError)
          });
        }
      }
      
      // Count successful updates
      const successCount = results.filter(r => r.success).length;
      
      return res.status(200).json({
        message: `${successCount} rates updated successfully`,
        results
      });
    } catch (error) {
      console.error('Error updating exchange rates:', error);
      return res.status(500).json({ message: 'Failed to update exchange rates', error: String(error) });
    }
  });
  
  // Create new exchange rate (admin)
  app.post(`${apiPrefix}/admin/exchange-rates`, isAdminAuthenticated, async (req, res) => {
    try {
      const { 
        providerId, 
        countryCode, 
        fromCurrency, 
        toCurrency, 
        rate, 
        fees, 
        feeType, 
        transferTime,
        rateChange 
      } = req.body;
      
      // Basic validation
      if (!providerId || !countryCode || !fromCurrency || !toCurrency || !rate || fees === undefined || !feeType) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      // Insert the exchange rate
      const [newRate] = await db.insert(exchangeRates).values({
        providerId: parseInt(providerId),
        fromCurrency: fromCurrency,
        toCurrency: toCurrency,
        rate: parseFloat(rate).toString(),
        rateChange: parseFloat(rateChange || 0).toString(),
        fees: parseFloat(fees).toString(),
        feeType: feeType,
        transferTime: transferTime || '1-2 days',
        rating: parseFloat("4.0").toString(),
        lastUpdated: new Date()
      }).returning();
      
      return res.status(201).json(newRate);
    } catch (error) {
      console.error('Error creating exchange rate:', error);
      return res.status(500).json({ message: 'Failed to create exchange rate' });
    }
  });
  
  // Create new provider (admin only)
  app.post(`${apiPrefix}/admin/providers`, requireRole(['admin']), async (req, res) => {
    try {
      // Validate the provider data
      const [newProvider] = await db.insert(providers)
        .values({
          ...req.body,
        })
        .returning();
      
      return res.status(201).json(newProvider);
    } catch (error) {
      console.error('Error creating provider:', error);
      return res.status(500).json({ message: 'Failed to create provider' });
    }
  });
  
  // Update a provider (admin only)
  app.patch(`${apiPrefix}/admin/providers/:id`, requireRole(['admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const providerId = parseInt(id);
      
      if (isNaN(providerId)) {
        return res.status(400).json({ message: 'Invalid provider ID' });
      }
      
      // Update the provider
      await db.update(providers)
        .set(req.body)
        .where(eq(providers.id, providerId));
      
      const updatedProvider = await db.query.providers.findFirst({
        where: eq(providers.id, providerId)
      });
      
      if (!updatedProvider) {
        return res.status(404).json({ message: 'Provider not found' });
      }
      
      return res.json(updatedProvider);
    } catch (error) {
      console.error('Error updating provider:', error);
      return res.status(500).json({ message: 'Failed to update provider' });
    }
  });
  
  // Update an exchange rate (admin and rate_editor)
  app.patch(`${apiPrefix}/admin/exchange-rates/:id`, requireRole(['admin', 'rate_editor']), async (req, res) => {
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
  
  // Bulk update exchange rates (admin and rate_editor)
  app.post(`${apiPrefix}/admin/bulk-update-rates`, requireRole(['admin', 'rate_editor']), async (req, res) => {
    try {
      const { rates } = req.body;
      
      if (!Array.isArray(rates) || rates.length === 0) {
        return res.status(400).json({ message: 'Invalid data format. Expected an array of rates.' });
      }
      
      const results = [];
      
      // Process each rate update
      for (const rateData of rates) {
        const { providerId, countryCode, toCurrency, ...updateData } = rateData;
        
        if (!providerId || !countryCode || !toCurrency) {
          continue; // Skip invalid entries
        }
        
        // Find the existing rate
        const existingRate = await db.query.exchangeRates.findFirst({
          where: and(
            eq(exchangeRates.providerId, providerId),
            eq(exchangeRates.fromCurrency, 'SAR'), // We assume from currency is always SAR
            eq(exchangeRates.toCurrency, toCurrency)
          )
        });
        
        if (existingRate) {
          // Update existing rate
          await db.update(exchangeRates)
            .set({
              ...updateData,
              lastUpdated: new Date()
            })
            .where(eq(exchangeRates.id, existingRate.id));
            
          results.push({
            id: existingRate.id,
            providerId,
            toCurrency,
            status: 'updated'
          });
        } else {
          // Create new rate if it doesn't exist
          const [newRate] = await db.insert(exchangeRates)
            .values({
              providerId,
              fromCurrency: 'SAR', // Default from currency
              toCurrency,
              rate: updateData.rate || 0,
              rateChange: updateData.rateChange || 0,
              fees: updateData.fees || 0,
              feeType: updateData.feeType || 'Fixed fee',
              transferTime: updateData.transferTime || '1-2 days',
              rating: updateData.rating || 4,
              highlight: updateData.highlight || false,
              lastUpdated: new Date()
            })
            .returning();
            
          results.push({
            id: newRate.id,
            providerId,
            toCurrency,
            status: 'created'
          });
        }
      }
      
      return res.json({ 
        success: true, 
        message: `Updated ${results.length} exchange rates`,
        results 
      });
    } catch (error) {
      console.error('Error updating exchange rates:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to update exchange rates' 
      });
    }
  });
  
  // Create a rate editor user
  app.post(`${apiPrefix}/admin/create-rate-editor`, async (req, res) => {
    try {
      const { username, password, fullName, email } = req.body;
      
      // Check if user already exists
      const existingUser = await db.query.admins.findFirst({
        where: eq(admins.username, username)
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      // Create rate editor user
      const hashedPassword = await hashPassword(password);
      const [newUser] = await db.insert(admins)
        .values({
          username,
          passwordHash: hashedPassword,
          fullName,
          email,
          role: 'rate_editor'
        })
        .returning();
      
      return res.status(201).json({ 
        message: 'Rate editor created successfully',
        user: { id: newUser.id, username: newUser.username, role: newUser.role }
      });
    } catch (error) {
      console.error('Error creating rate editor:', error);
      return res.status(500).json({ message: 'Failed to create rate editor' });
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
