import * as ts from 'typescript';
import { createFreezeStatement } from '../utils/ast-helpers';

/**
 * Generates the Object.freeze(this) statement.
 */
export function generateFreezeStatement(factory: ts.NodeFactory): ts.Statement {
  return createFreezeStatement(factory);
}
