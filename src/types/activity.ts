export interface Venue {
  id: string;
  name: string;
  suburb: string | null;
  council_area: "inner_west" | "city_of_sydney" | "other" | null;
  google_maps_url: string | null;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
}

export interface Occurrence {
  id: string;
  activity_id: string;
  date: string;       // "2026-06-12"
  start_time: string; // "10:30:00"
  end_time: string | null;
}

export interface Activity {
  id: string;
  name: string;
  description: string | null;
  is_free: boolean;
  price_amount: number | null;
  price_notes: string | null;
  min_age_months: number | null;
  max_age_months: number | null;
  website_url: string | null;
  booking_url: string | null;
  booking_required: boolean | null;
  venues: Venue;
  activity_categories: Array<{ categories: Category | null }>;
  upcomingOccurrences: Occurrence[];
}
