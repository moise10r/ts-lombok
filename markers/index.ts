type Constructor<T = object> = new (...args: any[]) => T;

type Capitalize<S extends string> =
  S extends `${infer F}${infer R}` ? `${Uppercase<F>}${R}` : S;

type Fields<T> = {
  [K in keyof T as T[K] extends ((...args: any[]) => any) ? never : K]: T[K];
};

type GetterMethods<T> = {
  [K in keyof Fields<T> as K extends string ? `get${Capitalize<K>}` : never]: () => Fields<T>[K];
};

type SetterMethods<T> = {
  [K in keyof Fields<T> as K extends string ? `set${Capitalize<K>}` : never]: (value: Fields<T>[K]) => void;
};

type WithSelf<T> = T & {
  [K in keyof Fields<T> as K extends string ? `with${Capitalize<K>}` : never]:
    (value: Fields<T>[K]) => WithSelf<T>;
};

interface EqualsMixin<T> {
  equals(other: T | null | undefined): boolean;
  hashCode(): number;
}

type FluentBuilder<T> = { build(): T } & {
  [K in keyof Fields<T>]: (value: Fields<T>[K]) => FluentBuilder<T>;
};

type RecordReturn<T extends Constructor> =
  { new (...args: any[]): InstanceType<T> & { toString(): string } } & T;

type EqualsReturn<T extends Constructor> =
  { new (...args: any[]): InstanceType<T> & EqualsMixin<InstanceType<T>> } & T;

type WithReturn<T extends Constructor> =
  { new (...args: any[]): WithSelf<InstanceType<T>> } & T;

type GetterReturn<T extends Constructor> =
  { new (...args: any[]): InstanceType<T> & GetterMethods<InstanceType<T>> } & T;

type SetterReturn<T extends Constructor> =
  { new (...args: any[]): InstanceType<T> & SetterMethods<InstanceType<T>> } & T;

type ToStringReturn<T extends Constructor> =
  { new (...args: any[]): InstanceType<T> & { toString(): string } } & T;

type DataReturn<T extends Constructor> =
  { new (...args: any[]): InstanceType<T>
      & { toString(): string }
      & EqualsMixin<InstanceType<T>>
      & GetterMethods<InstanceType<T>>
      & SetterMethods<InstanceType<T>>
  } & T;

type BuilderReturn<T extends Constructor> =
  T & { builder(): FluentBuilder<InstanceType<T>> };

type LogReturn<T extends Constructor> =
  { new (...args: any[]): InstanceType<T> & { readonly log: Console } } & T;

type SingletonReturn<T extends Constructor> =
  T & { getInstance(): InstanceType<T> };

type NoArgsReturn<T extends Constructor> =
  { new (): InstanceType<T> } & T;

type StaticMembers<T> = { [K in keyof T]: T[K] };

type AllArgsReturn<T extends Constructor> =
  { new (...args: any[]): InstanceType<T> } & StaticMembers<T>;

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getProps(target: Constructor): string[] {
  return Object.keys(new (target as any)()).filter(
    k => typeof (target.prototype as any)[k] !== 'function',
  );
}

export function Record<T extends Constructor>(target: T, context: ClassDecoratorContext<T>): RecordReturn<T>;
export function Record<T extends Constructor>(target: T): RecordReturn<T>;
export function Record<T extends Constructor>(target: T, _context?: any): RecordReturn<T> {
  const props = getProps(target);
  const newClass = class extends (target as Constructor<any>) {
    constructor(...args: any[]) {
      super();
      props.forEach((name, index) => { (this as any)[name] = args[index]; });
      Object.freeze(this);
    }
    toString(): string {
      return `${target.name}(${props.map(p => `${p}=${(this as any)[p]}`).join(', ')})`;
    }
  };
  Object.defineProperty(newClass, 'name', { value: target.name });
  return newClass as any;
}

export const Value: typeof Record = Record;

export function Equals<T extends Constructor>(target: T, context: ClassDecoratorContext<T>): EqualsReturn<T>;
export function Equals<T extends Constructor>(target: T): EqualsReturn<T>;
export function Equals<T extends Constructor>(target: T, _context?: any): EqualsReturn<T> {
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

export function With<T extends Constructor>(target: T, context: ClassDecoratorContext<T>): WithReturn<T>;
export function With<T extends Constructor>(target: T): WithReturn<T>;
export function With<T extends Constructor>(target: T, _context?: any): WithReturn<T> {
  const proto = target.prototype;
  const props = getProps(target);
  for (const prop of props) {
    const methodName = `with${capitalize(prop)}`;
    if (!(methodName in proto)) {
      proto[methodName] = function (this: any, value: any) {
        const args = props.map(p => (p === prop ? value : this[p]));
        return new (this.constructor as any)(...args);
      };
    }
  }
  return target as any;
}

export function Getter<T extends Constructor>(target: T, context: ClassDecoratorContext<T>): GetterReturn<T>;
export function Getter<T extends Constructor>(target: T): GetterReturn<T>;
export function Getter(target: any, propertyKey: string): void;
export function Getter<T extends Constructor>(target: T, propertyKey?: any): any {
  if (typeof propertyKey === 'string') return;
  const proto = target.prototype;
  const props = getProps(target);
  for (const prop of props) {
    const methodName = `get${capitalize(prop)}`;
    if (!(methodName in proto)) {
      proto[methodName] = function (this: any) { return this[prop]; };
    }
  }
  return target as any;
}

export function Setter<T extends Constructor>(target: T, context: ClassDecoratorContext<T>): SetterReturn<T>;
export function Setter<T extends Constructor>(target: T): SetterReturn<T>;
export function Setter(target: any, propertyKey: string): void;
export function Setter<T extends Constructor>(target: T, propertyKey?: any): any {
  if (typeof propertyKey === 'string') return;
  const proto = target.prototype;
  const props = getProps(target);
  for (const prop of props) {
    const methodName = `set${capitalize(prop)}`;
    if (!(methodName in proto)) {
      proto[methodName] = function (this: any, value: any) { this[prop] = value; };
    }
  }
  return target as any;
}

export function ToString<T extends Constructor>(target: T, context: ClassDecoratorContext<T>): ToStringReturn<T>;
export function ToString<T extends Constructor>(target: T): ToStringReturn<T>;
export function ToString<T extends Constructor>(target: T, _context?: any): ToStringReturn<T> {
  const proto = target.prototype;
  if (!('toString' in proto) || proto.toString === Object.prototype.toString) {
    proto.toString = function (this: any): string {
      const props = Object.keys(this).filter(k => typeof this[k] !== 'function');
      return `${target.name}(${props.map(p => `${p}=${this[p]}`).join(', ')})`;
    };
  }
  return target as any;
}

export function Data<T extends Constructor>(target: T, context: ClassDecoratorContext<T>): DataReturn<T>;
export function Data<T extends Constructor>(target: T): DataReturn<T>;
export function Data<T extends Constructor>(target: T, _context?: any): DataReturn<T> {
  let result: any = AllArgsConstructor(target);
  result = Getter(result);
  result = Setter(result);
  result = ToString(result);
  result = Equals(result);
  return result as any;
}

export function Builder<T extends Constructor>(target: T, context: ClassDecoratorContext<T>): BuilderReturn<T>;
export function Builder<T extends Constructor>(target: T): BuilderReturn<T>;
export function Builder<T extends Constructor>(target: T, _context?: any): BuilderReturn<T> {
  const props = getProps(target);
  const newClass = class extends (target as Constructor<any>) {
    constructor(...args: any[]) {
      super();
      props.forEach((name, index) => { (this as any)[name] = args[index]; });
    }
  };
  Object.defineProperty(newClass, 'name', { value: target.name });

  class BuilderImpl {
    private _values: Record<string, any> = {};
    build(): InstanceType<T> {
      return new (newClass as any)(...props.map(p => this._values[p]));
    }
  }
  for (const prop of props) {
    (BuilderImpl.prototype as any)[prop] = function (this: any, value: any) {
      this._values[prop] = value;
      return this;
    };
  }

  (newClass as any).builder = () => new BuilderImpl();
  return newClass as any;
}

export function NoArgsConstructor<T extends Constructor>(target: T, context: ClassDecoratorContext<T>): NoArgsReturn<T>;
export function NoArgsConstructor<T extends Constructor>(target: T): NoArgsReturn<T>;
export function NoArgsConstructor<T extends Constructor>(target: T, _context?: any): NoArgsReturn<T> {
  return target as any;
}

export function AllArgsConstructor<T extends Constructor>(target: T, context: ClassDecoratorContext<T>): AllArgsReturn<T>;
export function AllArgsConstructor<T extends Constructor>(target: T): AllArgsReturn<T>;
export function AllArgsConstructor<T extends Constructor>(target: T, _context?: any): AllArgsReturn<T> {
  const props = getProps(target);
  const newClass = class extends (target as Constructor<any>) {
    constructor(...args: any[]) {
      super();
      props.forEach((name, index) => { (this as any)[name] = args[index]; });
    }
  };
  Object.defineProperty(newClass, 'name', { value: target.name });
  return newClass as any;
}

export function RequiredArgsConstructor<T extends Constructor>(target: T, context: ClassDecoratorContext<T>): AllArgsReturn<T>;
export function RequiredArgsConstructor<T extends Constructor>(target: T): AllArgsReturn<T>;
export function RequiredArgsConstructor<T extends Constructor>(target: T, _context?: any): AllArgsReturn<T> {
  return AllArgsConstructor(target);
}

const nonNullProperties = new WeakMap<object, Set<string>>();

export function NonNull<This, Value>(target: undefined, context: ClassFieldDecoratorContext<This, Value>): void;
export function NonNull(target: any, propertyKey: string): void;
export function NonNull(target: any, propertyKeyOrContext: any): void {
  if (typeof propertyKeyOrContext !== 'string') return;
  const ctor = target.constructor;
  if (!nonNullProperties.has(ctor)) nonNullProperties.set(ctor, new Set());
  nonNullProperties.get(ctor)!.add(propertyKeyOrContext);
}

export function validateNonNull(instance: any, props: string[]): void {
  for (const prop of props) {
    if ((instance as any)[prop] == null) {
      throw new Error(`${prop} cannot be null or undefined`);
    }
  }
}

export function Log<T extends Constructor>(target: T, context: ClassDecoratorContext<T>): LogReturn<T>;
export function Log<T extends Constructor>(target: T): LogReturn<T>;
export function Log<T extends Constructor>(target: T, _context?: any): LogReturn<T> {
  Object.defineProperty(target.prototype, 'log', {
    get() { return console; },
    enumerable: false,
    configurable: true,
  });
  return target as any;
}

export function Singleton<T extends Constructor>(target: T, context: ClassDecoratorContext<T>): SingletonReturn<T>;
export function Singleton<T extends Constructor>(target: T): SingletonReturn<T>;
export function Singleton<T extends Constructor>(target: T, _context?: any): SingletonReturn<T> {
  let instance: InstanceType<T> | null = null;
  (target as any).getInstance = function (): InstanceType<T> {
    if (instance === null) instance = new (target as any)();
    return instance!;
  };
  return target as any;
}
