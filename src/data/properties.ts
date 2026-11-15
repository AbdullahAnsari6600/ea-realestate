import penthouse from "@/assets/prop-penthouse.jpg";
import villa from "@/assets/prop-villa.jpg";
import tower from "@/assets/prop-tower.jpg";
import townhouse from "@/assets/prop-townhouse.jpg";
import bedroom from "@/assets/prop-bedroom.jpg";
import office from "@/assets/office.jpg";
import heroVideo from "@/assets/hero-dubai.mp4.asset.json";

export type PropertyType =
  | "apartment"
  | "villa"
  | "penthouse"
  | "townhouse"
  | "duplex"
  | "commercial"
  | "land"
  | "other";
export type Listing = "buy" | "rent";


export interface Property {
  id: string;
  slug: string;
  name: string;
  type: PropertyType;
  listing: Listing;
  location: string;
  developer: string;
  description: string;

  // Pricing
  priceMin: number;
  priceMax: number;
  currency?: string;

  // Specifications
  beds: string;
  baths: number;
  area: number;
  areaUnit?: string;

  // Project information
  projectName?: string;
  handoverDate?: string;
  paymentPlan?: string;

  // Media
  images: string[];
  videoUrl?: string;
  amenities: string[];

  // Property highlights
  featured?: boolean;
  trending?: boolean;
  bestDeal?: boolean;
  newListing?: boolean;
}

export const LOCATIONS = ["Downtown Dubai", "Dubai Marina", "Palm Jumeirah", "Dubai Hills Estate", "Business Bay", "Jumeirah Bay"];

export const properties: Property[] = [
  { id: "p1", slug: "marina-horizon-penthouse", name: "Marina Horizon Penthouse", type: "penthouse", listing: "buy", location: "Dubai Marina", developer: "Emaar", description: "A double-height sky residence with panoramic marina and sea views, private plunge pool and bespoke Italian finishes throughout. Direct lift access and dedicated concierge complete an exceptional address.", priceMin: 12500000, priceMax: 14800000, beds: "4", baths: 5, area: 6200, images: [penthouse, bedroom, tower], videoUrl: heroVideo.url, amenities: ["Private pool", "Concierge", "Marina view", "Smart home", "Gym & spa"], featured: true },
  { id: "p2", slug: "palm-signature-villa", name: "Palm Signature Villa", type: "villa", listing: "buy", location: "Palm Jumeirah", developer: "Nakheel", description: "Beachfront frond villa with an infinity pool facing the Arabian Gulf, landscaped gardens and seamless indoor-outdoor living spaces designed for entertaining.", priceMin: 38000000, priceMax: 45000000, beds: "6", baths: 7, area: 11500, images: [villa, bedroom, penthouse], videoUrl: heroVideo.url, amenities: ["Private beach", "Infinity pool", "Staff quarters", "Cinema", "Garden"], featured: true },
  { id: "p3", slug: "boulevard-crest-residences", name: "Boulevard Crest Residences", type: "apartment", listing: "buy", location: "Downtown Dubai", developer: "Emaar", description: "Elegant one to three-bedroom residences steps from Burj Khalifa and The Dubai Mall, with fountain views and resort-style amenities.", priceMin: 2100000, priceMax: 6400000, beds: "1–3", baths: 3, area: 1650, images: [tower, penthouse, bedroom], videoUrl: heroVideo.url, amenities: ["Burj view", "Infinity pool", "Kids' club", "Gym", "Valet"], featured: true },
  { id: "p4", slug: "hills-grove-townhouses", name: "Hills Grove Townhouses", type: "townhouse", listing: "buy", location: "Dubai Hills Estate", developer: "Meraas", description: "Contemporary family townhouses overlooking the championship golf course, with private gardens, community parks and top-rated schools nearby.", priceMin: 4300000, priceMax: 5900000, beds: "3–4", baths: 4, area: 2900, images: [townhouse, bedroom, villa], videoUrl: heroVideo.url, amenities: ["Golf view", "Private garden", "Community pool", "Parks", "Schools nearby"] },
  { id: "p5", slug: "bay-avenue-suites", name: "Bay Avenue Suites", type: "apartment", listing: "rent", location: "Business Bay", developer: "DAMAC", description: "Fully furnished canal-view apartments with hotel services, ideal for executives and short-term investors seeking flexibility.", priceMin: 140000, priceMax: 260000, beds: "1–2", baths: 2, area: 1100, images: [bedroom, office, tower], videoUrl: heroVideo.url, amenities: ["Furnished", "Canal view", "Housekeeping", "Gym", "Pool"], featured: true },
  { id: "p6", slug: "jumeirah-bay-mansion", name: "Jumeirah Bay Island Mansion", type: "villa", listing: "rent", location: "Jumeirah Bay", developer: "Meraas", description: "An ultra-private island mansion with skyline vistas, marina berth access and world-class hospitality on your doorstep.", priceMin: 2400000, priceMax: 2900000, beds: "7", baths: 8, area: 14800, images: [villa, penthouse, bedroom], videoUrl: heroVideo.url, amenities: ["Island living", "Yacht berth", "Spa", "Staff quarters", "Security"], featured: true },
];
