import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

async function updateLogos() {
  try {
    console.log("Starting provider logo update with simpler URLs...");

    // Define provider logos with simpler URLs
    const providerLogos = [
      {
        providerKey: "stc",
        logo: "https://www.stcbank.com.sa/sites/web-v1/themes/custom/stcpay/logo.svg"
      },
      {
        providerKey: "barq",
        logo: "https://barq.com/images/barq-logo.png" // Simplified URL
      },
      {
        providerKey: "tiqmo",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Tiqmo-Logo.svg/2560px-Tiqmo-Logo.svg.png" // Alternative source
      },
      {
        providerKey: "friendipay",
        logo: "https://friendimobile.sa/wp-content/uploads/2019/09/logo_new-1.png" // Company website source
      },
      {
        providerKey: "alrajhi",
        logo: "https://www.alrajhibank.com.sa/sites/default/files/2021-09/alrajhi-bank-logo.svg" // Official source
      },
      {
        providerKey: "wu",
        logo: "https://upload.wikimedia.org/wikipedia/commons/4/48/Western_Union_Logo.svg" // Wikimedia SVG
      },
      {
        providerKey: "mobilypay",
        logo: "https://www.mobily.com.sa/img/mobily-logo-top.png" // Official source
      },
      {
        providerKey: "d360",
        logo: "https://d360bank.sa/themes/custom/d360/logo.svg" // Official source
      },
      {
        providerKey: "alinma",
        logo: "https://alinma.com/style%20library/en/img/inma-logo-en.png" // Official source
      },
      {
        providerKey: "urpay",
        logo: "https://www.urpay.com.sa/static/media/urpay.de1d24f0ea7841c4d0f1.png" // Official source
      }
    ];

    // Update each provider with its logo
    for (const providerLogo of providerLogos) {
      const result = await db
        .update(schema.providers)
        .set({
          logo: providerLogo.logo
        })
        .where(eq(schema.providers.providerKey, providerLogo.providerKey))
        .returning();

      if (result.length > 0) {
        console.log(`Updated logo for ${providerLogo.providerKey}`);
      } else {
        console.log(`Provider ${providerLogo.providerKey} not found`);
      }
    }

    console.log("Provider logo update completed successfully!");
  } catch (error) {
    console.error("Error during provider logo update:", error);
  }
}

updateLogos();