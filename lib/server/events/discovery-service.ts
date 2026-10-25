import type { EventSearchQuery } from '@/lib/server/events/search-schema';

export interface EventSearchPage<TEvent> {
  events: TEvent[];
  total: number;
}

export interface EventDiscoveryService<TEvent> {
  listPublished(query: EventSearchQuery): Promise<EventSearchPage<TEvent>>;
  findPublishedById(eventId: string): Promise<TEvent | null>;
}
