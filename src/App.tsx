import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import {
  PublicOnlyRoute,
  OnboardingRoute,
  CompletedOnboardingRoute,
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
import MenteeDashboard from "./pages/MenteeDashboard";
import BookingSuccess from "./pages/booking/Success";
import BookingCancel from "./pages/booking/Cancel";
import Messages from "./pages/Messages";
import ChatSession from "./pages/ChatSession";
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
                <PublicOrAuthRoute allowedUserTypes={["mentor", "mentee"]}>
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

            {/* Dashboard routes - for users with completed onboarding */}
            <Route
              path="/dashboard"
              element={
                <CompletedOnboardingRoute allowedUserTypes={["mentor"]}>
                  <Dashboard />
                </CompletedOnboardingRoute>
              }
            />
            <Route
              path="/mentee-dashboard"
              element={
                <CompletedOnboardingRoute allowedUserTypes={["mentee"]}>
                  <MenteeDashboard />
                </CompletedOnboardingRoute>
              }
            />

            {/* Messages Route */}
            <Route
              path="/messages"
              element={
                <CompletedOnboardingRoute allowedUserTypes={["mentor", "mentee"]}>
                  <Messages />
                </CompletedOnboardingRoute>
              }
            />
            <Route
              path="/messages/session/:sessionId"
              element={
                <CompletedOnboardingRoute allowedUserTypes={["mentor", "mentee"]}>
                  <ChatSession />
                </CompletedOnboardingRoute>
              }
            />

            {/* Booking Payment Routes */}


            <Route
              path="/booking/success"
              element={
                <CompletedOnboardingRoute allowedUserTypes={["mentee"]}>
                  <BookingSuccess />
                </CompletedOnboardingRoute>
              }
            />
            <Route
              path="/booking/cancel"
              element={
                <CompletedOnboardingRoute allowedUserTypes={["mentee"]}>
                  <BookingCancel />
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
