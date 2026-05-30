import { createMockServer } from './mockServer.js';

export function createApiClient({ mode }) {
  if (mode === 'mock') {
    return createMockServer();
  }

  throw new Error('API client mode not implemented');
}
