import { DiscogsError, ErrorCode } from '../../src/utils/errors';
import { expect } from 'vitest';
export function createMockResponse<T>(data: T) {
  return {
    ok: true,
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
}

export function createMockErrorResponse(status: number, message: string) {
  return {
    ok: false,
    status,
    statusText: message,
    text: async () => message,
  };
}

export function expectDiscogsError(error: unknown, code: ErrorCode) {
  expect(error).toBeInstanceOf(DiscogsError);
  expect((error as DiscogsError).code).toBe(code);
}
