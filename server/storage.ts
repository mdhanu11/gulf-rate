import { db } from "@db";
import { leads, providers, exchangeRates, countries } from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { InsertLead } from "@shared/schema";
import nodemailer from "nodemailer";

// Create a transporter for sending emails
let transporter: nodemailer.Transporter;

if (process.env.NODE_ENV === "production") {
  // Configure production SMTP (using env variables)
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.sendgrid.net",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
    },
  });
} else {
  // Use ethereal.email for development
  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: "ethereal.user@ethereal.email",
      pass: "ethereal_pass",
    },
  });
}

// Lead storage functions
export const storage = {
  // Create a new lead
  async createLead(data: InsertLead) {
    try {
      const [newLead] = await db.insert(leads).values(data).returning();
      
      // Send confirmation email
      await this.sendConfirmationEmail(newLead);
      
      // Update the lead to mark email as sent
      await db.update(leads)
        .set({ emailSent: true })
        .where(eq(leads.id, newLead.id));
      
      return newLead;
    } catch (error) {
      console.error("Error creating lead:", error);
      throw error;
    }
  },
  
  // Send confirmation email to the lead
  async sendConfirmationEmail(lead: any) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || "notifications@gulfrate.com",
        to: lead.email,
        subject: "Thanks for subscribing to Gulf Rate Alerts",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #0F52BA; padding: 20px; text-align: center; color: white;">
              <h1>Gulf Rate</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #eee; background-color: #fff;">
              <h2>Thank you for subscribing to Rate Alerts!</h2>
              <p>Hello ${lead.fullName},</p>
              <p>Thank you for subscribing to Gulf Rate alerts. We'll notify you when the exchange rate from ${lead.fromCurrency} to ${lead.toCurrency} reaches your target rate.</p>
              ${lead.targetRate ? `<p>Your target rate: <strong>${lead.targetRate}</strong></p>` : ''}
              <p>You can update your preferences or unsubscribe at any time by visiting your profile on our website.</p>
              <p>Best regards,<br>The Gulf Rate Team</p>
            </div>
            <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
              <p>© ${new Date().getFullYear()} Gulf Rate. All rights reserved.</p>
              <p>This email was sent to ${lead.email}. If you didn't sign up for rate alerts, please ignore this email.</p>
            </div>
          </div>
        `,
      };
      
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent: %s", info.messageId);
      return info;
    } catch (error) {
      console.error("Error sending confirmation email:", error);
      throw error;
    }
  },
  
  // Get exchange rates for a specific country and currency
  async getExchangeRates(countryCode: string, toCurrency: string) {
    try {
      // Get providers from the specified country
      const countryProviders = await db.query.providers.findMany({
        where: and(
          eq(providers.countryCode, countryCode.toLowerCase()),
          eq(providers.active, true)
        ),
        orderBy: providers.sortOrder,
      });
      
      // Get exchange rates for these providers
      const rates = await Promise.all(
        countryProviders.map(async (provider) => {
          const rate = await db.query.exchangeRates.findFirst({
            where: and(
              eq(exchangeRates.providerId, provider.id),
              eq(exchangeRates.fromCurrency, "SAR"),
              eq(exchangeRates.toCurrency, toCurrency)
            ),
            orderBy: desc(exchangeRates.lastUpdated),
          });
          
          if (rate) {
            return {
              id: provider.id,
              providerKey: provider.providerKey,
              name: provider.name,
              logo: provider.logo,
              logoText: provider.logoText,
              logoColor: provider.logoColor,
              url: provider.url,
              type: provider.type,
              badge: provider.badge,
              rate: parseFloat(rate.rate.toString()),
              rateChange: parseFloat((rate.rateChange || 0).toString()),
              fees: parseFloat((rate.fees || 0).toString()),
              feeType: rate.feeType,
              transferTime: rate.transferTime,
              rating: parseFloat(rate.rating.toString()),
              highlight: rate.highlight,
              lastUpdated: rate.lastUpdated
            };
          }
          return null;
        })
      );
      
      // Filter out null values and add metadata
      const validRates = rates.filter((rate) => rate !== null);
      
      // Add last updated timestamp for the whole dataset
      const lastUpdated = validRates.length > 0
        ? Math.max(...validRates.map((rate) => rate!.lastUpdated.getTime()))
        : new Date().getTime();
      
      return {
        rates: validRates,
        lastUpdated: new Date(lastUpdated),
      };
    } catch (error) {
      console.error("Error getting exchange rates:", error);
      throw error;
    }
  },
  
  // Get all available countries
  async getCountries() {
    try {
      return await db.query.countries.findMany({
        orderBy: [
          desc(countries.available),
          countries.name,
        ],
      });
    } catch (error) {
      console.error("Error getting countries:", error);
      throw error;
    }
  },
  
  // Get all providers
  async getProviders() {
    try {
      return await db.query.providers.findMany({
        orderBy: [
          desc(providers.active),
          providers.sortOrder,
          providers.name,
        ],
      });
    } catch (error) {
      console.error("Error getting providers:", error);
      throw error;
    }
  },
  
  // Get providers by country
  async getProvidersByCountry(countryCode: string) {
    try {
      return await db.query.providers.findMany({
        where: and(
          eq(providers.countryCode, countryCode.toLowerCase()),
          eq(providers.active, true)
        ),
        orderBy: providers.sortOrder,
      });
    } catch (error) {
      console.error(`Error getting providers for country ${countryCode}:`, error);
      throw error;
    }
  },
  
  // Get available currencies for a country
  async getAvailableCurrencies(countryCode: string) {
    try {
      const results = await db.select({
        toCurrency: exchangeRates.toCurrency
      })
      .from(exchangeRates)
      .innerJoin(
        providers,
        and(
          eq(exchangeRates.providerId, providers.id),
          eq(providers.countryCode, countryCode.toLowerCase()),
          eq(providers.active, true)
        )
      )
      .groupBy(exchangeRates.toCurrency);
      
      return results.map(result => result.toCurrency);
    } catch (error) {
      console.error(`Error getting currencies for country ${countryCode}:`, error);
      throw error;
    }
  }
};
