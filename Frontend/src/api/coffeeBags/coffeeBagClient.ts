import z from 'zod';
import { apiClient } from '../base/apiClient';
import {
  type CoffeeBagUpdateRequest,
  type CoffeeBagCreateRequest,
  type CoffeeBag,
  CoffeeBagResponseSchema,
} from './coffeeRequestSchemas';

class CoffeeBagClient {
  getUrl(...args: string[]) {
    return apiClient.buildUrl('CoffeeBags', ...args);
  }

  async getCoffeeBags() {
    const res = await apiClient.fetch<CoffeeBag[]>(
      'GET',
      this.getUrl(),
      null,
      z.array(CoffeeBagResponseSchema),
    );
    return res;
  }

  async createCoffeeBag(data: CoffeeBagCreateRequest) {
    const res = await apiClient.fetch<CoffeeBag>(
      'POST',
      this.getUrl(),
      data,
      CoffeeBagResponseSchema,
    );

    return res;
  }

  async updateCoffeeBag(id: number, data: CoffeeBagUpdateRequest) {
    const res = await apiClient.fetch<CoffeeBag>(
      'PUT',
      this.getUrl(id.toString()),
      data,
      CoffeeBagResponseSchema,
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
