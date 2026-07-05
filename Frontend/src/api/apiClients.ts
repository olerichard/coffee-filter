import { brewClient } from './brews/brewClient';
import { coffeeBagClient } from './coffeeBags/coffeeBagClient';
import { brewMethodClient } from './brewMethods/brewMethodClient';

export const apiClients = {
  brew: brewClient,
  coffeeBag: coffeeBagClient,
  brewMethod: brewMethodClient,
} as const;
