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

  async createCoffeeBag(data: {
    roaster: string;
    origin: string;
    roastStyle: string;
    flavourNotes?: string;
    opened?: string;
  }) {
    const coffeeBagData = {
      roaster: data.roaster,
      origin: data.origin,
      roastStyle: data.roastStyle,
      flavourNotes: data.flavourNotes || null,
      opened: data.opened || null,
    };

    const res = await apiClient.fetch<CoffeeBag>(
      'POST',
      this.getUrl(),
      coffeeBagData,
      null,
    );

    return res;
  }
}

export const coffeeBagClient = new CoffeeBagClient();
