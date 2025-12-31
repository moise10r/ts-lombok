import { With, Record } from 'ts-lombok/markers';

@Record
@With
class User {
  id: number;
  name: string;
}
