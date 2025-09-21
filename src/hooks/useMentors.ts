// src/hooks/useMentors.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Mentor {
  id: string;
  name: string;
  specialty: string;
  school: string;
  experience: number;
  rating: number;
  reviews: number;
  location: string;
  avatar: string;
  bio: string;
  price: number;
  languages: string[];
  availability: 'available' | 'busy' | 'offline';
  verified: boolean;
  responseTime: string;
  sessionCount: number;
  tags: string[];
  isProfileComplete?: boolean;
  // Database schema fields
  professionalHeadline?: string;
  professionalBio?: string;
  usDentalSchool?: string | null;
  mdsSpecialization?: string | null;
  mdsUniversity?: string | null;
  bdsUniversity?: string | null;
  areasOfExpertise?: string[];
  speciality?: string;
  // Mentor services from mentor_services table
  mentorServices?: Array<{
    id: string;
    service_title: string;
    service_description?: string;
    price: number;
    duration_minutes: number;
  }>;
  // Legacy fields for backward compatibility
  bachelorUniversity?: string | null;
  dentalSchool?: string | null;
  sessions?: number;
}

export interface MentorFilters {
  specialty: string[];
  location: string[];
  experience: [number, number];
  rating: number;
  priceRange: [number, number];
  availability: string[];
  languages: string[];
  verified: boolean;
}

export function useMentors() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMentors = async () => {
    try {
      setLoading(true);
      setError(null);


      // Step 1: Get all mentor profiles
      const { data: mentorProfiles, error: mentorError } = await supabase
        .from('mentor_profiles')
        .select('*')
        .eq('onboarding_completed', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false });


      if (mentorError) {
        // Silently handle error
      }

      let mentorsWithProfiles = [];
      if (mentorProfiles && mentorProfiles.length > 0) {
        
        // Step 2: Get corresponding profile data and services for each mentor
        mentorsWithProfiles = await Promise.all(
          mentorProfiles.map(async (mentorProfile) => {
            
            // Fetch the corresponding profile data
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('first_name, last_name, avatar_url')
              .eq('user_id', mentorProfile.user_id)
              .eq('user_type', 'mentor')
              .single();

            // Fetch mentor services
            const { data: mentorServices, error: servicesError } = await supabase
              .from('mentor_services')
              .select('id, service_title, service_description, price, duration_minutes')
              .eq('mentor_id', mentorProfile.id)
              .eq('is_active', true);


            let fullName = 'Dr. Anonymous';
            let avatar = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face';
            
            if (profileData && profileData.first_name && profileData.last_name) {
              // Use actual profile names if available
              fullName = `${profileData.first_name} ${profileData.last_name}`.trim();
            } else if (profileData && (profileData.first_name || profileData.last_name)) {
              // Use partial name if available
              fullName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
            } else {
              // Fallback to professional headline or create a generic name
              if (mentorProfile.professional_headline) {
                fullName = mentorProfile.professional_headline;
              } else {
                fullName = 'Dr. Professional';
              }
            }

            // Use profile avatar if available
            if (profileData && profileData.avatar_url) {
              avatar = profileData.avatar_url;
            } else if (mentorProfile.profile_photo_url) {
              avatar = mentorProfile.profile_photo_url;
            }
            
            // Determine specialty from professional data
            let specialty = 'General Dentistry';
            if (mentorProfile.specializations && mentorProfile.specializations.length > 0) {
              specialty = mentorProfile.specializations[0];
            } else if (mentorProfile.professional_headline) {
              // Try to extract specialty from headline
              const headline = mentorProfile.professional_headline;
              if (headline.includes('Orthodontics')) specialty = 'Orthodontics';
              else if (headline.includes('Oral Surgery')) specialty = 'Oral Surgery';
              else if (headline.includes('Periodontics')) specialty = 'Periodontics';
              else if (headline.includes('Endodontics')) specialty = 'Endodontics';
              else if (headline.includes('Pediatric')) specialty = 'Pediatric Dentistry';
              else if (headline.includes('Prosthodontics')) specialty = 'Prosthodontics';
            }

            // Determine school from professional data
            let school = 'Dental School';
            if (mentorProfile.us_dental_school) {
              school = mentorProfile.us_dental_school;
            } else if (mentorProfile.professional_headline) {
              // Extract school from headline like "DDS @ NYU" or "DMD @ BU"
              const headline = mentorProfile.professional_headline;
              if (headline.includes('@')) {
                const schoolPart = headline.split('@')[1]?.trim();
                if (schoolPart) {
                  school = schoolPart;
                }
              }
            }

            // Use professional bio as the main bio
            let bio = 'Experienced dental professional ready to help students.';
            if (mentorProfile.professional_bio) {
              bio = mentorProfile.professional_bio;
            } else if (mentorProfile.professional_headline) {
              bio = `Professional with expertise in ${specialty}. ${mentorProfile.professional_headline}`;
            }
            
            return {
              id: mentorProfile.id,
              name: fullName,
              specialty: specialty,
              school: school,
              experience: mentorProfile.years_experience || 5,
              rating: mentorProfile.average_rating || 4.5,
              reviews: Math.floor((mentorProfile.total_sessions || 0) * 0.3),
              location: mentorProfile.country_of_origin || 'United States',
              avatar: avatar,
              bio: bio,
              price: mentorProfile.hourly_rate || 100,
              languages: mentorProfile.languages_spoken || ['English'],
              availability: 'available' as const,
              verified: mentorProfile.is_verified || false,
              responseTime: '< 2 hours',
              sessionCount: mentorProfile.total_sessions || 0,
              tags: mentorProfile.specializations || [specialty],
              isProfileComplete: true,
              // Database schema fields
              professionalHeadline: mentorProfile.professional_headline || undefined,
              professionalBio: mentorProfile.professional_bio || undefined,
              usDentalSchool: mentorProfile.us_dental_school || null,
              mdsSpecialization: mentorProfile.mds_specialization || null,
              mdsUniversity: mentorProfile.mds_university || null,
              bdsUniversity: mentorProfile.bds_university || null,
              areasOfExpertise: mentorProfile.specializations || undefined,
              speciality: mentorProfile.speciality || null,
              // Mentor services
              mentorServices: mentorServices || undefined,
              // Legacy fields for backward compatibility
              bachelorUniversity: mentorProfile.bds_university || null,
              dentalSchool: mentorProfile.us_dental_school || null,
              sessions: mentorProfile.total_sessions || 0
            };
          })
        );
      }

      // If no completed mentors, try to get basic mentor profiles from profiles table
      if (mentorsWithProfiles.length === 0) {
        
        const { data: basicProfiles, error: basicError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_type', 'mentor')
          .order('created_at', { ascending: false });


        if (basicError) {
          // Silently handle error
        } else if (basicProfiles && basicProfiles.length > 0) {
          
          // Transform basic profiles to mentor format
          mentorsWithProfiles = basicProfiles.map((profile, index) => ({
            id: profile.user_id, // Use user_id as id since no mentor_profiles exist
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Dr. Anonymous',
            specialty: 'General Dentistry', // Default since no specializations available
            school: 'Dental School', // Default since no dental school info available
            experience: 5, // Default experience
            rating: 4.5, // Default rating
            reviews: 0, // No reviews yet
            location: 'United States', // Default location
            avatar: profile.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
            bio: 'Dental professional ready to help students. Complete your profile to provide more details.',
            price: 100, // Default price
            languages: ['English'], // Default language
            availability: 'available' as const,
            verified: false, // Not verified until profile is complete
            responseTime: '< 4 hours',
            sessionCount: 0,
            tags: ['General Dentistry'],
            isProfileComplete: false,
            // Database schema fields - all null for incomplete profiles
            professionalHeadline: undefined,
            professionalBio: undefined,
            usDentalSchool: null,
            mdsSpecialization: null,
            mdsUniversity: null,
            bdsUniversity: null,
            areasOfExpertise: undefined,
            speciality: null,
            // Mentor services - empty for incomplete profiles
            mentorServices: undefined,
            // Legacy fields for backward compatibility
            bachelorUniversity: null,
            dentalSchool: null,
            sessions: 0
          }));
        }
      }

      setMentors(mentorsWithProfiles);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch mentors');
      toast({
        title: "Error loading mentors",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  return {
    mentors,
    loading,
    error,
    refetch: fetchMentors
  };
}