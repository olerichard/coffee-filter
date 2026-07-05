import z from 'zod';
import { apiClient } from '../base/apiClient';
import {
  BrewMethodResponseSchema,
  type BrewMethod,
} from './brewMethodRequestSchemas';

class BrewMethodClient {
  getUrl(...args: string[]) {
    return apiClient.buildUrl('BrewMethods', ...args);
  }

  async getBrewMethods() {
    const res = await apiClient.fetch<BrewMethod[]>(
      'GET',
      this.getUrl(),
      null,
      z.array(BrewMethodResponseSchema),
    );
    return res;
  }
}

export const brewMethodClient = new BrewMethodClient();
