import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { 
  PublicOnlyRoute, 
  OnboardingRoute, 
  CompletedOnboardingRoute 
} from "@/components/auth/ProtectedRoute";
import { PublicOrAuthRoute } from "@/components/auth/PublicOrAuthRoute";
import Index from "./pages/Index";
import HowItWorks from "./pages/HowItWorks";
import Mentors from "./pages/Mentors";
import ApplyMentor from "./pages/ApplyMentor";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import MenteeOnboarding from "./pages/MenteeOnboarding";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/about" element={<About />} />
            <Route path="/apply-mentor" element={<ApplyMentor />} />
            
            {/* Mentors page - accessible to both authenticated and unauthenticated users */}
            <Route 
              path="/mentors" 
              element={
                <PublicOrAuthRoute allowedUserTypes={['mentee']}>
                  <Mentors />
                </PublicOrAuthRoute>
              } 
            />
            
            {/* Auth route - only for non-authenticated users */}
            <Route 
              path="/auth" 
              element={
                <PublicOnlyRoute>
                  <Auth />
                </PublicOnlyRoute>
              } 
            />
            
            {/* Onboarding routes - for users with incomplete onboarding */}
            <Route 
              path="/onboarding" 
              element={
                <OnboardingRoute userType="mentor">
                  <Onboarding />
                </OnboardingRoute>
              } 
            />
            <Route 
              path="/mentee-onboarding" 
              element={
                <OnboardingRoute userType="mentee">
                  <MenteeOnboarding />
                </OnboardingRoute>
              } 
            />
            
            {/* Dashboard route - for mentors with completed onboarding */}
            <Route 
              path="/dashboard" 
              element={
                <CompletedOnboardingRoute allowedUserTypes={['mentor']}>
                  <Dashboard />
                </CompletedOnboardingRoute>
              } 
            />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
