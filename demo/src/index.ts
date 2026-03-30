/**
 * ts-lombok-kit Demo Project
 *
 * Demonstrates all decorators with full TypeScript type safety.
 * Uses definite assignment assertion (!) for properties that will be
 * initialized by the generated constructor.
 */

import {
  Record,
  Value,
  With,
  Getter,
  Setter,
  ToString,
  Equals,
  Data,
  Builder,
  NoArgsConstructor,
  AllArgsConstructor,
  RequiredArgsConstructor,
  NonNull,
  Log,
  Singleton,
} from 'ts-lombok-kit/markers';

// ============================================
// 1. @Record - Immutable Data Carrier
// ============================================
console.log('\n=== 1. @Record Demo ===');

@Record
class User {
  id!: number;
  name!: string;
  email!: string;
}

const user = new User(1, 'John Doe', 'john@example.com');
console.log('User:', user.toString());
console.log('Is frozen:', Object.isFrozen(user));

// ============================================
// 2. @Value - Alias for @Record
// ============================================
console.log('\n=== 2. @Value Demo ===');

@Value
class Coordinates {
  latitude!: number;
  longitude!: number;
}

const coords = new Coordinates(40.7128, -74.0060);
console.log('Coordinates:', coords.toString());

// ============================================
// 3. @Record + @Equals - Value-based Equality
// ============================================
console.log('\n=== 3. @Equals Demo ===');

@Record
@Equals
class Point {
  x!: number;
  y!: number;
}

const p1 = new Point(10, 20);
const p2 = new Point(10, 20);
const p3 = new Point(30, 40);

console.log('p1:', p1.toString());
console.log('p2:', p2.toString());
console.log('p1.equals(p2):', p1.equals(p2));
console.log('p1.equals(p3):', p1.equals(p3));
console.log('p1.hashCode():', p1.hashCode());
console.log('p2.hashCode():', p2.hashCode());
console.log('Same hash:', p1.hashCode() === p2.hashCode());

// ============================================
// 4. @Record + @With - Immutable Updates
// ============================================
console.log('\n=== 4. @With Demo ===');

@Record
@With
class Product {
  id!: number;
  name!: string;
  price!: number;
}

const product1 = new Product(1, 'Laptop', 999);
console.log('Original product:', product1.toString());

const product2 = product1.withPrice(899);
console.log('After price update:', product2.toString());
console.log('Original unchanged:', product1.toString());
console.log('Different instances:', product1 !== product2);

// ============================================
// 5. @Data - Complete Data Class
// ============================================
console.log('\n=== 5. @Data Demo ===');

@Data
class Person {
  id!: number;
  firstName!: string;
  lastName!: string;
  age!: number;
}

const person = new Person(1, 'Jane', 'Smith', 30);
console.log('Person:', person.toString());

// Using typed getters
console.log('First name:', person.getFirstName());
console.log('Age:', person.getAge());

// Using typed setters
person.setAge(31);
console.log('After birthday:', person.toString());

// Equality check
const person2 = new Person(1, 'Jane', 'Smith', 31);
console.log('persons equal:', person.equals(person2));

// ============================================
// 6. @Builder - Builder Pattern
// ============================================
console.log('\n=== 6. @Builder Demo ===');

@Builder
class ServerConfig {
  host!: string;
  port!: number;
  maxConnections!: number;
  timeout!: number;
  ssl!: boolean;
}

const config = ServerConfig.builder()
  .host('localhost')
  .port(8080)
  .maxConnections(100)
  .timeout(5000)
  .ssl(true)
  .build();

console.log('Server config built:');
console.log('  host:', config.host);
console.log('  port:', config.port);
console.log('  maxConnections:', config.maxConnections);
console.log('  timeout:', config.timeout);
console.log('  ssl:', config.ssl);

// ============================================
// 7. @Getter + @Setter - Individual Accessors
// ============================================
console.log('\n=== 7. @Getter + @Setter Demo ===');

@Getter
@Setter
@AllArgsConstructor
class Account {
  accountNumber!: string;
  balance!: number;
  isActive!: boolean;
}

const account = new Account('ACC-001', 1000, true);
console.log('Account number:', account.getAccountNumber());
console.log('Initial balance:', account.getBalance());

account.setBalance(1500);
console.log('After deposit:', account.getBalance());

// ============================================
// 8. @ToString - Custom String Representation
// ============================================
console.log('\n=== 8. @ToString Demo ===');

@ToString
@AllArgsConstructor
class Book {
  isbn!: string;
  title!: string;
  author!: string;
  year!: number;
}

const book = new Book('978-0-13-468599-1', 'The Pragmatic Programmer', 'David Thomas', 2019);
console.log(book.toString());

// ============================================
// 9. Constructor Variants
// ============================================
console.log('\n=== 9. Constructor Variants Demo ===');

// NoArgsConstructor - properties need initializers
@NoArgsConstructor
class EmptyEntity {
  id: number = 0;
  name: string = 'default';
}

const empty = new EmptyEntity();
console.log('NoArgsConstructor - id:', empty.id, 'name:', empty.name);

// AllArgsConstructor
@AllArgsConstructor
class FullEntity {
  id!: number;
  name!: string;
  active!: boolean;
}

const full = new FullEntity(42, 'Complete', true);
console.log('AllArgsConstructor - id:', full.id, 'name:', full.name, 'active:', full.active);

// RequiredArgsConstructor - only non-initialized fields in constructor
@RequiredArgsConstructor
class PartialEntity {
  id!: number;           // required (no initializer)
  name!: string;         // required (no initializer)
  active: boolean = true;  // excluded (has initializer)
  description?: string;    // excluded (optional)
}

const partial = new PartialEntity(1, 'Partial');
console.log('RequiredArgsConstructor - id:', partial.id, 'name:', partial.name, 'active:', partial.active);

// ============================================
// 10. @NonNull - Null Validation
// ============================================
console.log('\n=== 10. @NonNull Demo ===');

@AllArgsConstructor
class SafeUser {
  @NonNull
  id!: number;

  @NonNull
  username!: string;

  bio?: string;  // This can be null
}

const safeUser = new SafeUser(1, 'john_doe', 'Software developer');
console.log('SafeUser created - id:', safeUser.id, 'username:', safeUser.username);

// Demonstrate null validation
try {
  const invalidUser = new SafeUser(null as any, 'test', undefined);
  console.log('Should not reach here', invalidUser);
} catch (e: unknown) {
  console.log('Caught expected error:', (e as Error).message);
}

// ============================================
// 11. @Log - Logger Injection
// ============================================
console.log('\n=== 11. @Log Demo ===');

@Log
@NoArgsConstructor
class LogService {
  process(data: string): void {
    this.log.info(`Processing: ${data}`);
  }

  handleError(error: string): void {
    this.log.error(`Error: ${error}`);
  }
}

const logService = new LogService();
logService.process('some data');
logService.handleError('something went wrong');

// ============================================
// 12. @Singleton - Single Instance Pattern
// ============================================
console.log('\n=== 12. @Singleton Demo ===');

@Singleton
@NoArgsConstructor
class AppConfiguration {
  appName: string = 'MyApp';
  version: string = '1.0.0';
  debug: boolean = false;
}

const config1 = AppConfiguration.getInstance();
const config2 = AppConfiguration.getInstance();

console.log('config1 === config2:', config1 === config2);
console.log('App name:', config1.appName);

// Modify via one reference
config1.debug = true;
console.log('debug via config2:', config2.debug);

// ============================================
// 13. Complex Example - Combining Multiple Decorators
// ============================================
console.log('\n=== 13. Complex Combined Example ===');

@Record
@With
@Equals
class Order {
  orderId!: string;
  customerId!: number;
  items!: string[];
  total!: number;
  status!: string;
}

const order1 = new Order('ORD-001', 100, ['item1', 'item2'], 150.00, 'pending');
console.log('Order created:', order1.toString());

// Create modified copy with full type safety
const order2 = order1.withStatus('shipped').withTotal(145.00);
console.log('Updated order:', order2.toString());

// Original unchanged
console.log('Original order:', order1.toString());

// Check equality
const order3 = new Order('ORD-001', 100, ['item1', 'item2'], 150.00, 'pending');
console.log('order1 equals order3:', order1.equals(order3));

// ============================================
// Summary
// ============================================
console.log('\n=== Demo Complete ===');
console.log('All ts-lombok-kit decorators demonstrated with full type safety!');
console.log(`
Available decorators:
  - @Record / @Value  : Immutable data carriers
  - @With             : Immutable update methods (withX)
  - @Equals           : Value-based equality & hashCode
  - @Getter / @Setter : Accessor methods (getX/setX)
  - @ToString         : String representation
  - @Data             : Combines Getter, Setter, ToString, Equals, AllArgsConstructor
  - @Builder          : Builder pattern with fluent API
  - @NoArgsConstructor: Empty constructor
  - @AllArgsConstructor: Full constructor
  - @RequiredArgsConstructor: Required fields constructor
  - @NonNull          : Null validation
  - @Log              : Logger injection
  - @Singleton        : Single instance pattern
`);
