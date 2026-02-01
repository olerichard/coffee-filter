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
}

export const brewClient = new BrewClient();
