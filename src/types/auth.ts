import { User, Session } from '@supabase/supabase-js';

export type UserType = 'mentor' | 'mentee' | null;

export interface AuthProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  user_type: UserType;
  onboarding_step: number;
  onboarding_completed: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface MentorProfile {
  id: string;
  user_id: string;
  professional_headline: string | null;
  professional_bio: string | null;
  years_experience: number | null;
  bachelor_university: string | null;
  bachelor_graduation_year: number | null;
  dental_school: string | null;
  dental_school_graduation_year: number | null;
  current_status: string | null;
  country_of_origin: string | null;
  specializations: string[] | null;
  languages_spoken: string[] | null;
  availability_preference: string | null;
  hourly_rate: number | null;
  services: any | null;
  onboarding_step: number;
  onboarding_completed: boolean;
  verification_status: string;
  is_verified: boolean;
  is_active: boolean;
  profile_photo_url: string | null;
  linkedin_url: string | null;
  student_id_url: string | null;
  degree_certificate_url: string | null;
  admission_letter_url: string | null;
  verification_documents: any | null;
  created_at: string;
  updated_at: string;
}

export interface MenteeProfile {
  id: string;
  user_id: string;
  university_name: string | null;
  highest_degree: string | null;
  graduation_year: number | null;
  current_location: string | null;
  citizenship_country: string | null;
  english_exam: string | null;
  english_score: number | null;
  inbde_status: string | null;
  languages_spoken: string[] | null;
  help_needed: string[] | null;
  target_programs: string[] | null;
  target_schools: string[] | null;
  preferred_session_times: string[] | null;
  onboarding_step: number;
  onboarding_completed: boolean;
  profile_photo_url: string | null;
  referral_source: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: AuthProfile | null;
  mentorProfile: MentorProfile | null;
  menteeProfile: MenteeProfile | null;
  userType: UserType;
  onboardingComplete: boolean;
  currentOnboardingStep: number;
  isLoading: boolean;
  isAuthLoading: boolean;
  isProfileLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (data: SignUpData) => Promise<{ error?: string }>;
  signInWithGoogle: (userType: 'mentor' | 'mentee') => Promise<{ error?: string }>;
  signOut: () => Promise<{ error?: string }>;
  updateProfile: (updates: Partial<AuthProfile>) => Promise<boolean>;
  updateMentorProfile: (updates: Partial<MentorProfile>) => Promise<boolean>;
  updateMenteeProfile: (updates: Partial<MenteeProfile>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

export interface SignUpData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  userType: 'mentor' | 'mentee';
  agreedToTerms: boolean;
}

export interface OnboardingStepData {
  [key: string]: any;
}

export interface FormPersistenceOptions {
  key: string;
  excludeFields?: string[];
  autoSave?: boolean;
}