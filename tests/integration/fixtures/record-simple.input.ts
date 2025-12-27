import { Record } from 'ts-lombok/markers';

@Record
class User {
  id: number;
  name: string;
}
