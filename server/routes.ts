import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Define the API routes
  const apiPrefix = '/api';
  
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
      
      return res.json(data.rates);
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

  return httpServer;
}
