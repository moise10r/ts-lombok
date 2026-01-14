/**
 * Runtime marker stubs for ts-lombok decorators.
 * These are no-op functions that serve as markers for the compile-time transformer.
 * The actual transformation happens at compile time via ts-patch.
 */

/**
 * @Record decorator - Creates an immutable data carrier class.
 *
 * Generates:
 * - Constructor with all fields as parameters
 * - Readonly properties
 * - Object.freeze(this) in constructor
 * - toString() method
 *
 * @example
 * ```typescript
 * @Record
 * class User {
 *   id: number;
 *   name: string;
 * }
 *
 * const user = new User(1, 'John');
 * // user.id = 2; // Error: Cannot assign to readonly property
 * ```
 */
export function Record<T extends { new (...args: any[]): {} }>(target: T): T {
  return target;
}

/**
 * @Value decorator - Alias for @Record.
 * Creates an immutable value class with readonly fields and freeze.
 *
 * @example
 * ```typescript
 * @Value
 * class Point {
 *   x: number;
 *   y: number;
 * }
 * ```
 */
export function Value<T extends { new (...args: any[]): {} }>(target: T): T {
  return target;
}

/**
 * @Equals decorator - Generates value-based equality methods.
 *
 * Generates:
 * - equals(other: T): boolean - Value-based equality comparison
 * - hashCode(): number - Hash code based on field values
 *
 * @example
 * ```typescript
 * @Equals
 * class Point {
 *   x: number;
 *   y: number;
 * }
 *
 * const p1 = new Point(1, 2);
 * const p2 = new Point(1, 2);
 * p1.equals(p2); // true
 * ```
 */
export function Equals<T extends { new (...args: any[]): {} }>(target: T): T {
  return target;
}

/**
 * @With decorator - Generates withX() methods for each field.
 *
 * Generates immutable update methods that return a new instance
 * with the specified field changed.
 *
 * @example
 * ```typescript
 * @With
 * class User {
 *   id: number;
 *   name: string;
 * }
 *
 * const user = new User(1, 'John');
 * const updated = user.withName('Jane'); // New instance with name='Jane'
 * ```
 */
export function With<T extends { new (...args: any[]): {} }>(target: T): T {
  return target;
}

/**
 * @Getter decorator - Generates getter methods for all fields.
 *
 * Can be applied to a class (generates getters for all fields) or
 * to individual properties.
 *
 * @example
 * ```typescript
 * @Getter
 * class User {
 *   private _id: number;
 *   private _name: string;
 * }
 *
 * const user = new User();
 * user.getId(); // returns _id value
 * ```
 */
export function Getter<T extends { new (...args: any[]): {} }>(target: T): T;
export function Getter(target: any, propertyKey: string): void;
export function Getter(target: any, propertyKey?: string): any {
  return propertyKey ? undefined : target;
}

/**
 * @Setter decorator - Generates setter methods for all fields.
 *
 * Can be applied to a class (generates setters for all fields) or
 * to individual properties.
 *
 * @example
 * ```typescript
 * @Setter
 * class User {
 *   private _id: number;
 *   private _name: string;
 * }
 *
 * const user = new User();
 * user.setId(1);
 * ```
 */
export function Setter<T extends { new (...args: any[]): {} }>(target: T): T;
export function Setter(target: any, propertyKey: string): void;
export function Setter(target: any, propertyKey?: string): any {
  return propertyKey ? undefined : target;
}

/**
 * @ToString decorator - Generates a toString() method.
 *
 * @example
 * ```typescript
 * @ToString
 * class User {
 *   id: number;
 *   name: string;
 * }
 *
 * new User().toString(); // "User(id=1, name=John)"
 * ```
 */
export function ToString<T extends { new (...args: any[]): {} }>(target: T): T {
  return target;
}

/**
 * @Data decorator - Shortcut for common boilerplate.
 *
 * Combines: @Getter @Setter @ToString @Equals @AllArgsConstructor
 *
 * @example
 * ```typescript
 * @Data
 * class User {
 *   id: number;
 *   name: string;
 * }
 *
 * // Generates: constructor, getters, setters, toString, equals, hashCode
 * ```
 */
export function Data<T extends { new (...args: any[]): {} }>(target: T): T {
  return target;
}

/**
 * @Builder decorator - Implements the builder pattern.
 *
 * Generates a static builder() method and a Builder class.
 *
 * @example
 * ```typescript
 * @Builder
 * class User {
 *   id: number;
 *   name: string;
 *   email: string;
 * }
 *
 * const user = User.builder()
 *   .id(1)
 *   .name('John')
 *   .email('john@example.com')
 *   .build();
 * ```
 */
export function Builder<T extends { new (...args: any[]): {} }>(target: T): T {
  return target;
}

/**
 * @NoArgsConstructor decorator - Generates an empty constructor.
 *
 * @example
 * ```typescript
 * @NoArgsConstructor
 * class User {
 *   id: number;
 *   name: string;
 * }
 *
 * const user = new User(); // Works!
 * ```
 */
export function NoArgsConstructor<T extends { new (...args: any[]): {} }>(target: T): T {
  return target;
}

/**
 * @AllArgsConstructor decorator - Generates constructor with all fields.
 *
 * @example
 * ```typescript
 * @AllArgsConstructor
 * class User {
 *   id: number;
 *   name: string;
 * }
 *
 * const user = new User(1, 'John');
 * ```
 */
export function AllArgsConstructor<T extends { new (...args: any[]): {} }>(target: T): T {
  return target;
}

/**
 * @RequiredArgsConstructor decorator - Generates constructor with required fields only.
 *
 * Only includes fields that don't have initializers and aren't optional.
 *
 * @example
 * ```typescript
 * @RequiredArgsConstructor
 * class User {
 *   id: number;              // Required - included
 *   name: string;            // Required - included
 *   active: boolean = true;  // Has initializer - excluded
 *   nickname?: string;       // Optional - excluded
 * }
 *
 * const user = new User(1, 'John');
 * ```
 */
export function RequiredArgsConstructor<T extends { new (...args: any[]): {} }>(target: T): T {
  return target;
}

/**
 * @NonNull decorator - Validates that a field is not null/undefined.
 *
 * Property decorator that adds null-checking in the constructor.
 *
 * @example
 * ```typescript
 * class User {
 *   @NonNull
 *   id: number;
 *
 *   @NonNull
 *   name: string;
 * }
 *
 * new User(null, 'John'); // Throws: "id cannot be null or undefined"
 * ```
 */
export function NonNull(target: any, propertyKey: string): void {
  // No-op marker
}

/**
 * @Log decorator - Generates a logger field.
 *
 * Creates a private logger field using console by default.
 *
 * @example
 * ```typescript
 * @Log
 * class UserService {
 *   doSomething() {
 *     this.log.info('Doing something');
 *   }
 * }
 * ```
 */
export function Log<T extends { new (...args: any[]): {} }>(target: T): T {
  return target;
}

/**
 * @Singleton decorator - Ensures only one instance exists.
 *
 * Makes the constructor private and provides getInstance() method.
 *
 * @example
 * ```typescript
 * @Singleton
 * class Config {
 *   apiUrl: string = 'https://api.example.com';
 * }
 *
 * const config = Config.getInstance();
 * ```
 */
export function Singleton<T extends { new (...args: any[]): {} }>(target: T): T {
  return target;
}

/**
 * @Memoize decorator - Caches method results.
 *
 * Method decorator that caches return values based on arguments.
 *
 * @example
 * ```typescript
 * class Calculator {
 *   @Memoize
 *   fibonacci(n: number): number {
 *     if (n <= 1) return n;
 *     return this.fibonacci(n - 1) + this.fibonacci(n - 2);
 *   }
 * }
 * ```
 */
export function Memoize(target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  return descriptor;
}

/**
 * @Autobind decorator - Binds method to instance.
 *
 * Ensures 'this' always refers to the class instance.
 *
 * @example
 * ```typescript
 * class Button {
 *   @Autobind
 *   onClick() {
 *     console.log(this); // Always the Button instance
 *   }
 * }
 *
 * const btn = new Button();
 * document.addEventListener('click', btn.onClick); // 'this' is preserved
 * ```
 */
export function Autobind(target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  return descriptor;
}
