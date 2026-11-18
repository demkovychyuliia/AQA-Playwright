import {
  test,
  expect,
  request as playwrightRequest,
  type APIRequestContext,
} from '@playwright/test';

import { getEnv } from '../utils/env';

// Create an authenticated API context
async function createApiContext(): Promise<APIRequestContext> {
  return playwrightRequest.newContext({
    baseURL: getEnv('BASE_URL'),
    httpCredentials: {
      username: getEnv('BASIC_AUTH_USERNAME'),
      password: getEnv('BASIC_AUTH_PASSWORD'),
    },
    storageState: 'playwright/.auth/user.json',
  });
}

test('should create a new car', async () => {
  const apiContext = await createApiContext();
  let createdCarId: number | undefined;

  try {
    const response = await apiContext.post('/api/cars', {
      data: {
        carBrandId: 1,
        carModelId: 1,
        mileage: 122,
      },
    });

    const responseBody = await response.json();

    // Save the created car ID for cleanup
    createdCarId = responseBody.data?.id;

    expect(response.status()).toBe(201);

    expect(responseBody).toMatchObject({
      status: 'ok',
      data: {
        carBrandId: 1,
        carModelId: 1,
        initialMileage: 122,
        mileage: 122,
        brand: 'Audi',
        model: 'TT',
      },
    });

    expect(typeof createdCarId).toBe('number');
  } finally {
    try {
      // Delete the car created during the test
      if (createdCarId !== undefined) {
        const deleteResponse = await apiContext.delete(
          `/api/cars/${createdCarId}`,
        );

        expect(deleteResponse.status()).toBe(200);
      }
    } finally {
      await apiContext.dispose();
    }
  }
});

test('should reject car creation when carBrandId is missing', async () => {
  const apiContext = await createApiContext();

  try {
    const response = await apiContext.post('/api/cars', {
      data: {
        carModelId: 1,
        mileage: 122,
      },
    });

    expect(response.status()).toBe(400);

    const responseBody = await response.json();

    expect(responseBody).toMatchObject({
      status: 'error',
      message: 'Car brand id is required',
    });
  } finally {
    await apiContext.dispose();
  }
});

test('should reject car creation when mileage has an invalid type', async () => {
  const apiContext = await createApiContext();

  try {
    const response = await apiContext.post('/api/cars', {
      data: {
        carBrandId: 1,
        carModelId: 1,
        mileage: 'not-a-number',
      },
    });

    expect(response.status()).toBe(400);

    const responseBody = await response.json();

    expect(responseBody).toMatchObject({
      status: 'error',
      message: 'Invalid mileage type',
    });
  } finally {
    await apiContext.dispose();
  }
});

