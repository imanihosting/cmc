export interface ParentPreferences {
  maxDistance: number;
  schedule: {
    startTime: Date;
    endTime: Date;
    recurring?: boolean;
  };
  personalityTraits: string[];
  weights: {
    proximity: number;
    availability: number;
    personality: number;
  };
}

export interface SearchFilters {
  location: {
    lat: number;
    lng: number;
  };
  maxDistance: number;
  availability?: {
    startTime: Date;
    endTime: Date;
    recurring?: boolean;
  };
  personalityTraits?: string[];
  experience?: number;
  qualifications?: string[];
  languages?: string[];
  specialNeeds?: string[];
}

export interface ChildminderProfile {
  id: string;
  userId: string;
  location: {
    lat: number;
    lng: number;
  };
  personalityTraits: string[];
  yearsOfExperience: number;
  qualifications: string[];
  spokenLanguages: string[];
  specialNeedsSupport: string[];
  availability: AvailabilitySlot[];
}

export interface AvailabilitySlot {
  id: string;
  childminderProfileId: string;
  startTime: Date;
  endTime: Date;
  recurring: boolean;
  recurringDays?: number[];
}

export interface MatchingResult {
  childminder: ChildminderProfile;
  score: number;
  matchFactors: {
    proximityScore: number;
    availabilityScore: number;
    personalityScore: number;
  };
} 