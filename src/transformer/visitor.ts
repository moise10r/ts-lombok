import * as ts from 'typescript';
import { TransformationContext, TransformationPlan } from './context';
import { handlerRegistry } from '../handlers/index';
import {
  getKnownDecorators,
  getClassProperties,
  removeKnownDecorators,
  hasConstructor,
  hasMethod,
  getDecoratorName,
  KNOWN_PROPERTY_DECORATORS
} from '../utils/decorator-utils';
import { generateConstructor } from '../generators/constructor-generator';
import { generateFreezeStatement } from '../generators/freeze-generator';

/**
 * Creates a visitor function that transforms class declarations.
 */
export function createVisitor(
  context: TransformationContext,
  tsContext: ts.TransformationContext
): ts.Visitor {
  const factory = tsContext.factory;

  const visitor: ts.Visitor = (node: ts.Node): ts.Node => {
    // Process class declarations
    if (ts.isClassDeclaration(node)) {
      const transformed = transformClass(factory, context, node);
      if (transformed) {
        return transformed;
      }
    }

    // Recursively visit children
    return ts.visitEachChild(node, visitor, tsContext);
  };

  return visitor;
}

/**
 * Transforms a class declaration if it has relevant decorators.
 */
function transformClass(
  factory: ts.NodeFactory,
  context: TransformationContext,
  node: ts.ClassDeclaration
): ts.ClassDeclaration | undefined {
  // Get decorators we handle
  const decorators = getKnownDecorators(node);

  // Get class properties
  const properties = getClassProperties(node);

  // Check if we have any property decorators to process
  const hasPropertyDecorators = properties.some(p => p.decorators.length > 0);

  if (decorators.length === 0 && !hasPropertyDecorators) {
    return undefined; // No transformation needed
  }

  // Create transformation plan
  const plan = context.createPlan(node, properties, decorators);

  // Get handlers and let them modify the plan
  const handlers = handlerRegistry.getHandlersForDecorators(decorators);
  for (const handler of handlers) {
    handler.modifyPlan(plan);
  }

  // Execute the transformation
  return executeTransformation(factory, plan, handlers, node);
}

/**
 * Executes the transformation based on the plan.
 */
function executeTransformation(
  factory: ts.NodeFactory,
  plan: TransformationPlan,
  handlers: ReturnType<typeof handlerRegistry.getHandlersForDecorators>,
  originalClass: ts.ClassDeclaration
): ts.ClassDeclaration {
  const newMembers: ts.ClassElement[] = [];

  // Transform existing properties to readonly if needed and strip property decorators
  for (const member of originalClass.members) {
    if (ts.isPropertyDeclaration(member)) {
      let transformed = stripPropertyDecorators(factory, member);
      if (plan.makeReadonly) {
        transformed = makePropertyReadonly(factory, transformed);
      }
      newMembers.push(transformed);
    } else if (ts.isConstructorDeclaration(member)) {
      // Skip existing constructor if we're generating one
      if (!plan.generateConstructor) {
        newMembers.push(member);
      }
    } else if (ts.isMethodDeclaration(member)) {
      // Keep existing methods (they take precedence over generated ones)
      newMembers.push(member);
    } else {
      newMembers.push(member);
    }
  }

  // Generate constructor if needed
  if (plan.generateConstructor && !hasConstructor(originalClass)) {
    const additionalStatements: ts.Statement[] = [];

    if (plan.freezeInstance) {
      additionalStatements.push(generateFreezeStatement(factory));
    }

    const constructor = generateConstructor(factory, plan, additionalStatements);
    newMembers.unshift(constructor);
  }

  // Let handlers generate their members
  for (const handler of handlers) {
    const generated = handler.generateMembers(factory, plan);
    for (const member of generated) {
      // Only add if no existing method with same name
      if (ts.isMethodDeclaration(member) && ts.isIdentifier(member.name)) {
        if (!hasMethod(originalClass, member.name.text)) {
          newMembers.push(member);
        }
      } else {
        newMembers.push(member);
      }
    }
  }

  // Remove our decorators, keep others
  const modifiers = removeKnownDecorators(factory, originalClass);

  // Create new class declaration
  return factory.updateClassDeclaration(
    originalClass,
    modifiers,
    originalClass.name,
    originalClass.typeParameters,
    originalClass.heritageClauses,
    newMembers
  );
}

/**
 * Strips known property decorators (like @NonNull) from a property.
 */
function stripPropertyDecorators(
  factory: ts.NodeFactory,
  property: ts.PropertyDeclaration
): ts.PropertyDeclaration {
  const existingModifiers = ts.getModifiers(property) || [];
  const existingDecorators = ts.getDecorators(property) || [];

  // Filter out known property decorators
  const remainingDecorators = existingDecorators.filter(d => {
    const name = getDecoratorName(d);
    return !name || !KNOWN_PROPERTY_DECORATORS.includes(name as any);
  });

  // If no decorators were removed, return original
  if (remainingDecorators.length === existingDecorators.length) {
    return property;
  }

  const newModifiers: ts.ModifierLike[] = [
    ...remainingDecorators,
    ...existingModifiers
  ];

  return factory.updatePropertyDeclaration(
    property,
    newModifiers.length > 0 ? newModifiers : undefined,
    property.name,
    property.questionToken,
    property.type,
    property.initializer
  );
}

/**
 * Makes a property declaration readonly.
 */
function makePropertyReadonly(
  factory: ts.NodeFactory,
  property: ts.PropertyDeclaration
): ts.PropertyDeclaration {
  const existingModifiers = ts.getModifiers(property) || [];
  const existingDecorators = ts.getDecorators(property) || [];

  // Check if already readonly
  const hasReadonly = existingModifiers.some(
    m => m.kind === ts.SyntaxKind.ReadonlyKeyword
  );

  if (hasReadonly) {
    return property;
  }

  // Add readonly modifier
  const newModifiers: ts.ModifierLike[] = [
    ...existingDecorators,
    factory.createModifier(ts.SyntaxKind.ReadonlyKeyword),
    ...existingModifiers
  ];

  return factory.updatePropertyDeclaration(
    property,
    newModifiers,
    property.name,
    property.questionToken,
    property.type,
    property.initializer
  );
}
