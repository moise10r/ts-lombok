/**
 * ts-lombok-kit - Runtime decorator implementations with full type safety
 *
 * These decorators work both with and without the compile-time transformer:
 * - With transformer: Code is generated at compile time (zero runtime cost)
 * - Without transformer: Runtime implementation provides the same functionality
 *
 * This ensures full TypeScript type safety with default tsconfig settings.
 */

// =============================================================================
// Type Utilities
// =============================================================================

type Constructor<T = {}> = new (...args: any[]) => T;

type PropertyKeys<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

type Capitalize<S extends string> = S extends `${infer F}${infer R}` ? `${Uppercase<F>}${R}` : S;

// =============================================================================
// Mixin Types
// =============================================================================

interface ToStringMixin {
  toString(): string;
}

interface EqualsMixin<T> {
  equals(other: T | null | undefined): boolean;
  hashCode(): number;
}

interface LogMixin {
  readonly log: Console;
}

type GetterMethods<T> = {
  [K in keyof T as K extends string ? `get${Capitalize<K>}` : never]: () => T[K];
};

type SetterMethods<T> = {
  [K in keyof T as K extends string ? `set${Capitalize<K>}` : never]: (value: T[K]) => void;
};

type WithMethods<T, Instance> = {
  [K in keyof T as K extends string ? `with${Capitalize<K>}` : never]: (value: T[K]) => Instance;
};

// Self-referential: with* methods return the full augmented type so chains like
// obj.withA(x).withB(y) stay fully typed
type WithSelf<Base, Props> = Base & {
  [K in keyof Props as K extends string ? `with${Capitalize<K>}` : never]: (value: Props[K]) => WithSelf<Base, Props>;
};

interface SingletonStatic<T> {
  getInstance(): T;
}

// Self-referential: each fluent method returns the full builder (not just BuilderInstance)
type FluentBuilder<T, Props> = {
  build(): T;
} & {
  [K in keyof Props]: (value: Props[K]) => FluentBuilder<T, Props>;
};

interface BuilderStatic<T, Props> {
  builder(): FluentBuilder<T, Props>;
}

// =============================================================================
// Helper Functions
// =============================================================================

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getPropertyNames<T>(obj: T): string[] {
  const props: string[] = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && typeof (obj as any)[key] !== 'function') {
      props.push(key);
    }
  }
  return props;
}

function getClassPropertyNames(cls: Constructor): string[] {
  // Get property names from class prototype and instance
  const instance = Object.create(cls.prototype);
  const props: string[] = [];

  // Check for property declarations in the class
  const descriptors = Object.getOwnPropertyDescriptors(cls.prototype);
  for (const key of Object.keys(descriptors)) {
    if (key !== 'constructor' && typeof descriptors[key].value !== 'function') {
      props.push(key);
    }
  }

  return props;
}

// =============================================================================
// @Record / @Value - Immutable data carrier
// =============================================================================

type RecordClass<T extends Constructor, Props> = Constructor<InstanceType<T> & ToStringMixin> & {
  new (...args: Props[keyof Props][]): InstanceType<T> & ToStringMixin;
};

export function Record<T extends Constructor>(target: T): RecordClass<T, InstanceType<T>> {
  const propNames = Object.getOwnPropertyNames(new (target as any)()).filter(
    p => p !== 'constructor' && typeof (target.prototype as any)[p] !== 'function'
  );

  // Create new class with constructor
  const newClass = class extends (target as Constructor<any>) {
    constructor(...args: any[]) {
      super();
      propNames.forEach((name, index) => {
        (this as any)[name] = args[index];
      });
      Object.freeze(this);
    }

    toString(): string {
      const fields = propNames.map(p => `${p}=${(this as any)[p]}`).join(', ');
      return `${target.name}(${fields})`;
    }
  };

  Object.defineProperty(newClass, 'name', { value: target.name });
  return newClass as any;
}

export const Value = Record;

// =============================================================================
// @Equals - Value-based equality
// =============================================================================

type EqualsClass<T extends Constructor> = Constructor<InstanceType<T> & EqualsMixin<InstanceType<T>>> & {
  new (...args: ConstructorParameters<T>): InstanceType<T> & EqualsMixin<InstanceType<T>>;
};

export function Equals<T extends Constructor>(target: T): EqualsClass<T> {
  const newClass = class extends (target as Constructor<any>) {
    equals(other: any): boolean {
      if (other == null) return false;
      if (this === other) return true;
      if (!(other instanceof target)) return false;

      const props = Object.keys(this).filter(k => typeof (this as any)[k] !== 'function');
      return props.every(p => (this as any)[p] === (other as any)[p]);
    }

    hashCode(): number {
      const props = Object.keys(this).filter(k => typeof (this as any)[k] !== 'function');
      let hash = 0;
      for (const p of props) {
        const val = (this as any)[p];
        const valHash = val == null ? 0 : typeof val === 'number' ? val : String(val).length;
        hash = (hash * 31 + valHash) | 0;
      }
      return hash;
    }
  };

  Object.defineProperty(newClass, 'name', { value: target.name });
  return newClass as any;
}

// =============================================================================
// @With - Immutable update methods
// =============================================================================

type WithClass<T extends Constructor, Props> = Constructor<WithSelf<InstanceType<T>, Props>> & {
  new (...args: ConstructorParameters<T>): WithSelf<InstanceType<T>, Props>;
};

export function With<T extends Constructor>(target: T): WithClass<T, InstanceType<T>> {
  const proto = target.prototype;

  // Add withX methods for each property
  const instance = new (target as any)();
  const props = Object.keys(instance).filter(k => typeof instance[k] !== 'function');

  for (const prop of props) {
    const methodName = `with${capitalize(prop)}`;
    if (!(methodName in proto)) {
      proto[methodName] = function (this: any, value: any) {
        const args = props.map(p => (p === prop ? value : this[p]));
        return new (target as any)(...args);
      };
    }
  }

  return target as any;
}

// =============================================================================
// @Getter - Generate getter methods
// =============================================================================

type GetterClass<T extends Constructor, Props> = Constructor<InstanceType<T> & GetterMethods<Props>> & {
  new (...args: ConstructorParameters<T>): InstanceType<T> & GetterMethods<Props>;
};

export function Getter<T extends Constructor>(target: T): GetterClass<T, InstanceType<T>>;
export function Getter(target: any, propertyKey: string): void;
export function Getter<T extends Constructor>(target: T, propertyKey?: string): any {
  if (propertyKey) return; // Property decorator - handled by transformer

  const proto = target.prototype;
  const instance = new (target as any)();
  const props = Object.keys(instance).filter(k => typeof instance[k] !== 'function');

  for (const prop of props) {
    const methodName = `get${capitalize(prop)}`;
    if (!(methodName in proto)) {
      proto[methodName] = function (this: any) {
        return this[prop];
      };
    }
  }

  return target as any;
}

// =============================================================================
// @Setter - Generate setter methods
// =============================================================================

type SetterClass<T extends Constructor, Props> = Constructor<InstanceType<T> & SetterMethods<Props>> & {
  new (...args: ConstructorParameters<T>): InstanceType<T> & SetterMethods<Props>;
};

export function Setter<T extends Constructor>(target: T): SetterClass<T, InstanceType<T>>;
export function Setter(target: any, propertyKey: string): void;
export function Setter<T extends Constructor>(target: T, propertyKey?: string): any {
  if (propertyKey) return;

  const proto = target.prototype;
  const instance = new (target as any)();
  const props = Object.keys(instance).filter(k => typeof instance[k] !== 'function');

  for (const prop of props) {
    const methodName = `set${capitalize(prop)}`;
    if (!(methodName in proto)) {
      proto[methodName] = function (this: any, value: any) {
        this[prop] = value;
      };
    }
  }

  return target as any;
}

// =============================================================================
// @ToString - Generate toString method
// =============================================================================

type ToStringClass<T extends Constructor> = Constructor<InstanceType<T> & ToStringMixin> & {
  new (...args: ConstructorParameters<T>): InstanceType<T> & ToStringMixin;
};

export function ToString<T extends Constructor>(target: T): ToStringClass<T> {
  const proto = target.prototype;

  if (!('toString' in proto) || proto.toString === Object.prototype.toString) {
    proto.toString = function (this: any): string {
      const props = Object.keys(this).filter(k => typeof this[k] !== 'function');
      const fields = props.map(p => `${p}=${this[p]}`).join(', ');
      return `${target.name}(${fields})`;
    };
  }

  return target as any;
}

// =============================================================================
// @Data - Combines Getter, Setter, ToString, Equals, AllArgsConstructor
// =============================================================================

type DataClass<T extends Constructor, Props> = Constructor<
  InstanceType<T> & ToStringMixin & EqualsMixin<InstanceType<T>> & GetterMethods<Props> & SetterMethods<Props>
> & {
  new (...args: Props[keyof Props][]): InstanceType<T> & ToStringMixin & EqualsMixin<InstanceType<T>> & GetterMethods<Props> & SetterMethods<Props>;
};

export function Data<T extends Constructor>(target: T): DataClass<T, InstanceType<T>> {
  // Apply all component decorators
  let result = AllArgsConstructor(target);
  result = Getter(result) as any;
  result = Setter(result) as any;
  result = ToString(result) as any;
  result = Equals(result) as any;
  return result as any;
}

// =============================================================================
// @Builder - Builder pattern
// =============================================================================

type BuilderClass<T extends Constructor, Props> = T & BuilderStatic<InstanceType<T>, Props> & {
  new (...args: Props[keyof Props][]): InstanceType<T>;
};

export function Builder<T extends Constructor>(target: T): BuilderClass<T, InstanceType<T>> {
  const instance = new (target as any)();
  const props = Object.keys(instance).filter(k => typeof instance[k] !== 'function');

  // Build constructor that accepts all args; defined first so BuilderImpl can close over it
  const newClass = class extends (target as Constructor<any>) {
    constructor(...args: any[]) {
      super();
      props.forEach((name, index) => {
        (this as any)[name] = args[index];
      });
    }
  };
  Object.defineProperty(newClass, 'name', { value: target.name });

  // BuilderImpl closes over newClass so build() uses the arg-accepting constructor
  class BuilderImpl {
    private _values: Record<string, any> = {};

    build(): InstanceType<T> {
      const args = props.map(p => this._values[p]);
      return new (newClass as any)(...args);
    }
  }

  // Add fluent methods for each property
  for (const prop of props) {
    (BuilderImpl.prototype as any)[prop] = function (this: any, value: any) {
      this._values[prop] = value;
      return this;
    };
  }

  (newClass as any).builder = function () {
    return new BuilderImpl();
  };

  return newClass as any;
}

// =============================================================================
// @NoArgsConstructor - Empty constructor
// =============================================================================

type NoArgsClass<T extends Constructor> = Constructor<InstanceType<T>> & {
  new (): InstanceType<T>;
};

export function NoArgsConstructor<T extends Constructor>(target: T): NoArgsClass<T> {
  // Class already has default constructor, just return it
  return target as any;
}

// =============================================================================
// @AllArgsConstructor - Constructor with all fields
// =============================================================================

type AllArgsClass<T extends Constructor, Props> = Constructor<InstanceType<T>> & {
  new (...args: Props[keyof Props][]): InstanceType<T>;
};

export function AllArgsConstructor<T extends Constructor>(target: T): AllArgsClass<T, InstanceType<T>> {
  const instance = new (target as any)();
  const props = Object.keys(instance).filter(k => typeof instance[k] !== 'function');

  const newClass = class extends (target as Constructor<any>) {
    constructor(...args: any[]) {
      super();
      props.forEach((name, index) => {
        (this as any)[name] = args[index];
      });
    }
  };

  Object.defineProperty(newClass, 'name', { value: target.name });
  return newClass as any;
}

// =============================================================================
// @RequiredArgsConstructor - Constructor with required fields only
// =============================================================================

export function RequiredArgsConstructor<T extends Constructor>(target: T): AllArgsClass<T, InstanceType<T>> {
  // At runtime, we can't distinguish required from optional, so same as AllArgs
  // The transformer handles this properly at compile time
  return AllArgsConstructor(target);
}

// =============================================================================
// @NonNull - Null validation (property decorator)
// =============================================================================

const nonNullProperties = new WeakMap<object, Set<string>>();

export function NonNull(target: any, propertyKey: string): void {
  const constructor = target.constructor;
  if (!nonNullProperties.has(constructor)) {
    nonNullProperties.set(constructor, new Set());
  }
  nonNullProperties.get(constructor)!.add(propertyKey);
}

// Helper to validate NonNull properties (called by generated constructors)
export function validateNonNull(instance: any, props: string[]): void {
  for (const prop of props) {
    if ((instance as any)[prop] == null) {
      throw new Error(`${prop} cannot be null or undefined`);
    }
  }
}

// =============================================================================
// @Log - Logger injection
// =============================================================================

type LogClass<T extends Constructor> = Constructor<InstanceType<T> & LogMixin> & {
  new (...args: ConstructorParameters<T>): InstanceType<T> & LogMixin;
};

export function Log<T extends Constructor>(target: T): LogClass<T> {
  const proto = target.prototype;

  Object.defineProperty(proto, 'log', {
    get() {
      return console;
    },
    enumerable: false,
    configurable: true,
  });

  return target as any;
}

// =============================================================================
// @Singleton - Single instance pattern
// =============================================================================

type SingletonClass<T extends Constructor> = T & SingletonStatic<InstanceType<T>>;

export function Singleton<T extends Constructor>(target: T): SingletonClass<T> {
  let instance: InstanceType<T> | null = null;

  (target as any).getInstance = function (): InstanceType<T> {
    if (instance === null) {
      instance = new (target as any)();
    }
    return instance!;
  };

  return target as any;
}

// =============================================================================
// @Memoize - Cache method results (stub - implemented by transformer)
// =============================================================================

export function Memoize(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  return descriptor;
}

// =============================================================================
// @Autobind - Bind method to instance (stub - implemented by transformer)
// =============================================================================

export function Autobind(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  return descriptor;
}
