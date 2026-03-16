import { apiClient } from '../base/apiClient';
import { Brew, BrewRequestSchema } from './brewRequestSchemas';

class BrewClient {
  getUrl(...args: string[]) {
    return apiClient.buildUrl('Brews', ...args);
  }

  async getBrews() {
    const res = await apiClient.fetch<Array<Brew>>(
      'GET',
      this.getUrl(),
      null,
      null,
    );
    return res;
  }

  async getBrewById(params: { brewId: string }) {
    const res = await apiClient.fetch<Brew>(
      'GET',
      this.getUrl(params.brewId),
      null,
      BrewRequestSchema,
    );

    return res;
  }

  async createBrew(data: {
    coffeeBagId: number;
    brewType: string;
    brewTasteScore: number;
    coffeeDose: number;
    grindSize: number;
    brewTime: number;
    brewWeight?: number;
    notes?: string;
  }) {
    const brewData = {
      coffeeBagId: data.coffeeBagId,
      brewType: data.brewType,
      brewTasteScore: data.brewTasteScore,
      coffeeDose: data.coffeeDose,
      grindSize: data.grindSize,
      brewTime: data.brewTime,
      brewWeight: data.brewWeight || null,
      notes: data.notes || null,
    };

    const res = await apiClient.fetch<Brew>(
      'POST',
      this.getUrl(),
      brewData,
      null,
    );

    return res;
  }
}

export const brewClient = new BrewClient();
