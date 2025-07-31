# Gulf Rate App - Exchange Rate Comparison Platform

## Overview
A web-based fintech platform that aggregates and compares real-time foreign exchange rates for expatriates in the Gulf region. The app focuses on empowering users to make smarter remittance decisions by providing transparent rate comparisons from multiple providers.

## Project Architecture
- **Frontend**: React.js with TypeScript, Tailwind CSS for styling, Wouter for routing
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Internationalization**: i18next with support for 9 languages (English, Arabic, Hindi, Urdu, Bengali, Nepali, Tagalog, Malayalam, Tamil)
- **State Management**: TanStack Query for server state, React hooks for local state
- **UI Components**: shadcn/ui with Radix UI primitives
- **Build Tool**: Vite with HMR support
- **Email**: Nodemailer for automated confirmations
- **Analytics**: Google Analytics integration

## Core Features
1. **Multi-language Support**: Full RTL support for Arabic and Urdu with proper font rendering
2. **Exchange Rate Aggregation**: Real-time rates from 10+ providers in Saudi Arabia
3. **Lead Capture System**: GDPR-compliant forms with email automation
4. **Country-Specific Pages**: Dedicated landing pages for Gulf countries (SA, AE, QA, OM, BH, KW)
5. **Responsive Design**: Mobile-first approach with accessibility compliance
6. **SEO Optimization**: Schema.org markup, dynamic sitemaps, AI-optimized content
7. **Admin Dashboard**: Rate management and lead tracking interface

## Database Schema
- **users**: Basic user authentication
- **leads**: Contact information for rate alerts with consent tracking
- **providers**: Exchange service provider information with branding
- **exchangeRates**: Rate data with fees, transfer times, and ratings
- **admins**: Admin user management
- **countries**: Country configuration and availability

## Recent Changes
- **2025-07-31**: Project migrated from Replit Agent to standard Replit environment
- **Architecture**: Maintained client/server separation with proper security practices
- **Dependencies**: All packages properly installed and configured
- **Workflow**: Express server running on port 5000 with Vite integration
- **Database**: PostgreSQL database created and seeded with 100 exchange rates
- **Admin System**: Role-based access control implemented with two user types:
  - Full Admin (username: admin, password: admin123) - Can manage providers and rates
  - Rate Editor (username: rateeditor, password: rates123) - Can only update exchange rates

## User Preferences
- Focus on rapid MVP development with startup mindset
- Prioritize user experience and mobile responsiveness
- Implement robust security practices and GDPR compliance
- Use authentic data sources (no mock/placeholder data)
- Maintain clean, scalable code architecture

## Development Guidelines
- Use TypeScript throughout the project
- Follow shadcn/ui component patterns
- Implement proper error handling and validation
- Use Drizzle ORM for all database operations
- Maintain API route thinness with storage interface abstraction
- Follow mobile-first responsive design principles

## Deployment
- Configured for Replit hosting
- Port 5000 for both frontend and backend
- Environment variables managed through Replit secrets
- Ready for custom domain configuration