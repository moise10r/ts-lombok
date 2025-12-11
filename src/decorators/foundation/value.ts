/**
 * @Value decorator handler module.
 *
 * The @Value decorator is an alias for @Record.
 * It creates an immutable value class with readonly fields and freeze.
 *
 * Example:
 * ```typescript
 * @Value
 * class Point {
 *   x: number;
 *   y: number;
 * }
 * ```
 */

export { ValueHandler } from '../../handlers/index';
