import { useState, useEffect, useMemo } from 'react';
import { useMentors, Mentor } from './useMentors';

export interface Filters {
  specialty: string[];
  location: string[];
  experience: [number, number];
  rating: number;
  priceRange: [number, number];
  availability: string[];
  languages: string[];
  verified: boolean;
}


export const useMentorSearch = () => {
  const [allMentors, setAllMentors] = useState<Mentor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'experience' | 'reviews'>('rating');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const [filters, setFilters] = useState<Filters>({
    specialty: [],
    location: [],
    experience: [0, 20],
    rating: 0,
    priceRange: [0, 300],
    availability: [],
    languages: [],
    verified: false
  });

  // Fetch real mentor data from Supabase
  const { mentors: realMentors, loading: mentorsLoading, error } = useMentors();
  
  // Use real mentor data only
  useEffect(() => {
    setAllMentors(realMentors);
    setHasMore(page * 6 < realMentors.length);
  }, [realMentors, page]);

  const filteredMentors = useMemo(() => {
    let filtered = allMentors.filter(mentor => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          mentor.name.toLowerCase().includes(query) ||
          (mentor.speciality && mentor.speciality.toLowerCase().includes(query)) ||
          (mentor.specialty && mentor.specialty.toLowerCase().includes(query)) ||
          mentor.location.toLowerCase().includes(query) ||
          (mentor.usDentalSchool && mentor.usDentalSchool.toLowerCase().includes(query)) ||
          (mentor.mdsSpecialization && mentor.mdsSpecialization.toLowerCase().includes(query)) ||
          (mentor.mdsUniversity && mentor.mdsUniversity.toLowerCase().includes(query)) ||
          (mentor.bdsUniversity && mentor.bdsUniversity.toLowerCase().includes(query)) ||
          (mentor.professionalBio && mentor.professionalBio.toLowerCase().includes(query)) ||
          (mentor.bio && mentor.bio.toLowerCase().includes(query)) ||
          (mentor.professionalHeadline && mentor.professionalHeadline.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Specialty filter
      if (filters.specialty.length > 0 && !filters.specialty.includes(mentor.speciality || mentor.specialty)) {
        return false;
      }

      // Experience filter
      if (mentor.experience < filters.experience[0] || mentor.experience > filters.experience[1]) {
        return false;
      }

      // Rating filter
      if (mentor.rating < filters.rating) {
        return false;
      }

      // Price range filter
      if (mentor.price < filters.priceRange[0] || mentor.price > filters.priceRange[1]) {
        return false;
      }

      // Availability filter
      if (filters.availability.length > 0 && !filters.availability.includes(mentor.availability)) {
        return false;
      }

      // Languages filter
      if (filters.languages.length > 0) {
        const hasLanguage = filters.languages.some(lang => mentor.languages.includes(lang));
        if (!hasLanguage) return false;
      }

      // Verified filter
      if (filters.verified && !mentor.verified) {
        return false;
      }

      return true;
    });

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          return a.price - b.price;
        case 'experience':
          return b.experience - a.experience;
        case 'reviews':
          return b.reviews - a.reviews;
        default:
          return 0;
      }
    });

    return filtered;
  }, [allMentors, searchQuery, filters, sortBy]);

  const updateFilter = (key: keyof Filters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const loadMoreMentors = () => {
    if (hasMore && !mentorsLoading) {
      setPage(prev => prev + 1);
    }
  };

  // Get paginated mentors
  const paginatedMentors = filteredMentors.slice(0, page * 6);

  return {
    mentors: paginatedMentors,
    loading: mentorsLoading,
    searchQuery,
    setSearchQuery,
    filters,
    updateFilter,
    sortBy,
    setSortBy,
    loadMoreMentors,
    hasMore: paginatedMentors.length < filteredMentors.length,
    error
  };
};