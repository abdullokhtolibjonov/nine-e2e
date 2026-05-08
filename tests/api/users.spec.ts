import { test, expect } from '@playwright/test';
import { getConfig } from '../../src/helpers/env.helper';
import { createUser } from '../../src/test-data/userFactory';

test.describe('Users API', () => {
  test('GET /users returns 200', async ({ request }) => {
    const config = getConfig();
    const response = await request.get(`${config.API_URL}/users`, {
      headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.data)).toBeTruthy();
  });

  test('POST /users creates a new user', async ({ request }) => {
    const config = getConfig();
    const payload = createUser();

    const response = await request.post(`${config.API_URL}/users`, {
      data: payload,
      headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.email).toBe(payload.email);
  });
});