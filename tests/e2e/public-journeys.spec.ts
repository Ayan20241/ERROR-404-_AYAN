import { expect, test } from '@playwright/test';

const eventTitle = 'Community makers gathering';

const event = {
  id: 'c483d270-d9a8-4ae4-a695-c182ec7769ad',
  organizer_id: '6c502297-4053-4714-8c0a-f758e596fd72',
  title: eventTitle,
  description: 'A community evening for local makers.',
  category: 'Community',
  venue_name: 'The Workshop',
  address: 'Central Bengaluru',
  latitude: null,
  longitude: null,
  start_at: '2027-01-10T12:00:00.000Z',
  end_at: '2027-01-10T15:00:00.000Z',
  price: 0,
  currency: 'INR',
  capacity: 20,
  registered_count: 4,
  registration_deadline: null,
  image_url: null,
  status: 'published',
  country_code: 'IN',
  city_id: null,
  locality: null,
  city_name: null,
  state_code: null,
  state_name: null,
};

async function mockPublicApi(page: import('@playwright/test').Page) {
  await page.route('**/api/auth/session', (route) =>
    route.fulfill({ json: { user: null, role: null } }),
  );
  await page.route('**/api/locations**', (route) =>
    route.fulfill({ json: { divisions: [], cities: [], localities: [] } }),
  );
  await page.route('**/api/events?*', (route) =>
    route.fulfill({ json: { events: [event], total: 1 } }),
  );
}

test('shows API-backed event discovery and an honest map fallback', async ({
  page,
}) => {
  await mockPublicApi(page);
  const response = await page.goto('/');

  expect(response?.headers()['x-content-type-options']).toBe('nosniff');
  expect(response?.headers()['x-frame-options']).toBe('DENY');
  expect(response?.headers()['referrer-policy']).toBe(
    'strict-origin-when-cross-origin',
  );
  await expect(
    page.getByRole('heading', { name: eventTitle }),
  ).toBeVisible();
  await expect(page.getByText('1 event found')).toBeVisible();

  await page.getByRole('button', { name: 'Map', exact: true }).click();
  await expect(
    page.getByText(/do not include map coordinates/i),
  ).toBeVisible();

  await page.getByRole('button', { name: 'List', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: eventTitle }),
  ).toBeVisible();
});

test('renders event markers on the configured MapLibre style', async ({
  page,
}) => {
  const mappedEvent = {
    ...event,
    latitude: 12.9716,
    longitude: 77.5946,
  };
  await page.route('**/api/auth/session', (route) =>
    route.fulfill({ json: { user: null, role: null } }),
  );
  await page.route('**/api/locations**', (route) =>
    route.fulfill({ json: { divisions: [], cities: [], localities: [] } }),
  );
  await page.route('**/api/events?*', (route) =>
    route.fulfill({ json: { events: [mappedEvent], total: 1 } }),
  );
  await page.route(
    'https://tiles.openfreemap.org/styles/liberty',
    (route) =>
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          version: 8,
          name: 'Test style',
          sources: {},
          layers: [
            {
              id: 'background',
              type: 'background',
              paint: { 'background-color': '#fbfaf6' },
            },
          ],
        }),
      }),
  );

  await page.goto('/');
  await page.getByRole('button', { name: 'Map', exact: true }).click();
  await expect(
    page.getByRole('button', { name: `View ${eventTitle}` }),
  ).toBeVisible();
});

test('shows an event API failure and recovers after retry', async ({ page }) => {
  let retryEnabled = false;
  let attempts = 0;
  await page.route('**/api/auth/session', (route) =>
    route.fulfill({ json: { user: null, role: null } }),
  );
  await page.route('**/api/locations**', (route) =>
    route.fulfill({ json: { divisions: [], cities: [], localities: [] } }),
  );
  await page.route('**/api/events?*', (route) => {
    attempts += 1;
    return retryEnabled
      ? route.fulfill({ json: { events: [event], total: 1 } })
      : route.fulfill({
          status: 503,
          json: {
            error: {
              code: 'INTERNAL',
              message: 'Events are temporarily unavailable.',
            },
          },
        });
  });

  await page.goto('/');
  await expect(page.locator('.error-panel[role="alert"]')).toContainText(
    'Events are temporarily unavailable.',
  );
  retryEnabled = true;
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(
    page.getByRole('heading', { name: eventTitle }),
  ).toBeVisible();
  expect(attempts).toBeGreaterThan(1);
});

test('displays a safe sign-in error returned by the auth API', async ({
  page,
}) => {
  await page.route('**/api/auth/session', (route) =>
    route.fulfill({ json: { user: null, role: null } }),
  );
  await page.route('**/api/auth/signin', (route) =>
    route.fulfill({
      status: 401,
      json: {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Email or password is incorrect.',
        },
      },
    }),
  );

  await page.goto('/signin');
  await page.getByLabel('Email').fill('attendee@example.test');
  await page.getByLabel('Password').fill('CorrectHorseBatteryStaple-42!');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.locator('.form-error[role="alert"]')).toHaveText(
    'Email or password is incorrect.',
  );
});
