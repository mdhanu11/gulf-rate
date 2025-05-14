import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User table (keeping original users table as required)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Lead table to store user contact information for rate alerts
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  countryCode: text("country_code").notNull(),
  phone: text("phone").notNull(),
  fromCurrency: text("from_currency").notNull(),
  toCurrency: text("to_currency").notNull(),
  targetRate: text("target_rate"),
  consent: boolean("consent").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  emailSent: boolean("email_sent").default(false),
  countryCode2: text("country_code_2").notNull().default("sa"),
});

export const insertLeadSchema = createInsertSchema(leads, {
  fullName: (schema) => schema.min(2, "Full name must be at least 2 characters"),
  email: (schema) => schema.email("Please enter a valid email address"),
  countryCode: (schema) => schema.min(1, "Country code is required"),
  phone: (schema) => schema.min(9, "Phone number must be at least 9 digits"),
  fromCurrency: (schema) => schema.min(1, "From currency is required"),
  toCurrency: (schema) => schema.min(1, "To currency is required"),
  consent: (schema) => schema.refine((val) => val === true, "You must agree to receive alerts"),
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

// Providers for exchange rates
export const providers = pgTable("providers", {
  id: serial("id").primaryKey(),
  providerKey: text("provider_key").notNull().unique(),
  name: text("name").notNull(),
  logo: text("logo"),
  logoText: text("logo_text"),
  logoColor: text("logo_color"),
  url: text("url").notNull(),
  type: text("type").notNull(),
  badge: text("badge"),
  active: boolean("active").default(true),
  countryCode: text("country_code").notNull(),
  sortOrder: integer("sort_order").default(0),
});

export type Provider = typeof providers.$inferSelect;

// Exchange rates for providers
export const exchangeRates = pgTable("exchange_rates", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => providers.id),
  fromCurrency: text("from_currency").notNull(),
  toCurrency: text("to_currency").notNull(),
  rate: decimal("rate", { precision: 10, scale: 4 }).notNull(),
  rateChange: decimal("rate_change", { precision: 10, scale: 4 }).default("0"),
  fees: decimal("fees", { precision: 10, scale: 2 }).default("0"),
  feeType: text("fee_type").default("Fixed fee"),
  transferTime: text("transfer_time").notNull(),
  rating: decimal("rating", { precision: 3, scale: 1 }).notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  highlight: boolean("highlight").default(false),
});

// Define relationships
export const providerRelations = relations(providers, ({ many }) => ({
  exchangeRates: many(exchangeRates),
}));

export const exchangeRateRelations = relations(exchangeRates, ({ one }) => ({
  provider: one(providers, {
    fields: [exchangeRates.providerId],
    references: [providers.id],
  }),
}));

// Schemas for validation
export const insertProviderSchema = createInsertSchema(providers);
export const selectProviderSchema = createSelectSchema(providers);
export const insertExchangeRateSchema = createInsertSchema(exchangeRates);
export const selectExchangeRateSchema = createSelectSchema(exchangeRates);

// Type for exchange rate with provider info (joined data)
export interface ExchangeRateWithProvider extends z.infer<typeof selectExchangeRateSchema> {
  provider: z.infer<typeof selectProviderSchema>;
}

// Admin users table for managing the system
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  role: text("role").default("editor"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
});

export const insertAdminSchema = createInsertSchema(admins, {
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  passwordHash: (schema) => schema.min(8, "Password must be at least 8 characters"),
  fullName: (schema) => schema.min(2, "Full name must be at least 2 characters"),
  email: (schema) => schema.email("Please enter a valid email address"),
});

export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;

// Countries table for country-specific info
export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  flag: text("flag"),
  available: boolean("available").default(false),
});

export const insertCountrySchema = createInsertSchema(countries);
export const selectCountrySchema = createSelectSchema(countries);
export type Country = typeof countries.$inferSelect;
