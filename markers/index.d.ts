type Constructor<T = object> = new (...args: any[]) => T;
type Capitalize<S extends string> = S extends `${infer F}${infer R}` ? `${Uppercase<F>}${R}` : S;
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
    [K in keyof Fields<T> as K extends string ? `with${Capitalize<K>}` : never]: (value: Fields<T>[K]) => WithSelf<T>;
};
interface EqualsMixin<T> {
    equals(other: T | null | undefined): boolean;
    hashCode(): number;
}
type FluentBuilder<T> = {
    build(): T;
} & {
    [K in keyof Fields<T>]: (value: Fields<T>[K]) => FluentBuilder<T>;
};
type RecordReturn<T extends Constructor> = {
    new (...args: any[]): InstanceType<T> & {
        toString(): string;
    };
} & T;
type EqualsReturn<T extends Constructor> = {
    new (...args: any[]): InstanceType<T> & EqualsMixin<InstanceType<T>>;
} & T;
type WithReturn<T extends Constructor> = {
    new (...args: any[]): WithSelf<InstanceType<T>>;
} & T;
type GetterReturn<T extends Constructor> = {
    new (...args: any[]): InstanceType<T> & GetterMethods<InstanceType<T>>;
} & T;
type SetterReturn<T extends Constructor> = {
    new (...args: any[]): InstanceType<T> & SetterMethods<InstanceType<T>>;
} & T;
type ToStringReturn<T extends Constructor> = {
    new (...args: any[]): InstanceType<T> & {
        toString(): string;
    };
} & T;
type DataReturn<T extends Constructor> = {
    new (...args: any[]): InstanceType<T> & {
        toString(): string;
    } & EqualsMixin<InstanceType<T>> & GetterMethods<InstanceType<T>> & SetterMethods<InstanceType<T>>;
} & T;
type BuilderReturn<T extends Constructor> = T & {
    builder(): FluentBuilder<InstanceType<T>>;
};
type LogReturn<T extends Constructor> = {
    new (...args: any[]): InstanceType<T> & {
        readonly log: Console;
    };
} & T;
type SingletonReturn<T extends Constructor> = T & {
    getInstance(): InstanceType<T>;
};
type NoArgsReturn<T extends Constructor> = {
    new (): InstanceType<T>;
} & T;
type AllArgsReturn<T extends Constructor> = {
    new (...args: any[]): InstanceType<T>;
} & T;
export declare function Record<T extends Constructor>(target: T, context: ClassDecoratorContext<T>): RecordReturn<T>;
export declare function Record<T extends Constructor>(target: T): RecordReturn<T>;
export declare const Value: typeof Record;
export declare function Equals<T extends Constructor>(target: T, context: ClassDecoratorContext<T>): EqualsReturn<T>;
export declare function Equals<T extends Constructor>(target: T): EqualsReturn<T>;
export declare function With<T extends Constructor>(target: T, context: ClassDecoratorContext<T>): WithReturn<T>;
export declare function With<T extends Constructor>(target: T): WithReturn<T>;
export declare function Getter<T extends Constructor>(target: T, context: ClassDecoratorContext<T>): GetterReturn<T>;
export declare function Getter<T extends Constructor>(target: T): GetterReturn<T>;
export declare function Getter(target: any, propertyKey: string): void;
export declare function Setter<T extends Constructor>(target: T, context: ClassDecoratorContext<T>): SetterReturn<T>;
export declare function Setter<T extends Constructor>(target: T): SetterReturn<T>;
export declare function Setter(target: any, propertyKey: string): void;
export declare function ToString<T extends Constructor>(target: T, context: ClassDecoratorContext<T>): ToStringReturn<T>;
export declare function ToString<T extends Constructor>(target: T): ToStringReturn<T>;
export declare function Data<T extends Constructor>(target: T, context: ClassDecoratorContext<T>): DataReturn<T>;
export declare function Data<T extends Constructor>(target: T): DataReturn<T>;
export declare function Builder<T extends Constructor>(target: T, context: ClassDecoratorContext<T>): BuilderReturn<T>;
export declare function Builder<T extends Constructor>(target: T): BuilderReturn<T>;
export declare function NoArgsConstructor<T extends Constructor>(target: T, context: ClassDecoratorContext<T>): NoArgsReturn<T>;
export declare function NoArgsConstructor<T extends Constructor>(target: T): NoArgsReturn<T>;
export declare function AllArgsConstructor<T extends Constructor>(target: T, context: ClassDecoratorContext<T>): AllArgsReturn<T>;
export declare function AllArgsConstructor<T extends Constructor>(target: T): AllArgsReturn<T>;
export declare function RequiredArgsConstructor<T extends Constructor>(target: T, context: ClassDecoratorContext<T>): AllArgsReturn<T>;
export declare function RequiredArgsConstructor<T extends Constructor>(target: T): AllArgsReturn<T>;
export declare function NonNull<This, Value>(target: undefined, context: ClassFieldDecoratorContext<This, Value>): void;
export declare function NonNull(target: any, propertyKey: string): void;
export declare function validateNonNull(instance: any, props: string[]): void;
export declare function Log<T extends Constructor>(target: T, context: ClassDecoratorContext<T>): LogReturn<T>;
export declare function Log<T extends Constructor>(target: T): LogReturn<T>;
export declare function Singleton<T extends Constructor>(target: T, context: ClassDecoratorContext<T>): SingletonReturn<T>;
export declare function Singleton<T extends Constructor>(target: T): SingletonReturn<T>;
export {};
