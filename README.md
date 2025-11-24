# DentMentor - Mentorship Platform for International Dental Students

A mentorship platform connecting dental students with verified U.S. dental professionals to accelerate their careers and successfully navigate the dental licensing process.

## About DentMentor

DentMentor is a comprehensive mentorship platform designed to bridge the gap between international dental graduates and successful U.S. dental professionals. Our platform facilitates meaningful connections that help dental students navigate the complex U.S. dental licensing process with personalized guidance from verified experts.

## Features

- **Mentor Discovery**: Browse and connect with verified dental professionals
- **Personalized Matching**: Find mentors based on specialty, location, and experience
- **Secure Communication**: Built-in messaging and session scheduling
- **Profile Management**: Comprehensive profiles for both mentors and mentees
- **Progress Tracking**: Monitor your journey and milestones
- **Mobile Responsive**: Access the platform from any device

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: Radix UI, Tailwind CSS, Shadcn/ui
- **Backend**: Supabase (Database, Authentication, Storage)
- **State Management**: React Query, React Context
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

## Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository

```bash
git clone https://github.com/nirajmehta960/dentmentor.git
cd dentmentor
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key

# Application URL
VITE_APP_URL=https://www.dent-mentor.com

# For local development with Vercel dev server
# Only needed if running email service locally
VITE_DEV_API_URL=http://localhost:3000
```

**Important**: For the email service to work, you need to set environment variables in your Vercel Dashboard:

- `RESEND_API_KEY` - Your Resend API key from resend.com
- `EMAIL_FROM` - Your sender email (e.g., `noreply@dent-mentor.com`)
- `APP_NAME` - Optional (defaults to "DentMentor")

**Note**: The application uses Google OAuth only for authentication. Email/password authentication has been removed to simplify the codebase.

**For local development**:

You have two options:

**Option 1: Run Vercel Dev (Recommended)**

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Run Vercel dev server (this enables serverless functions)
vercel dev
```

This will start both the app and serverless functions. The email API will be available at `http://localhost:3000/api/send-welcome-email`.

**Option 2: Run Vite + Vercel Dev separately**

```bash
# Terminal 1: Start Vercel dev server (for API)
vercel dev

# Terminal 2: Start Vite dev server (for frontend)
npm run dev
```

Then add `VITE_DEV_API_URL=http://localhost:3000` to your `.env.local` file.

4. Start the development server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

## Usage

### For Dental Students (Mentees)

1. Sign up and complete your profile
2. Browse available mentors by specialty and location
3. Connect with mentors who match your goals
4. Schedule sessions and track your progress

### For Dental Professionals (Mentors)

1. Apply to become a mentor
2. Complete your professional profile
3. Set your availability and specialties
4. Connect with students seeking guidance

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Niraj Mehta**

- GitHub: [@nirajmehta960](https://github.com/nirajmehta960)
- LinkedIn: [Niraj Mehta](https://linkedin.com/in/niraj-mehta)

## Acknowledgments

- Thanks to all the dental professionals who contribute as mentors
- Special thanks to the dental community for their support and feedback

---

Built with passion for the dental community
