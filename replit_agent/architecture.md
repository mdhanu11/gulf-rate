# Architecture

## Overview

Gulf Rate is a web application designed to help expatriates in Gulf countries find and compare the best currency exchange rates across multiple providers. The application focuses on providing real-time exchange rate comparisons, rate alerts, and information about various money transfer services.

The system follows a client-server architecture with a React frontend and Node.js/Express backend. It uses Drizzle ORM with a PostgreSQL database (via Neon's serverless Postgres) for data persistence.

## System Architecture

The application follows a modern full-stack architecture with clear separation between client and server:

```
┌─────────────────────┐      ┌─────────────────────┐      ┌─────────────────────┐
│     Client Layer    │      │     Server Layer    │      │    Database Layer   │
│  (React, TailwindCSS)│<────>│ (Express.js, Node.js)│<────>│   (PostgreSQL/Neon) │
└─────────────────────┘      └─────────────────────┘      └─────────────────────┘
```

### Directory Structure

```
/
├── client/            # Frontend code (React)
│   ├── public/        # Static assets
│   └── src/           # React source code
│       ├── components/# UI components
│       ├── hooks/     # Custom React hooks
│       ├── lib/       # Utility functions
│       ├── locales/   # i18n translations
│       └── pages/     # Page components
├── server/            # Backend code (Express)
├── shared/            # Shared code between client and server
├── db/                # Database related code
└── [config files]     # Configuration files for different tools
```

## Key Components

### Frontend Architecture

The frontend is built with React and follows a component-based architecture with the following key aspects:

1. **UI Component Library**: Uses a customized version of shadcn/ui components built on top of Radix UI primitives, providing accessible and customizable UI elements.

2. **Routing**: Implements client-side routing using Wouter, a lightweight router for React applications.

3. **State Management**: 
   - Uses React Query for server state management and data fetching
   - Relies on React's built-in hooks for local component state

4. **Internationalization (i18n)**: Implements comprehensive internationalization support with i18next, supporting multiple languages including English, Arabic, Hindi, Urdu, Bengali, Nepali, Tagalog, Malayalam, and Tamil.

5. **Styling**: Uses TailwindCSS for styling with a custom design system defined through theming variables.

### Backend Architecture

The backend follows a RESTful API design using Express.js with TypeScript:

1. **API Endpoints**: Organized around resources like exchange rates, leads, providers, and countries.

2. **Middleware**: Implements logging, error handling, and request processing middleware.

3. **Storage Layer**: Abstracts database operations through a dedicated storage module that handles CRUD operations.

4. **Email Service**: Integrates with nodemailer to send emails for rate alerts and confirmations.

### Database Architecture

The database uses PostgreSQL (via Neon's serverless offering) with Drizzle ORM for data access:

1. **Schema**: Defined in TypeScript with Drizzle ORM's schema builder and Zod for validation.

2. **Tables**:
   - `users`: Authentication information
   - `leads`: User contact information for rate alerts
   - `providers`: Exchange rate providers information
   - `exchangeRates`: Historical and current exchange rates
   - `countries`: Country information for the Gulf region

3. **Migrations**: Managed through Drizzle Kit with a dedicated configuration.

## Data Flow

### Exchange Rate Comparison Flow

1. User selects a country, source currency, and target currency
2. Frontend makes an API request to `/api/exchange-rates/:countryCode/:currency`
3. Server retrieves exchange rates from the database
4. Data is returned to the client and displayed in a comparison table
5. User can sort and filter the results based on rates, fees, or provider ratings

### Rate Alert Flow

1. User submits their contact information and desired exchange rate through the lead capture form
2. Frontend sends a POST request to `/api/leads` with form data
3. Server validates the input data using Zod schemas
4. The lead information is stored in the database
5. A confirmation email is sent to the user
6. The system will monitor exchange rates and notify the user when their target rate is reached

## External Dependencies

### Frontend Dependencies

- **UI Framework**: React with shadcn/ui components
- **Styling**: TailwindCSS
- **State Management**: React Query
- **Routing**: Wouter
- **Form Handling**: React Hook Form with Zod validation
- **Internationalization**: i18next with language detection

### Backend Dependencies

- **Server Framework**: Express.js
- **Database ORM**: Drizzle ORM
- **Database Provider**: Neon (serverless PostgreSQL)
- **Email Service**: Nodemailer
- **Validation**: Zod

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:

1. **Build Process**:
   - Frontend: Vite bundles and optimizes React code
   - Backend: esbuild bundles TypeScript server code

2. **Runtime Environment**:
   - Node.js 20 for both development and production
   - Production mode runs the bundled server code

3. **Database**:
   - Uses Neon's serverless PostgreSQL which scales automatically
   - Database connection is managed through environment variables

4. **Continuous Integration/Deployment**:
   - Configured through Replit's workflow system
   - Includes automated build steps

5. **Environment Configuration**:
   - Uses environment variables for sensitive information and configuration
   - Different settings for development and production environments

## Security Considerations

1. **Data Validation**: All user inputs are validated using Zod schemas before processing.

2. **Environment Variables**: Sensitive information like database credentials are stored in environment variables.

3. **CORS Handling**: API requests are protected with proper CORS configuration.

4. **Error Handling**: Errors are caught and logged without exposing sensitive information to clients.

## Future Extensibility

The architecture is designed to be extensible in the following ways:

1. **New Countries**: The system is prepared to add support for more Gulf countries beyond Saudi Arabia.

2. **Additional Providers**: New exchange rate providers can be easily added to the existing schema.

3. **Enhanced Features**: The foundation is in place to add features like user accounts, favorited providers, and more advanced rate alerts.

4. **Mobile Applications**: The API-first approach means mobile applications could be built to consume the same backend services.