import z from 'zod';
import { apiClient } from '../base/apiClient';
import { CoffeeBagWithUsageResponseSchema } from './coffeeRequestSchemas';
import type {
  CoffeeBagCreateRequest,
  CoffeeBagUpdateRequest,
  CoffeeBagWithUsage,
} from './coffeeRequestSchemas';

class CoffeeBagClient {
  getUrl(...args: Array<string>) {
    return apiClient.buildUrl('CoffeeBags', ...args);
  }

  async getCoffeeBags(includeEmpty = false) {
    const params = includeEmpty ? '?includeEmpty=true' : '';
    const res = await apiClient.fetch<Array<CoffeeBagWithUsage>>(
      'GET',
      this.getUrl(params),
      null,
      z.array(CoffeeBagWithUsageResponseSchema),
    );
    return res;
  }

  async getCoffeeBagById(id: number) {
    const res = await apiClient.fetch<CoffeeBagWithUsage>(
      'GET',
      this.getUrl(id.toString()),
      null,
      CoffeeBagWithUsageResponseSchema,
    );

    return res;
  }

  async createCoffeeBag(data: CoffeeBagCreateRequest) {
    const res = await apiClient.fetch<CoffeeBagWithUsage>(
      'POST',
      this.getUrl(),
      data,
      CoffeeBagWithUsageResponseSchema,
    );

    return res;
  }

  async updateCoffeeBag(id: number, data: CoffeeBagUpdateRequest) {
    const res = await apiClient.fetch<CoffeeBagWithUsage>(
      'PUT',
      this.getUrl(id.toString()),
      data,
      CoffeeBagWithUsageResponseSchema,
    );

    return res;
  }

  async deleteCoffeeBag(id: number) {
    await apiClient.fetch<void>(
      'DELETE',
      this.getUrl(id.toString()),
      null,
      null,
    );
  }
}

export const coffeeBagClient = new CoffeeBagClient();
