/**
 * ts-lombok-kit - Runtime decorator implementations with full type safety
 *
 * These decorators work both with and without the compile-time transformer:
 * - With transformer: Code is generated at compile time (zero runtime cost)
 * - Without transformer: Runtime implementation provides the same functionality
 *
 * This ensures full TypeScript type safety with default tsconfig settings.
 */
type Constructor<T = {}> = new (...args: any[]) => T;
type Capitalize<S extends string> = S extends `${infer F}${infer R}` ? `${Uppercase<F>}${R}` : S;
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
type WithSelf<Base, Props> = Base & {
    [K in keyof Props as K extends string ? `with${Capitalize<K>}` : never]: (value: Props[K]) => WithSelf<Base, Props>;
};
interface SingletonStatic<T> {
    getInstance(): T;
}
type FluentBuilder<T, Props> = {
    build(): T;
} & {
    [K in keyof Props]: (value: Props[K]) => FluentBuilder<T, Props>;
};
interface BuilderStatic<T, Props> {
    builder(): FluentBuilder<T, Props>;
}
type RecordClass<T extends Constructor, Props> = Constructor<InstanceType<T> & ToStringMixin> & {
    new (...args: Props[keyof Props][]): InstanceType<T> & ToStringMixin;
};
export declare function Record<T extends Constructor>(target: T): RecordClass<T, InstanceType<T>>;
export declare const Value: typeof Record;
type EqualsClass<T extends Constructor> = Constructor<InstanceType<T> & EqualsMixin<InstanceType<T>>> & {
    new (...args: ConstructorParameters<T>): InstanceType<T> & EqualsMixin<InstanceType<T>>;
};
export declare function Equals<T extends Constructor>(target: T): EqualsClass<T>;
type WithClass<T extends Constructor, Props> = Constructor<WithSelf<InstanceType<T>, Props>> & {
    new (...args: ConstructorParameters<T>): WithSelf<InstanceType<T>, Props>;
};
export declare function With<T extends Constructor>(target: T): WithClass<T, InstanceType<T>>;
type GetterClass<T extends Constructor, Props> = Constructor<InstanceType<T> & GetterMethods<Props>> & {
    new (...args: ConstructorParameters<T>): InstanceType<T> & GetterMethods<Props>;
};
export declare function Getter<T extends Constructor>(target: T): GetterClass<T, InstanceType<T>>;
export declare function Getter(target: any, propertyKey: string): void;
type SetterClass<T extends Constructor, Props> = Constructor<InstanceType<T> & SetterMethods<Props>> & {
    new (...args: ConstructorParameters<T>): InstanceType<T> & SetterMethods<Props>;
};
export declare function Setter<T extends Constructor>(target: T): SetterClass<T, InstanceType<T>>;
export declare function Setter(target: any, propertyKey: string): void;
type ToStringClass<T extends Constructor> = Constructor<InstanceType<T> & ToStringMixin> & {
    new (...args: ConstructorParameters<T>): InstanceType<T> & ToStringMixin;
};
export declare function ToString<T extends Constructor>(target: T): ToStringClass<T>;
type DataClass<T extends Constructor, Props> = Constructor<InstanceType<T> & ToStringMixin & EqualsMixin<InstanceType<T>> & GetterMethods<Props> & SetterMethods<Props>> & {
    new (...args: Props[keyof Props][]): InstanceType<T> & ToStringMixin & EqualsMixin<InstanceType<T>> & GetterMethods<Props> & SetterMethods<Props>;
};
export declare function Data<T extends Constructor>(target: T): DataClass<T, InstanceType<T>>;
type BuilderClass<T extends Constructor, Props> = T & BuilderStatic<InstanceType<T>, Props> & {
    new (...args: Props[keyof Props][]): InstanceType<T>;
};
export declare function Builder<T extends Constructor>(target: T): BuilderClass<T, InstanceType<T>>;
type NoArgsClass<T extends Constructor> = Constructor<InstanceType<T>> & {
    new (): InstanceType<T>;
};
export declare function NoArgsConstructor<T extends Constructor>(target: T): NoArgsClass<T>;
type AllArgsClass<T extends Constructor, Props> = Constructor<InstanceType<T>> & {
    new (...args: Props[keyof Props][]): InstanceType<T>;
};
export declare function AllArgsConstructor<T extends Constructor>(target: T): AllArgsClass<T, InstanceType<T>>;
export declare function RequiredArgsConstructor<T extends Constructor>(target: T): AllArgsClass<T, InstanceType<T>>;
export declare function NonNull(target: any, propertyKey: string): void;
export declare function validateNonNull(instance: any, props: string[]): void;
type LogClass<T extends Constructor> = Constructor<InstanceType<T> & LogMixin> & {
    new (...args: ConstructorParameters<T>): InstanceType<T> & LogMixin;
};
export declare function Log<T extends Constructor>(target: T): LogClass<T>;
type SingletonClass<T extends Constructor> = T & SingletonStatic<InstanceType<T>>;
export declare function Singleton<T extends Constructor>(target: T): SingletonClass<T>;
export {};
