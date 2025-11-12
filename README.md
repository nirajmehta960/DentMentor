# DentMentor - Mentorship Platform for International Dental Students

![DentMentor](https://img.shields.io/badge/DentMentor-Mentorship%20Platform-blue)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-Latest-3ECF8E?logo=supabase)
![Stripe](https://img.shields.io/badge/Stripe-Payment-635BFF?logo=stripe)

**Mentorship Platform for International Dental Students - Connect with verified U.S. dental professionals to accelerate your career and successfully navigate the dental licensing process.**

DentMentor is a comprehensive mentorship platform designed to bridge the gap between international dental graduates and successful U.S. dental professionals. Our platform facilitates meaningful connections that help dental students navigate the complex U.S. dental licensing process with personalized guidance from verified experts.

---

## Features

### Core Functionality

- **Mentor Discovery** - Browse and connect with verified dental professionals by specialty, location, and experience
- **Personalized Matching** - Find mentors based on your goals, specialty interests, and location preferences
- **Session Booking** - Schedule mentorship sessions with integrated calendar and timezone support
- **Secure Payment Processing** - Stripe integration for seamless payment handling
- **Real-time Messaging** - Built-in messaging system for direct communication between mentors and mentees
- **Profile Management** - Comprehensive profiles for both mentors and mentees with verification system
- **Progress Tracking** - Monitor your mentorship journey and milestones
- **Email Notifications** - Automated email system for booking confirmations and updates

### Mentor Services

- **Personal Statement Review** - Professional feedback on application essays and personal statements
- **Interview Preparation** - Mock interviews and confidence building for dental school interviews
- **Application Strategy** - Strategic guidance for school selection and application planning
- **CV/Resume Enhancement** - Professional review and optimization of application materials

### User Experience

- **Role-based Dashboards** - Separate dashboards for mentors and mentees with tailored features
- **Onboarding Flows** - Guided onboarding process for both user types
- **Mobile Responsive** - Fully responsive design accessible from any device
- **Google OAuth** - Secure authentication with Google sign-in

---

## Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for styling
- **shadcn/ui** component library built on Radix UI
- **React Router** for navigation
- **TanStack Query** for data fetching and state management
- **React Hook Form** with Zod validation
- **Recharts** for data visualization

### Backend & Database

- **Supabase** for authentication, database, and real-time features
- **PostgreSQL** for robust data storage and relationships
- **Row Level Security (RLS)** for data protection and user isolation
- **Supabase Auth** for secure user authentication
- **Supabase Edge Functions** for serverless backend logic

### Payment & Services

- **Stripe** for payment processing and checkout sessions
- **Resend** for transactional email delivery
- **Vercel Serverless Functions** for API endpoints

---

## Quick Start

### Prerequisites

- **Node.js** 18+ (for frontend)
- **npm** or **yarn** package manager
- **Supabase Account** for backend services
- **Stripe Account** for payment processing
- **Resend Account** for email services (optional)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/nirajmehta960/dentmentor.git
cd dentmentor
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment Configuration**

Create a `.env` file in the root directory:

**Required Variables:**

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Your Supabase anonymous key
- `VITE_APP_URL` - Your application URL

**For Vercel Deployment (Serverless Functions):**

- `RESEND_API_KEY` - Your Resend API key (for welcome emails)
- `EMAIL_FROM` - Your sender email (e.g., `noreply@dent-mentor.com`)
- `APP_NAME` - Your application name
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

4. **Database Setup**
   1. Create a new Supabase project at supabase.com
   2. Run the database migrations (if available in `supabase/migrations/`)
   3. Set up Row Level Security policies for data protection
   4. Configure authentication settings in your Supabase dashboard

5. **Google OAuth Setup**
   1. Create Google OAuth credentials in Google Cloud Console
   2. Add authorized redirect URI: `https://<your-supabase-project-id>.supabase.co/auth/v1/callback`
   3. Enable Google provider in Supabase Dashboard → Authentication → Providers
   4. Enter your Client ID and Client Secret

6. **Stripe Setup**
   1. Create a Stripe account and get your API keys
   2. Set up webhook endpoint: `https://your-domain.com/api/stripe/webhook`
   3. Configure webhook events: `checkout.session.completed`

7. **Start Development Server**

**Option 1: Run Vercel Dev (Recommended)**

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Run Vercel dev server (enables serverless functions)
vercel dev
```

**Option 2: Run Vite only**

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

---

## Project Structure

```
dentmentor/
├── api/                      # API routes (Vercel serverless functions)
│   ├── _utils/              # Utility functions for API routes
│   ├── admin/               # Admin endpoints
│   ├── messages/            # Messaging API endpoints
│   ├── stripe/              # Stripe payment endpoints
│   └── send-welcome-email.ts
├── public/                   # Static assets
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── booking/        # Booking-related components
│   │   ├── mentors/        # Mentor display components
│   │   └── layout/         # Layout components
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx
│   ├── hooks/              # Custom React hooks
│   ├── integrations/       # External service integrations
│   │   └── supabase/       # Supabase client and types
│   ├── lib/                # Utility functions and API clients
│   ├── pages/              # Application pages
│   │   ├── Dashboard.tsx
│   │   ├── MenteeDashboard.tsx
│   │   ├── Mentors.tsx
│   │   ├── Messages.tsx
│   │   └── booking/        # Booking success/cancel pages
│   ├── services/           # Business logic and API services
│   └── types/              # TypeScript type definitions
├── supabase/               # Database configuration
│   ├── functions/          # Supabase Edge Functions
│   └── config.toml
├── .env                    # Environment variables (not committed)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### API Documentation

Once the backend is running, access your Supabase project:

- **Supabase Dashboard**: `https://app.supabase.com/project/<your-project-id>`
- **API Documentation**: Available in Supabase Dashboard → API

---

## Deployment

### Vercel (Recommended)

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Environment Variables**: Add all required environment variables in Vercel dashboard
3. **Deploy**: Automatic deployment on every push to main branch

### Other Platforms

The application can be deployed to any platform that supports Node.js applications:

- **Netlify**
- **Railway**
- **AWS Amplify**

---

## Usage

### For Dental Students (Mentees)

1. Sign up with Google OAuth
2. Complete your mentee profile during onboarding
3. Browse available mentors by specialty and location
4. Book mentorship sessions with your preferred mentors
5. Communicate through the built-in messaging system
6. Track your progress and milestones in your dashboard

### For Dental Professionals (Mentors)

1. Apply to become a mentor through the application form
2. Complete your professional profile during onboarding
3. Set up your services, pricing, and availability
4. Accept booking requests from mentees
5. Conduct mentorship sessions and provide guidance
6. Manage your bookings and communications in your dashboard

---

## Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow existing code patterns
- Use meaningful variable names
- Add comments for complex logic
- Keep components and functions focused
- Use TypeScript strict mode
- Follow ESLint rules

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Author

**Niraj Mehta**

- GitHub: [@nirajmehta960](https://github.com/nirajmehta960)
- LinkedIn: [Niraj Mehta](https://linkedin.com/in/niraj-mehta)

---

## Acknowledgments

- Built with React and Supabase
- UI components from shadcn/ui
- Payment processing by Stripe
- Email services by Resend
- Icons from Lucide

---

**Made with passion for the dental community**

Star this repo if you find it helpful!
