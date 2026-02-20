import { brewClient } from './brews/brewClient';
import { coffeeBagClient } from './coffeeBags/coffeeBagClient';

export const apiClients = {
  brew: brewClient,
  coffeeBag: coffeeBagClient,
} as const;
