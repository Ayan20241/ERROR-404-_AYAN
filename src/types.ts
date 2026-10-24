export type AppView = 
  | 'discover' 
  | 'map-explorer' 
  | 'event-detail' 
  | 'attendee' 
  | 'organizer' 
  | 'moderation';

export interface EventItem {
  id: number;
  title: string;
  category: string;
  categoryColor?: string;
  categoryBg?: string;
  venue: string;
  distance: string;
  date: string;
  dayLabel?: string;
  dayNum?: string;
  time: string;
  price: string;
  priceNum: number;
  matchScore: number;
  image: string;
  hostName: string;
  hostImage?: string;
  spotsLeft?: string;
  lat?: number;
  lng?: number;
  featured?: boolean;
  description?: string;
}
