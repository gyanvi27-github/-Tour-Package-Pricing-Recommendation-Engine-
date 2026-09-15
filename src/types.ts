export type Category =
  | 'Adventure'
  | 'Beach'
  | 'Cultural'
  | 'Honeymoon'
  | 'Leisure'
  | 'Pilgrimage'
  | 'Wildlife';

export type SeasonTag =
  | 'All-Season'
  | 'Summer'
  | 'Winter'
  | 'Monsoon'
  | 'Peak-Winter'
  | 'Off-Season';

export type BudgetRange = '<10k' | '10k–25k' | '25k–50k' | '50k–100k' | '100k+';

export type GroupSizeRange = '1' | '2' | '2–4' | '4–6' | '6–10' | '10+';

export interface TourPackage {
  package_id: string;
  destination: string;
  title: string;
  duration_days: number;
  base_price: number;
  category: Category;
  season_tag: SeasonTag;
  group_size_range: GroupSizeRange;
  is_international: boolean;
  destination_popularity: number; // 0 - 100 percentage
  imageUrl: string;
  description: string;
  highlights: string[];
}

export interface Booking {
  booking_id: string;
  package_id: string;
  user_id: string;
  booking_date: string;
  travel_date: string;
  lead_time_days: number;
  group_size: number;
  final_price_paid: number;
}

export interface UserProfile {
  user_id: string;
  name: string;
  avatar?: string;
  preferred_categories: Category[];
  budget_range: BudgetRange;
  past_bookings_count: number;
  signup_date: string;
}

export interface Rating {
  user_id: string;
  package_id: string;
  rating: number; // 1 to 5
  rating_date: string;
}

export interface PackageAggregatedStats {
  package_id: string;
  averageRating: number;
  ratingsCount: number;
  ratingDistribution: { [star: number]: number };
  bookingsCount: number;
  averageFinalPrice: number;
  minFinalPrice: number;
  maxFinalPrice: number;
}

export interface RecommendationRequest {
  userId?: string;
  preferredCategories: Category[];
  budgetRange: BudgetRange;
  groupSize: number;
  bookingDate: string;
  travelDate: string;
  leadTimeDays: number;
  season: SeasonTag;
  isInternationalOnly?: boolean;
}

export interface RecommendationBreakdown {
  categoryMatch: number; // 0 - 100%
  budgetFit: number;
  destinationPopularity: number;
  groupFit: number;
  ratingScore: number;
  seasonAlignment: number;
}

export interface RecommendationResultItem {
  package: TourPackage;
  matchScore: number; // 0 - 100%
  rank: number;
  breakdown: RecommendationBreakdown;
  predictedPrice: number;
  demandAdjustment: number;
  demandAdjustmentPct: number;
  whyWeRecommend: string[];
}

export interface PricePredictionInputs {
  package_id: string;
  group_size: number;
  lead_time_days: number;
  travel_season: SeasonTag;
  travel_date?: string;
}

export interface PricePredictionResult {
  package: TourPackage;
  basePrice: number;
  historicalAvgPrice: number;
  demandAdjustedEstimate: number;
  differenceAmount: number;
  differencePct: number;
  influencingFactors: {
    factor: string;
    impact: string;
    description: string;
    weight: number;
  }[];
  confidenceScore: number;
}

export interface ItineraryItem {
  id: string;
  package_id: string;
  package: TourPackage;
  dayStart: number;
  durationDays: number;
  startDate: string;
  notes?: string;
  customActivities?: string[];
  transitInfo?: {
    type: 'Flight' | 'High-Speed Rail' | 'Scenic Coach' | 'Private Transfer';
    duration: string;
    detail: string;
  };
}

export interface TripItinerary {
  id: string;
  userId: string;
  tripTitle: string;
  departureDate: string;
  targetBudget?: number;
  items: ItineraryItem[];
  createdDate: string;
}

export type ActivePage =
  | 'home'
  | 'discover'
  | 'recommendations'
  | 'planner'
  | 'pricing'
  | 'analytics'
  | 'profile'
  | 'model'
  | 'chat'
  | 'voice'
  | 'about';

