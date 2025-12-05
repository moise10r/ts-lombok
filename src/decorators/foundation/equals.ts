/**
 * @Equals decorator handler module.
 *
 * The @Equals decorator generates value-based equality methods:
 * - equals(other: T): boolean - Value-based equality comparison
 * - hashCode(): number - Hash code based on field values
 *
 * Example:
 * ```typescript
 * @Equals
 * class Point {
 *   x: number;
 *   y: number;
 * }
 *
 * const p1 = new Point();
 * p1.x = 1;
 * p1.y = 2;
 *
 * const p2 = new Point();
 * p2.x = 1;
 * p2.y = 2;
 *
 * p1.equals(p2); // true
 * p1.hashCode() === p2.hashCode(); // true
 * ```
 */

export { EqualsHandler } from '../../handlers/index';
