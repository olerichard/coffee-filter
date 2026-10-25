import { authClient } from './auth/authClient';
import { brewClient } from './brews/brewClient';
import { coffeeBagClient } from './coffeeBags/coffeeBagClient';
import { brewMethodClient } from './brewMethods/brewMethodClient';

export const apiClients = {
  auth: authClient,
  brew: brewClient,
  coffeeBag: coffeeBagClient,
  brewMethod: brewMethodClient,
} as const;
