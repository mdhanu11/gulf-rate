import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

async function updateLogos() {
  try {
    console.log("Starting provider logo update with local images...");

    // Define provider logos with local images where available
    const providerLogos = [
      {
        providerKey: "stc",
        logo: "https://upload.wikimedia.org/wikipedia/en/8/8e/Stc_pay_logo.png"
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
        logo: "https://upload.wikimedia.org/wikipedia/en/e/e8/AlRajhi_Bank.svg"
      },
      {
        providerKey: "wu",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Western_Union_Logo.svg/640px-Western_Union_Logo.svg.png"
      },
      {
        providerKey: "mobilypay",
        logo: "https://upload.wikimedia.org/wikipedia/en/7/75/Mobily_logo.svg"
      },
      {
        providerKey: "d360",
        logo: "https://www.corevalues360.com/360-degree-values-assessment/img/360-degree.png"
      },
      {
        providerKey: "alinma",
        logo: "/images/providers/alinma.png" // Local image
      },
      {
        providerKey: "urpay",
        logo: "https://play-lh.googleusercontent.com/AqJIXfJrAK7lXwjCjr7VW3GR8vmg8Npnj_vfiVzEu0eMKX4dbWF60M_VR8PGaVP_3QA=w240-h480-rw"
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