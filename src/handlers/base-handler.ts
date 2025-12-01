import * as ts from 'typescript';
import { TransformationPlan } from '../transformer/context';

/**
 * Base interface for decorator handlers.
 */
export interface DecoratorHandler {
  /** The decorator name this handler processes */
  readonly decoratorName: string;

  /** Priority for execution order (higher = earlier) */
  readonly priority: number;

  /** Modifies the transformation plan */
  modifyPlan(plan: TransformationPlan): void;

  /** Generates additional class members */
  generateMembers(
    factory: ts.NodeFactory,
    plan: TransformationPlan
  ): ts.ClassElement[];
}

/**
 * Abstract base class for decorator handlers.
 */
export abstract class BaseHandler implements DecoratorHandler {
  abstract readonly decoratorName: string;
  abstract readonly priority: number;

  abstract modifyPlan(plan: TransformationPlan): void;

  generateMembers(
    _factory: ts.NodeFactory,
    _plan: TransformationPlan
  ): ts.ClassElement[] {
    return [];
  }
}
