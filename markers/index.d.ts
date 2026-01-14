/**
 * Type declarations for ts-lombok marker decorators.
 */

/** @Record decorator - Creates an immutable data carrier class. */
export declare function Record<T extends { new (...args: any[]): {} }>(target: T): T;

/** @Value decorator - Alias for @Record. */
export declare function Value<T extends { new (...args: any[]): {} }>(target: T): T;

/** @Equals decorator - Generates value-based equality methods. */
export declare function Equals<T extends { new (...args: any[]): {} }>(target: T): T;

/** @With decorator - Generates withX() methods for each field. */
export declare function With<T extends { new (...args: any[]): {} }>(target: T): T;

/** @Getter decorator - Generates getter methods. */
export declare function Getter<T extends { new (...args: any[]): {} }>(target: T): T;
export declare function Getter(target: any, propertyKey: string): void;

/** @Setter decorator - Generates setter methods. */
export declare function Setter<T extends { new (...args: any[]): {} }>(target: T): T;
export declare function Setter(target: any, propertyKey: string): void;

/** @ToString decorator - Generates toString() method. */
export declare function ToString<T extends { new (...args: any[]): {} }>(target: T): T;

/** @Data decorator - Combines @Getter @Setter @ToString @Equals @AllArgsConstructor. */
export declare function Data<T extends { new (...args: any[]): {} }>(target: T): T;

/** @Builder decorator - Implements the builder pattern. */
export declare function Builder<T extends { new (...args: any[]): {} }>(target: T): T;

/** @NoArgsConstructor decorator - Generates empty constructor. */
export declare function NoArgsConstructor<T extends { new (...args: any[]): {} }>(target: T): T;

/** @AllArgsConstructor decorator - Generates constructor with all fields. */
export declare function AllArgsConstructor<T extends { new (...args: any[]): {} }>(target: T): T;

/** @RequiredArgsConstructor decorator - Generates constructor with required fields. */
export declare function RequiredArgsConstructor<T extends { new (...args: any[]): {} }>(target: T): T;

/** @NonNull decorator - Validates field is not null/undefined. */
export declare function NonNull(target: any, propertyKey: string): void;

/** @Log decorator - Generates a logger field. */
export declare function Log<T extends { new (...args: any[]): {} }>(target: T): T;

/** @Singleton decorator - Ensures only one instance exists. */
export declare function Singleton<T extends { new (...args: any[]): {} }>(target: T): T;

/** @Memoize decorator - Caches method results. */
export declare function Memoize(target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor;

/** @Autobind decorator - Binds method to instance. */
export declare function Autobind(target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor;
