# ts-lombok

TypeScript library providing Lombok-style decorators via compile-time AST transformers.

## Features

- **Zero runtime cost** - All transformations happen at compile time
- **Type-safe** - Full TypeScript support with proper type inference
- **Immutable patterns** - `@Record`, `@Value`, `@With` for immutable data
- **Boilerplate reduction** - `@Data`, `@Getter`, `@Setter`, `@ToString`, `@Equals`
- **Builder pattern** - `@Builder` for fluent object construction
- **Constructor variants** - `@NoArgsConstructor`, `@AllArgsConstructor`, `@RequiredArgsConstructor`
- **Validation** - `@NonNull` for null-checking
- **Patterns** - `@Singleton`, `@Log`

## Installation

```bash
npm install lombokx-ts ts-patch
```

### Setup ts-patch

Add to your `package.json`:

```json
{
  "scripts": {
    "prepare": "ts-patch install -s"
  }
}
```

Then run:

```bash
npm run prepare
```

### Configure tsconfig.json

```json
{
  "compilerOptions": {
    "plugins": [
      { "transform": "lombokx-ts" }
    ]
  }
}
```

## Decorators

Import decorators from `ts-lombok/markers`:

```typescript
import { Record, Data, Builder, Getter, Setter } from 'lombokx-ts/markers';
```

---

### @Record

Creates an immutable data carrier with:
- Constructor with all fields as parameters
- Readonly properties
- `Object.freeze(this)` in constructor
- `toString()` method

```typescript
@Record
class User {
  id: number;
  name: string;
}

const user = new User(1, 'John');
console.log(user.toString()); // User(id=1, name=John)
console.log(Object.isFrozen(user)); // true
// user.name = 'Jane'; // Error: Cannot assign to readonly
```

---

### @Value

Alias for `@Record`. Creates an immutable value class.

```typescript
@Value
class Point {
  x: number;
  y: number;
}
```

---

### @Data

Shortcut that combines: `@Getter` + `@Setter` + `@ToString` + `@Equals` + `@AllArgsConstructor`

```typescript
@Data
class User {
  id: number;
  name: string;
}

const user = new User(1, 'John');
user.getId();           // 1
user.setName('Jane');
user.toString();        // User(id=1, name=Jane)
user.equals(other);     // true/false
user.hashCode();        // number
```

---

### @Getter / @Setter

Generate getter and setter methods for all properties.

```typescript
@Getter
@Setter
class User {
  id: number;
  name: string;
}

const user = new User();
user.setId(1);
user.setName('John');
console.log(user.getId());   // 1
console.log(user.getName()); // 'John'
```

---

### @ToString

Generates a `toString()` method.

```typescript
@ToString
class User {
  id: number;
  name: string;
}

new User().toString(); // "User(id=..., name=...)"
```

---

### @Equals

Generates value-based equality methods:
- `equals(other: T): boolean`
- `hashCode(): number`

```typescript
@Equals
class Point {
  x: number;
  y: number;
}

const p1 = new Point(); p1.x = 1; p1.y = 2;
const p2 = new Point(); p2.x = 1; p2.y = 2;

p1.equals(p2);                     // true
p1.hashCode() === p2.hashCode();   // true
```

---

### @With

Generates `withX()` methods for immutable updates.

```typescript
@Record
@With
class User {
  id: number;
  name: string;
}

const user = new User(1, 'John');
const updated = user.withName('Jane');

console.log(user.name);    // 'John' (unchanged)
console.log(updated.name); // 'Jane' (new instance)
```

---

### @Builder

Implements the builder pattern with a fluent API.

```typescript
@Builder
class User {
  id: number;
  name: string;
  email: string;
}

const user = User.builder()
  .id(1)
  .name('John')
  .email('john@example.com')
  .build();
```

---

### @NoArgsConstructor

Generates an empty constructor.

```typescript
@NoArgsConstructor
class Config {
  host: string;
  port: number;
}

const config = new Config();
config.host = 'localhost';
config.port = 3000;
```

---

### @AllArgsConstructor

Generates a constructor with all fields as parameters.

```typescript
@AllArgsConstructor
class Point {
  x: number;
  y: number;
  z: number;
}

const p = new Point(1, 2, 3);
```

---

### @RequiredArgsConstructor

Generates a constructor with only required fields (non-optional, no initializer).

```typescript
@RequiredArgsConstructor
class User {
  id: number;              // Required - in constructor
  name: string;            // Required - in constructor
  active: boolean = true;  // Has initializer - excluded
  nickname?: string;       // Optional - excluded
}

const user = new User(1, 'John');
console.log(user.active); // true (default value)
```

---

### @NonNull

Property decorator that validates fields are not null/undefined in the constructor.

```typescript
@AllArgsConstructor
class User {
  @NonNull
  id: number;

  @NonNull
  name: string;
}

new User(1, 'John');     // OK
new User(null, 'John');  // Throws: "id cannot be null or undefined"
```

---

### @Singleton

Ensures only one instance exists via `getInstance()`.

```typescript
@Singleton
@NoArgsConstructor
class AppConfig {
  apiUrl: string = 'https://api.example.com';
}

const config1 = AppConfig.getInstance();
const config2 = AppConfig.getInstance();
console.log(config1 === config2); // true
```

---

### @Log

Generates a protected logger field using `console`.

```typescript
@Log
class UserService {
  createUser(name: string) {
    this.log.info(`Creating user: ${name}`);
    // ...
  }
}
```

---

## Combining Decorators

Decorators can be combined for full functionality:

```typescript
@Record
@Equals
@With
class Product {
  id: number;
  name: string;
  price: number;
}

const p1 = new Product(1, 'Widget', 9.99);
const p2 = p1.withPrice(19.99);

console.log(p1.equals(p2));   // false
console.log(p1.toString());   // Product(id=1, name=Widget, price=9.99)
console.log(Object.isFrozen(p1)); // true
```

## How It Works

ts-lombok uses TypeScript's compiler API to transform your code at compile time:

1. **Parse** - Reads your TypeScript source files
2. **Transform** - Identifies decorated classes and generates code
3. **Emit** - Outputs the transformed JavaScript

The decorator markers (`ts-lombok/markers`) are no-op functions at runtime—they only serve as markers for the compiler transformer.

## Decorator Reference

| Decorator | Type | Description |
|-----------|------|-------------|
| `@Record` | Class | Immutable data carrier (constructor, readonly, freeze, toString) |
| `@Value` | Class | Alias for @Record |
| `@Data` | Class | @Getter + @Setter + @ToString + @Equals + @AllArgsConstructor |
| `@Getter` | Class | Generate getX() methods |
| `@Setter` | Class | Generate setX() methods |
| `@ToString` | Class | Generate toString() method |
| `@Equals` | Class | Generate equals() and hashCode() |
| `@With` | Class | Generate withX() methods |
| `@Builder` | Class | Generate builder pattern |
| `@NoArgsConstructor` | Class | Generate empty constructor |
| `@AllArgsConstructor` | Class | Generate constructor with all fields |
| `@RequiredArgsConstructor` | Class | Generate constructor with required fields |
| `@Singleton` | Class | Singleton pattern with getInstance() |
| `@Log` | Class | Add protected logger field |
| `@NonNull` | Property | Validate not null in constructor |

## Requirements

- TypeScript 4.8+
- Node.js 16+
- ts-patch for compiler plugin support

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, project structure, and pull request guidelines. We also have a [Code of Conduct](CODE_OF_CONDUCT.md).

## License

MIT
