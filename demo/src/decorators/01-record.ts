import { Record } from "ts-lombok-kit/markers";

@Record
class User {
  id: number = 0;
  name: string = '';
  email: string = '';
}

const user = new User(1, "Alice", "alice@example.com");

console.log(user.toString());
// User(id=1, name=Alice, email=alice@example.com)

console.log("frozen:", Object.isFrozen(user));
// frozen: true

const user2 = new User(2, "Bob", "bob@example.com");
console.log(user === user2);
// false
