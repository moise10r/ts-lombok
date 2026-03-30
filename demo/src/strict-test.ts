/**
 * Strict TypeScript Test — Factory Function Pattern
 *
 * Demonstrates that ts-lombok-kit decorators can be used WITHOUT relaxing
 * TypeScript config, by calling them as plain functions instead of @-syntax.
 *
 * TypeScript can fully infer the return types of function calls, so it sees
 * all generated constructors and methods without any transformer involvement.
 *
 * Config used here (all strict, no workarounds):
 *   strict: true
 *   strictPropertyInitialization: true  ← no longer disabled
 *   noEmitOnError: true                 ← no longer disabled
 */

import {
  Record,
  Value,
  Equals,
  With,
  Data,
  Builder,
  Getter,
  Setter,
  ToString,
  AllArgsConstructor,
  NoArgsConstructor,
  Log,
  Singleton,
} from 'ts-lombok-kit/markers';

// =============================================================================
// 1. @Record — Immutable Data Carrier
// =============================================================================
console.log('\n=== 1. @Record ===');

const User = Record(class User {
  id: number = 0;
  name: string = '';
  email: string = '';
});
type User = InstanceType<typeof User>;

const user = new User(1, 'Alice', 'alice@example.com');
console.log(user.toString());
console.log('frozen:', Object.isFrozen(user));

// =============================================================================
// 2. @Value — Alias for @Record
// =============================================================================
console.log('\n=== 2. @Value ===');

const Coordinates = Value(class Coordinates {
  latitude: number = 0;
  longitude: number = 0;
});
type Coordinates = InstanceType<typeof Coordinates>;

const coords = new Coordinates(48.8566, 2.3522);
console.log(coords.toString());

// =============================================================================
// 3. @Equals — Value-based equality
// =============================================================================
console.log('\n=== 3. @Equals ===');

const Point = Equals(Record(class Point {
  x: number = 0;
  y: number = 0;
}));
type Point = InstanceType<typeof Point>;

const p1 = new Point(10, 20);
const p2 = new Point(10, 20);
const p3 = new Point(5, 99);
console.log('p1.equals(p2):', p1.equals(p2));   // true
console.log('p1.equals(p3):', p1.equals(p3));   // false
console.log('p1.hashCode():', p1.hashCode());
console.log('same hash:', p1.hashCode() === p2.hashCode()); // true

// =============================================================================
// 4. @With — Immutable update methods
// =============================================================================
console.log('\n=== 4. @With ===');

const Product = With(Record(class Product {
  id: number = 0;
  name: string = '';
  price: number = 0;
}));
type Product = InstanceType<typeof Product>;

const product1 = new Product(1, 'Laptop', 999);
const product2 = product1.withPrice(799);
console.log('original:', product1.toString());
console.log('updated: ', product2.toString());
console.log('different instances:', product1 !== product2);

// =============================================================================
// 5. @Data — Getters + Setters + ToString + Equals + Constructor
// =============================================================================
console.log('\n=== 5. @Data ===');

const Person = Data(class Person {
  id: number = 0;
  firstName: string = '';
  lastName: string = '';
  age: number = 0;
});
type Person = InstanceType<typeof Person>;

const person = new Person(1, 'Jane', 'Smith', 30);
console.log(person.toString());
console.log('firstName:', person.getFirstName());
console.log('age:', person.getAge());
person.setAge(31);
console.log('after birthday:', person.getAge());
const person2 = new Person(1, 'Jane', 'Smith', 31);
console.log('persons equal:', person.equals(person2));

// =============================================================================
// 6. @Builder — Fluent builder pattern
// =============================================================================
console.log('\n=== 6. @Builder ===');

const ServerConfig = Builder(class ServerConfig {
  host: string = '';
  port: number = 0;
  ssl: boolean = false;
  timeout: number = 0;
});
type ServerConfig = InstanceType<typeof ServerConfig>;

const config = ServerConfig.builder()
  .host('localhost')
  .port(8080)
  .ssl(true)
  .timeout(5000)
  .build();

console.log('host:', config.host);
console.log('port:', config.port);
console.log('ssl: ', config.ssl);
console.log('timeout:', config.timeout);

// =============================================================================
// 7. @Getter + @Setter — Accessor methods
// =============================================================================
console.log('\n=== 7. @Getter + @Setter ===');

const Account = Setter(Getter(AllArgsConstructor(class {
  accountNumber: string = '';
  balance: number = 0;
  active: boolean = false;
})));
type Account = InstanceType<typeof Account>;

const account = new Account('ACC-001', 1000, true);
console.log('account:', account.getAccountNumber());
console.log('balance:', account.getBalance());
account.setBalance(1500);
console.log('after deposit:', account.getBalance());

// =============================================================================
// 8. @ToString — String representation
// =============================================================================
console.log('\n=== 8. @ToString ===');

const Book = ToString(AllArgsConstructor(class {
  isbn: string = '';
  title: string = '';
  author: string = '';
}));
type Book = InstanceType<typeof Book>;

const book = new Book('978-0-13-468599-1', 'Clean Code', 'Robert Martin');
console.log(book.toString());

// =============================================================================
// 9. @NoArgsConstructor
// =============================================================================
console.log('\n=== 9. @NoArgsConstructor ===');

const Config = NoArgsConstructor(class {
  host: string = 'localhost';
  port: number = 3000;
});
type Config = InstanceType<typeof Config>;

const defaultConfig = new Config();
console.log('host:', defaultConfig.host, 'port:', defaultConfig.port);

// =============================================================================
// 10. @Log — Logger injection
// =============================================================================
console.log('\n=== 10. @Log ===');

const LogService = Log(NoArgsConstructor(class {
  declare log: Console; // injected by @Log at runtime; declare tells TS it exists
  process(data: string): void {
    this.log.info(`Processing: ${data}`);
  }
  handleError(msg: string): void {
    this.log.error(`Error: ${msg}`);
  }
}));
type LogService = InstanceType<typeof LogService>;

const svc = new LogService();
svc.process('request payload');
svc.handleError('timeout occurred');

// =============================================================================
// 11. @Singleton — Single instance
// =============================================================================
console.log('\n=== 11. @Singleton ===');

const AppConfig = Singleton(NoArgsConstructor(class {
  appName: string = 'StrictApp';
  debug: boolean = false;
}));
type AppConfig = InstanceType<typeof AppConfig>;

const inst1 = AppConfig.getInstance();
const inst2 = AppConfig.getInstance();
console.log('same instance:', inst1 === inst2);
inst1.debug = true;
console.log('debug via inst2:', inst2.debug);

// =============================================================================
// 12. Combined: @Record + @With + @Equals
// =============================================================================
console.log('\n=== 12. Combined @Record + @With + @Equals ===');

const Order = With(Equals(Record(class Order {
  orderId: string = '';
  customerId: number = 0;
  total: number = 0;
  status: string = '';
})));
type Order = InstanceType<typeof Order>;

const order1 = new Order('ORD-001', 42, 150, 'pending');
const order2 = order1.withStatus('shipped').withTotal(140);
console.log('order1:', order1.toString());
console.log('order2:', order2.toString());
console.log('order1 unchanged:', order1.status === 'pending');
const order3 = new Order('ORD-001', 42, 150, 'pending');
console.log('order1 equals order3:', order1.equals(order3));

console.log('\n=== All done — zero tsconfig relaxations needed ===');
