import z from 'zod';
import { apiClient } from '../base/apiClient';
import { BrewResponseSchema, type Brew } from './brewRequestSchemas';
import type {
  BrewCreateRequest,
  BrewUpdateRequest,
} from './brewRequestSchemas';

class BrewClient {
  getUrl(...args: string[]) {
    return apiClient.buildUrl('Brews', ...args);
  }

  async getBrews() {
    const res = await apiClient.fetch<Brew[]>(
      'GET',
      this.getUrl(),
      null,
      z.array(BrewResponseSchema),
    );
    return res;
  }

  async getBrewById(brewId: string) {
    const res = await apiClient.fetch<Brew>(
      'GET',
      this.getUrl(brewId),
      null,
      BrewResponseSchema,
    );

    return res;
  }

  async createBrew(data: BrewCreateRequest) {
    const res = await apiClient.fetch<Brew>(
      'POST',
      this.getUrl(),
      data,
      BrewResponseSchema,
    );

    return res;
  }

  async updateBrew(id: number, data: BrewUpdateRequest) {
    const res = await apiClient.fetch<Brew>(
      'PUT',
      this.getUrl(id.toString()),
      data,
      BrewResponseSchema,
    );

    return res;
  }

  async deleteBrew(id: number) {
    await apiClient.fetch<void>(
      'DELETE',
      this.getUrl(id.toString()),
      null,
      null,
    );
  }
}

export const brewClient = new BrewClient();
