/**
 * ts-lombok - TypeScript library providing Lombok-style decorators via compile-time AST transformers.
 *
 * This is the main entry point for the ts-patch plugin.
 *
 * Usage in tsconfig.json:
 * ```json
 * {
 *   "compilerOptions": {
 *     "plugins": [
 *       { "transform": "ts-lombok" }
 *     ]
 *   }
 * }
 * ```
 *
 * Available decorators (import from 'ts-lombok/markers'):
 * - @Record - Immutable data carrier with constructor, readonly, freeze, toString
 * - @Value - Alias for @Record
 * - @Equals - Value-based equality (equals, hashCode)
 * - @With - Immutable update methods (withX)
 */

export {
  createTransformer,
  transform,
  TransformerConfig
} from './transformer/transformer-factory';

// Export default for ts-patch plugin entry
export { default } from './transformer/transformer-factory';

// Re-export types for consumers
export { TransformationPlan, TransformationContext } from './transformer/context';
export { DecoratorHandler, BaseHandler } from './handlers/base-handler';
export { HandlerRegistry, handlerRegistry } from './handlers/index';
