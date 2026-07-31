import { beforeEach, describe, expect, it } from 'vitest';
import { AxiosHeaderValue } from 'axios';
import { apiClient } from '../api/client';

beforeEach(() => {
  localStorage.clear();
});

describe('apiClient auth interceptor', () => {
  it('attaches the JWT from localStorage as a Bearer header', async () => {
    localStorage.setItem('token', 'test-jwt-123');
    let seenHeader: AxiosHeaderValue | undefined;
    apiClient.defaults.adapter = async (config) => {
      seenHeader = config.headers.Authorization;
      return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
    };
    await apiClient.get('/auth/me');
    expect(seenHeader).toBe('Bearer test-jwt-123');
  });

  it('sends no Authorization header when no token is stored', async () => {
    let seenHeader: AxiosHeaderValue | undefined = 'unset';
    apiClient.defaults.adapter = async (config) => {
      seenHeader = config.headers.Authorization;
      return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
    };
    await apiClient.get('/properties');
    expect(seenHeader).toBeUndefined();
  });
});
