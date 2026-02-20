import { apiClient } from '../base/apiClient';
import { CoffeeBag } from './coffeeRequestSchemas';

class CoffeeBagClient {
  getUrl(...args: string[]) {
    return apiClient.buildUrl('CoffeeBags', ...args);
  }

  async getCoffeeBags() {
    const res = await apiClient.fetch<Array<CoffeeBag>>(
      'GET',
      this.getUrl(),
      null,
      null,
    );
    return res;
  }
}

export const coffeeBagClient = new CoffeeBagClient();
