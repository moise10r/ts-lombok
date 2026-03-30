"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const markers_1 = require("ts-lombok-kit/markers");
// =============================================================================
// 1. @Record — Immutable Data Carrier
// =============================================================================
console.log('\n=== 1. @Record ===');
const User = (0, markers_1.Record)(class User {
    constructor() {
        this.id = 0;
        this.name = '';
        this.email = '';
    }
});
const user = new User(1, 'Alice', 'alice@example.com');
console.log(user.toString());
console.log('frozen:', Object.isFrozen(user));
// =============================================================================
// 2. @Value — Alias for @Record
// =============================================================================
console.log('\n=== 2. @Value ===');
const Coordinates = (0, markers_1.Value)(class Coordinates {
    constructor() {
        this.latitude = 0;
        this.longitude = 0;
    }
});
const coords = new Coordinates(48.8566, 2.3522);
console.log(coords.toString());
// =============================================================================
// 3. @Equals — Value-based equality
// =============================================================================
console.log('\n=== 3. @Equals ===');
const Point = (0, markers_1.Equals)((0, markers_1.Record)(class Point {
    constructor() {
        this.x = 0;
        this.y = 0;
    }
}));
const p1 = new Point(10, 20);
const p2 = new Point(10, 20);
const p3 = new Point(5, 99);
console.log('p1.equals(p2):', p1.equals(p2)); // true
console.log('p1.equals(p3):', p1.equals(p3)); // false
console.log('p1.hashCode():', p1.hashCode());
console.log('same hash:', p1.hashCode() === p2.hashCode()); // true
// =============================================================================
// 4. @With — Immutable update methods
// =============================================================================
console.log('\n=== 4. @With ===');
const Product = (0, markers_1.With)((0, markers_1.Record)(class Product {
    constructor() {
        this.id = 0;
        this.name = '';
        this.price = 0;
    }
}));
const product1 = new Product(1, 'Laptop', 999);
const product2 = product1.withPrice(799);
console.log('original:', product1.toString());
console.log('updated: ', product2.toString());
console.log('different instances:', product1 !== product2);
// =============================================================================
// 5. @Data — Getters + Setters + ToString + Equals + Constructor
// =============================================================================
console.log('\n=== 5. @Data ===');
const Person = (0, markers_1.Data)(class Person {
    constructor() {
        this.id = 0;
        this.firstName = '';
        this.lastName = '';
        this.age = 0;
    }
});
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
const ServerConfig = (0, markers_1.Builder)(class ServerConfig {
    constructor() {
        this.host = '';
        this.port = 0;
        this.ssl = false;
        this.timeout = 0;
    }
});
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
const Account = (0, markers_1.Setter)((0, markers_1.Getter)((0, markers_1.AllArgsConstructor)(class {
    constructor() {
        this.accountNumber = '';
        this.balance = 0;
        this.active = false;
    }
})));
const account = new Account('ACC-001', 1000, true);
console.log('account:', account.getAccountNumber());
console.log('balance:', account.getBalance());
account.setBalance(1500);
console.log('after deposit:', account.getBalance());
// =============================================================================
// 8. @ToString — String representation
// =============================================================================
console.log('\n=== 8. @ToString ===');
const Book = (0, markers_1.ToString)((0, markers_1.AllArgsConstructor)(class {
    constructor() {
        this.isbn = '';
        this.title = '';
        this.author = '';
    }
}));
const book = new Book('978-0-13-468599-1', 'Clean Code', 'Robert Martin');
console.log(book.toString());
// =============================================================================
// 9. @NoArgsConstructor
// =============================================================================
console.log('\n=== 9. @NoArgsConstructor ===');
const Config = (0, markers_1.NoArgsConstructor)(class {
    constructor() {
        this.host = 'localhost';
        this.port = 3000;
    }
});
const defaultConfig = new Config();
console.log('host:', defaultConfig.host, 'port:', defaultConfig.port);
// =============================================================================
// 10. @Log — Logger injection
// =============================================================================
console.log('\n=== 10. @Log ===');
const LogService = (0, markers_1.Log)((0, markers_1.NoArgsConstructor)(class {
    process(data) {
        this.log.info(`Processing: ${data}`);
    }
    handleError(msg) {
        this.log.error(`Error: ${msg}`);
    }
}));
const svc = new LogService();
svc.process('request payload');
svc.handleError('timeout occurred');
// =============================================================================
// 11. @Singleton — Single instance
// =============================================================================
console.log('\n=== 11. @Singleton ===');
const AppConfig = (0, markers_1.Singleton)((0, markers_1.NoArgsConstructor)(class {
    constructor() {
        this.appName = 'StrictApp';
        this.debug = false;
    }
}));
const inst1 = AppConfig.getInstance();
const inst2 = AppConfig.getInstance();
console.log('same instance:', inst1 === inst2);
inst1.debug = true;
console.log('debug via inst2:', inst2.debug);
// =============================================================================
// 12. Combined: @Record + @With + @Equals
// =============================================================================
console.log('\n=== 12. Combined @Record + @With + @Equals ===');
const Order = (0, markers_1.With)((0, markers_1.Equals)((0, markers_1.Record)(class Order {
    constructor() {
        this.orderId = '';
        this.customerId = 0;
        this.total = 0;
        this.status = '';
    }
})));
const order1 = new Order('ORD-001', 42, 150, 'pending');
const order2 = order1.withStatus('shipped').withTotal(140);
console.log('order1:', order1.toString());
console.log('order2:', order2.toString());
console.log('order1 unchanged:', order1.status === 'pending');
const order3 = new Order('ORD-001', 42, 150, 'pending');
console.log('order1 equals order3:', order1.equals(order3));
console.log('\n=== All done — zero tsconfig relaxations needed ===');
