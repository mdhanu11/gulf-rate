import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

async function updateLogos() {
  try {
    console.log("Starting provider logo update with local images...");

    // Define provider logos with all local images
    const providerLogos = [
      {
        providerKey: "stc",
        logo: "https://upload.wikimedia.org/wikipedia/en/8/8e/Stc_pay_logo.png" // Still using external image for now
      },
      {
        providerKey: "barq",
        logo: "/images/providers/barq.png" // Local image
      },
      {
        providerKey: "tiqmo",
        logo: "/images/providers/tiqmo.png" // Local image
      },
      {
        providerKey: "friendipay",
        logo: "/images/providers/friendipay.jpg" // Local image
      },
      {
        providerKey: "alrajhi",
        logo: "/images/providers/alrajhi.png" // Local image
      },
      {
        providerKey: "wu",
        logo: "/images/providers/wu.svg" // Local image
      },
      {
        providerKey: "mobilypay",
        logo: "/images/providers/mobilypay.svg" // Local image
      },
      {
        providerKey: "d360",
        logo: "/images/providers/d360.svg" // Local image
      },
      {
        providerKey: "alinma",
        logo: "/images/providers/alinma.png" // Local image
      },
      {
        providerKey: "urpay",
        logo: "/images/providers/urpay.png" // Local image
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