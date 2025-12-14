/**
 * @Record decorator handler module.
 *
 * The @Record decorator transforms a class into an immutable data carrier:
 * - Generates a constructor with all fields as parameters
 * - Makes all properties readonly
 * - Calls Object.freeze(this) in the constructor
 * - Generates a toString() method
 *
 * Example:
 * ```typescript
 * @Record
 * class User {
 *   id: number;
 *   name: string;
 * }
 * ```
 *
 * Transforms to:
 * ```javascript
 * class User {
 *   constructor(id, name) {
 *     this.id = id;
 *     this.name = name;
 *     Object.freeze(this);
 *   }
 *   toString() {
 *     return `User(id=${this.id}, name=${this.name})`;
 *   }
 * }
 * ```
 */

export { RecordHandler } from '../../handlers/index';
