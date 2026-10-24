import { haversineDistanceKm } from '@/lib/geo/haversine';

export interface ScorableEvent {
  id: string;
  title: string;
  category: string;
  status: string;
  start_at: string;
  end_at: string;
  registration_deadline: string | null;
  price: number;
  capacity: number;
  registered_count: number;
  latitude: number | null;
  longitude: number | null;
}

export interface SmartMatchPreferences {
  interests: string[];
  preferred_categories: string[];
  preferred_budget: number | null;
  preferred_latitude: number | null;
  preferred_longitude: number | null;
  preferred_radius_km: number;
}

export interface SmartMatchResult {
  score: number;
  reasons: string[];
  distanceKm: number | null;
}

export function scoreEvent(
  event: ScorableEvent,
  preferences: SmartMatchPreferences,
  now: Date,
): SmartMatchResult | null {
  const nowMs = now.getTime();
  const startMs = Date.parse(event.start_at);
  const endMs = Date.parse(event.end_at);
  const deadlineMs = event.registration_deadline
    ? Date.parse(event.registration_deadline)
    : null;

  if (
    event.status !== 'published' ||
    endMs < nowMs ||
    event.registered_count >= event.capacity ||
    (deadlineMs !== null && deadlineMs < nowMs)
  ) {
    return null;
  }

  let distanceKm: number | null = null;
  if (
    preferences.preferred_latitude !== null &&
    preferences.preferred_longitude !== null &&
    event.latitude !== null &&
    event.longitude !== null
  ) {
    distanceKm = haversineDistanceKm(
      {
        latitude: preferences.preferred_latitude,
        longitude: preferences.preferred_longitude,
      },
      { latitude: event.latitude, longitude: event.longitude },
    );
  }

  if (distanceKm !== null && distanceKm > preferences.preferred_radius_km) {
    return null;
  }

  const interestScore = preferences.interests.some(
    (interest) => interest.toLowerCase() === event.category.toLowerCase(),
  )
    ? 1
    : 0;
  const proximityScore =
    distanceKm === null
      ? 0.5
      : Math.max(
          0,
          Math.min(1, 1 - distanceKm / preferences.preferred_radius_km),
        );
  const daysUntilStart = Math.max(0, (startMs - nowMs) / 86_400_000);
  const availabilityScore = Math.max(0, 1 - daysUntilStart / 30);
  const budgetScore =
    preferences.preferred_budget === null
      ? 0.5
      : event.price <= preferences.preferred_budget || event.price === 0
        ? 1
        : preferences.preferred_budget === 0
          ? 0
          : Math.max(0, preferences.preferred_budget / event.price);
  const categoryScore = preferences.preferred_categories.some(
    (category) => category.toLowerCase() === event.category.toLowerCase(),
  )
    ? 1
    : 0;
  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        100 *
          (0.35 * interestScore +
            0.25 * proximityScore +
            0.2 * availabilityScore +
            0.1 * budgetScore +
            0.1 * categoryScore),
      ),
    ),
  );
  const reasons: string[] = [];

  if (interestScore >= 0.6) {
    reasons.push(`Matches your interest in ${event.category}.`);
  }
  if (distanceKm !== null && proximityScore >= 0.6) {
    reasons.push(`${distanceKm.toFixed(1)} km from your preferred location.`);
  }
  if (availabilityScore >= 0.6) {
    reasons.push('Takes place soon.');
  }
  if (budgetScore >= 0.6 && preferences.preferred_budget !== null) {
    if (event.price === 0) {
      reasons.push('Free to attend.');
    } else if (event.price <= preferences.preferred_budget) {
      reasons.push('Fits your preferred budget.');
    } else {
      reasons.push(
        `Costs ${event.price}, above your preferred budget of ${preferences.preferred_budget}.`,
      );
    }
  }
  if (categoryScore >= 0.6 && !interestScore) {
    reasons.push(`In your preferred category: ${event.category}.`);
  }

  return { score, reasons, distanceKm };
}
