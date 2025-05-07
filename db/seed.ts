import { db } from "./index";
import * as schema from "@shared/schema";
import { eq, and } from "drizzle-orm";

async function seed() {
  try {
    console.log("Starting database seeding...");

    // Add countries
    const countries = [
      { code: "sa", name: "Saudi Arabia", flag: "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6", available: true },
      { code: "ae", name: "United Arab Emirates", flag: "https://images.unsplash.com/flagged/photo-1559717865-a99cac1c95d8", available: false },
      { code: "qa", name: "Qatar", flag: "https://images.unsplash.com/photo-1507904139316-3c7422a97a49", available: false },
      { code: "kw", name: "Kuwait", flag: null, available: false },
      { code: "bh", name: "Bahrain", flag: null, available: false },
      { code: "om", name: "Oman", flag: null, available: false },
    ];

    console.log("Adding countries...");
    for (const country of countries) {
      const existing = await db.query.countries.findFirst({
        where: (c) => eq(c.code, country.code),
      });

      if (!existing) {
        await db.insert(schema.countries).values(country);
        console.log(`Added country: ${country.name}`);
      } else {
        console.log(`Country ${country.name} already exists`);
      }
    }

    // Add exchange rate providers for Saudi Arabia
    const saProviders = [
      { providerKey: "stc", name: "STC Bank", logo: null, logoText: "STC", logoColor: "primary", url: "https://www.stcbank.com.sa/", type: "Digital Transfer", badge: "Best Rate", active: true, countryCode: "sa", sortOrder: 1 },
      { providerKey: "alrajhi", name: "Al Rajhi Bank", logo: null, logoText: "ARB", logoColor: "green", url: "https://www.alrajhibank.com.sa/EN", type: "Bank Transfer", badge: null, active: true, countryCode: "sa", sortOrder: 2 },
      { providerKey: "wu", name: "Western Union", logo: null, logoText: "WU", logoColor: "yellow", url: "https://www.westernunion.com/sa/en/home.html", type: "Cash Pickup", badge: null, active: true, countryCode: "sa", sortOrder: 3 },
      { providerKey: "barq", name: "Barq", logo: null, logoText: "Barq", logoColor: "orange", url: "https://barq.com/", type: "Digital Wallet", badge: null, active: true, countryCode: "sa", sortOrder: 4 },
      { providerKey: "mobilypay", name: "MobilyPay", logo: null, logoText: "MP", logoColor: "purple", url: "https://mobilypay.sa/", type: "Mobile Wallet", badge: "Lowest Fee", active: true, countryCode: "sa", sortOrder: 5 },
      { providerKey: "tiqmo", name: "Tiqmo", logo: null, logoText: "TQ", logoColor: "blue", url: "https://tiqmo.com/", type: "Digital Wallet", badge: null, active: true, countryCode: "sa", sortOrder: 6 },
      { providerKey: "d360", name: "D360 Bank", logo: null, logoText: "D360", logoColor: "indigo", url: "https://d360.com/en", type: "Bank Transfer", badge: null, active: true, countryCode: "sa", sortOrder: 7 },
      { providerKey: "alinma", name: "AlInma", logo: null, logoText: "AI", logoColor: "teal", url: "https://www.alinma.com/", type: "Bank Transfer", badge: null, active: true, countryCode: "sa", sortOrder: 8 },
      { providerKey: "urpay", name: "Urpay", logo: null, logoText: "UP", logoColor: "red", url: "https://www.urpay.com.sa/", type: "Digital Wallet", badge: null, active: true, countryCode: "sa", sortOrder: 9 },
      { providerKey: "friendipay", name: "FriendiPay", logo: null, logoText: "FP", logoColor: "pink", url: "https://www.friendipay.sa/", type: "Mobile Wallet", badge: null, active: true, countryCode: "sa", sortOrder: 10 },
    ];

    console.log("Adding providers...");
    const providerMap = new Map();
    for (const provider of saProviders) {
      const existing = await db.query.providers.findFirst({
        where: (p) => eq(p.providerKey, provider.providerKey),
      });

      if (!existing) {
        const [newProvider] = await db.insert(schema.providers).values(provider).returning();
        providerMap.set(provider.providerKey, newProvider.id);
        console.log(`Added provider: ${provider.name}`);
      } else {
        providerMap.set(provider.providerKey, existing.id);
        console.log(`Provider ${provider.name} already exists`);
      }
    }

    // Define currencies that we support
    const currencies = ["INR", "PKR", "PHP", "BDT", "NPR", "EGP", "LKR", "USD", "GBP", "EUR"];

    // Add exchange rates for each provider and currency
    console.log("Adding exchange rates...");
    for (const [providerKey, providerId] of providerMap.entries()) {
      for (const currency of currencies) {
        // Check if exchange rate exists
        const existing = await db.query.exchangeRates.findFirst({
          where: (er) => and(
            eq(er.providerId, providerId),
            eq(er.fromCurrency, "SAR"),
            eq(er.toCurrency, currency)
          ),
        });

        // Generate realistic mock data for each provider
        let rate, rateChange, fees, transferTime, rating, highlight;
        
        switch (currency) {
          case "INR":
            rate = 22.00 + (Math.random() * 0.30 - 0.15); // Range around 22.00
            break;
          case "PKR":
            rate = 73.50 + (Math.random() * 1.00 - 0.50); // Range around 73.50
            break;
          case "PHP":
            rate = 15.20 + (Math.random() * 0.40 - 0.20); // Range around 15.20
            break;
          case "BDT":
            rate = 29.80 + (Math.random() * 0.40 - 0.20); // Range around 29.80
            break;
          case "NPR":
            rate = 35.40 + (Math.random() * 0.60 - 0.30); // Range around 35.40
            break;
          case "EGP":
            rate = 8.60 + (Math.random() * 0.20 - 0.10); // Range around 8.60
            break;
          case "LKR":
            rate = 84.70 + (Math.random() * 1.00 - 0.50); // Range around 84.70
            break;
          case "USD":
            rate = 0.267 + (Math.random() * 0.004 - 0.002); // Range around 0.267
            break;
          case "GBP":
            rate = 0.208 + (Math.random() * 0.004 - 0.002); // Range around 0.208
            break;
          case "EUR":
            rate = 0.244 + (Math.random() * 0.004 - 0.002); // Range around 0.244
            break;
          default:
            rate = 1.00;
        }

        // Provider-specific adjustments
        if (providerKey === "stc") {
          rate += 0.15; // STC has best rates
          fees = providerKey === "stc" ? 10 : 15;
          transferTime = "1-3 hours";
          rating = 4.8;
          highlight = true;
        } else if (providerKey === "mobilypay") {
          fees = 0; // MobilyPay has lowest fees
          transferTime = "1-12 hours";
          rating = 4.0;
          highlight = true;
        } else if (providerKey === "wu") {
          fees = 25;
          transferTime = "Minutes";
          rating = 4.0;
          highlight = false;
        } else if (providerKey === "alrajhi") {
          fees = 15;
          transferTime = "1-2 days";
          rating = 4.5;
          highlight = false;
        } else if (providerKey === "barq") {
          fees = 5;
          transferTime = "1-24 hours";
          rating = 4.3;
          highlight = false;
        } else {
          fees = 5 + Math.floor(Math.random() * 20); // Random fees between 5 and 25
          transferTime = Math.floor(Math.random() * 3) === 0 ? "1-2 days" : (Math.floor(Math.random() * 2) === 0 ? "1-24 hours" : "6-12 hours");
          rating = 3.0 + Math.random() * 2.0; // Random rating between 3.0 and 5.0
          highlight = false;
        }

        // Random rate change between -0.20% and +0.25%
        rateChange = (Math.random() * 0.45 - 0.20);

        if (!existing) {
          await db.insert(schema.exchangeRates).values({
            providerId,
            fromCurrency: "SAR",
            toCurrency: currency,
            rate,
            rateChange,
            fees,
            feeType: fees === 0 ? "First transfer" : (Math.random() > 0.5 ? "Fixed fee" : "Variable fee"),
            transferTime,
            rating,
            highlight,
            lastUpdated: new Date()
          });
          console.log(`Added exchange rate: SAR to ${currency} for ${providerKey}`);
        } else {
          console.log(`Exchange rate SAR to ${currency} for ${providerKey} already exists`);
        }
      }
    }

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error during database seeding:", error);
  }
}

seed();
