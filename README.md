# Gulf Rate App - Currency Exchange Rate Comparison Platform

A comprehensive fintech platform that aggregates and compares real-time foreign exchange rates for expatriates in Gulf countries. Built with modern web technologies and focused on providing transparent rate comparisons from multiple providers.

![Gulf Rate App](./generated-icon.png)

## 🚀 Features

### Core Functionality
- **Real-time Exchange Rates**: Live rates from 10+ major providers in Saudi Arabia
- **Dynamic Badge System**: Automatically calculates "Best Rate" and "Lowest Fee" providers
- **Multi-Currency Support**: INR, PHP, BDT, NPR, and other expatriate currencies
- **Country-Specific Pages**: Dedicated landing pages for Gulf countries (SA, AE, QA, OM, BH, KW)

### Admin Dashboard
- **Role-Based Access Control**: Full Admin and Rate Editor roles
- **Quick Rate Updates**: Inline editing with real-time validation
- **Provider Management**: Complete CRUD operations for exchange providers
- **Authentication System**: Secure session-based authentication

### User Experience
- **Multi-Language Support**: 9 languages with full RTL support (Arabic, Urdu)
- **Mobile-First Design**: Responsive interface optimized for all devices
- **Advanced Search**: Filter providers by name, rate, or transfer method
- **Lead Capture System**: GDPR-compliant contact forms with email automation

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Wouter** for client-side routing
- **TanStack Query** for server state management
- **i18next** for internationalization

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** database
- **Drizzle ORM** for database operations
- **Session-based authentication** with PostgreSQL store
- **Nodemailer** for email automation

### Development Tools
- **Vite** for build tooling and HMR
- **ESLint** and **Prettier** for code quality
- **Drizzle Kit** for database migrations

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/gulf-rate-app.git
   cd gulf-rate-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file with:
   - `DATABASE_URL`: PostgreSQL connection string
   - `SESSION_SECRET`: Secret key for session management
   - `GA_MEASUREMENT_ID`: Google Analytics ID (optional)

4. **Set up the database**
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## 🎯 Usage

### Admin Access
- **Full Admin**: `admin` / `admin123` (can manage all providers and rates)
- **Rate Editor**: `rateeditor` / `rates123` (can only update exchange rates)

### API Endpoints
- `GET /api/exchange-rates/:country/:currency` - Get rates for country/currency pair
- `GET /api/providers/:country` - Get providers for a country
- `PATCH /api/admin/exchange-rates/:id` - Update exchange rate (admin only)

## 🏗 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── locales/        # i18n translation files
│   │   └── lib/            # Utility functions
│   └── public/             # Static assets
├── server/                 # Express backend
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API route definitions
│   └── storage.ts          # Database operations
├── shared/                 # Shared TypeScript types
│   └── schema.ts           # Database schema and types
└── db/                     # Database utilities
    ├── index.ts            # Database connection
    └── seed.ts             # Database seeding
```

## 🔧 Configuration

### Database Schema
- **countries**: Available Gulf countries
- **providers**: Exchange service providers
- **exchangeRates**: Rate data with fees and transfer times
- **admins**: Admin user management
- **leads**: Contact form submissions

### Dynamic Badge Calculation
The system automatically calculates badges based on real-time comparisons:
- **Best Rate**: Provider with highest exchange rate (best value for customers)
- **Lowest Fee**: Provider with lowest transfer fee
- Priority system ensures each provider gets only one badge

## 🌐 Internationalization

Supported languages:
- English (en)
- Arabic (ar) - RTL support
- Hindi (hi)
- Urdu (ur) - RTL support
- Bengali (bn)
- Nepali (ne)
- Tagalog (tl)
- Malayalam (ml)
- Tamil (ta)

## 🚀 Deployment

### Replit Deployment
This project is optimized for Replit hosting:
1. Fork the repository on Replit
2. Set environment variables in Replit Secrets
3. Run `npm install` and `npm run db:push`
4. Click "Run" to start the application

### Other Platforms
For deployment on Vercel, Heroku, or other platforms:
1. Set up PostgreSQL database
2. Configure environment variables
3. Run build command: `npm run build`
4. Start with: `npm start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📋 Development Guidelines

- Follow TypeScript best practices
- Use shadcn/ui component patterns
- Implement proper error handling
- Write tests for critical functionality
- Follow mobile-first responsive design
- Maintain clean, scalable code architecture

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏷 Tags

`fintech` `exchange-rates` `gulf-countries` `react` `typescript` `nodejs` `postgresql` `replit`

---

**Built with ❤️ for the expatriate community in Gulf countries**