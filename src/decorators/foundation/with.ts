/**
 * @With decorator handler module.
 *
 * The @With decorator generates withX() methods for each field,
 * enabling immutable updates that return new instances.
 *
 * Example:
 * ```typescript
 * @With
 * class User {
 *   id: number;
 *   name: string;
 * }
 *
 * const user = new User();
 * user.id = 1;
 * user.name = 'John';
 *
 * const updated = user.withName('Jane');
 * // Returns new User instance with name='Jane', keeping id=1
 * ```
 */

export { WithHandler } from '../../handlers/index';
