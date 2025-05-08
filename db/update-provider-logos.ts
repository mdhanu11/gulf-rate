import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

async function updateLogos() {
  try {
    console.log("Starting provider logo update...");

    // Define provider logos
    const providerLogos = [
      {
        providerKey: "stc",
        logo: "https://www.stcbank.com.sa/sites/web-v1/themes/custom/stcpay/logo.svg"
      },
      {
        providerKey: "barq",
        logo: "https://starpng.com/public/uploads/preview/blue-lightning-bolt-logo-png-1-11575331111mqvcx1gzly.png"
      },
      {
        providerKey: "tiqmo",
        logo: "https://www.aps.com.sa/wp-content/uploads/2023/07/tiqmo-2.jpg"
      },
      {
        providerKey: "friendipay",
        logo: "https://play-lh.googleusercontent.com/OQg-lWMxXkzV3PkI_yHELQGPPPfuJXr38S0mbuBYYhUa9vlbFv4JacrJmLmjKSPPdA=w240-h480-rw"
      },
      {
        providerKey: "alrajhi",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/e/e8/AlRajhi_Bank.svg/1200px-AlRajhi_Bank.svg.png"
      },
      {
        providerKey: "wu",
        logo: "https://1000logos.net/wp-content/uploads/2021/05/Western-Union-logo.png"
      },
      {
        providerKey: "mobilypay",
        logo: "https://play-lh.googleusercontent.com/c1EvUMmKB4OB7tpGOATnTQCkWBEI-I4kqYLaX9D2BQ6hY30tiOQL5QYZxZKvKBby2Q=w240-h480-rw"
      },
      {
        providerKey: "d360",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoSEoMK4p1zyPT42wh-UoPEJKc2qVzJMGQ4FVHZCgMMKMgjTQPH3qz0xyj3m3wbXGIhkw&usqp=CAU"
      },
      {
        providerKey: "alinma",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8b/Alinma_Bank_Logo.svg/1200px-Alinma_Bank_Logo.svg.png"
      },
      {
        providerKey: "urpay",
        logo: "https://play-lh.googleusercontent.com/iNADiWGzJMpTZEpqvEuSoK3FLKHOVoklrmcq4y3z5hTGJMMZRvL27hVU6V6V2X2p4SI=w240-h480-rw"
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