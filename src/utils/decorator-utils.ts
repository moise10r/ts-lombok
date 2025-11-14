import * as ts from 'typescript';

/**
 * Decorator-related utility functions.
 */

/**
 * Known class decorator names that this transformer handles.
 */
export const KNOWN_CLASS_DECORATORS = [
  'Record', 'Value', 'Equals', 'With',
  'Getter', 'Setter', 'ToString', 'Data', 'Builder',
  'NoArgsConstructor', 'AllArgsConstructor', 'RequiredArgsConstructor',
  'Log', 'Singleton'
] as const;

/**
 * Known property decorator names.
 */
export const KNOWN_PROPERTY_DECORATORS = ['NonNull', 'Getter', 'Setter'] as const;

/**
 * Known method decorator names.
 */
export const KNOWN_METHOD_DECORATORS = ['Memoize', 'Autobind'] as const;

/**
 * All known decorators combined.
 */
export const KNOWN_DECORATORS = [
  ...KNOWN_CLASS_DECORATORS,
  ...KNOWN_PROPERTY_DECORATORS,
  ...KNOWN_METHOD_DECORATORS
] as const;

export type KnownClassDecorator = typeof KNOWN_CLASS_DECORATORS[number];
export type KnownPropertyDecorator = typeof KNOWN_PROPERTY_DECORATORS[number];
export type KnownMethodDecorator = typeof KNOWN_METHOD_DECORATORS[number];
export type KnownDecorator = typeof KNOWN_DECORATORS[number];

/**
 * Checks if a node has a specific decorator.
 */
export function hasDecorator(node: ts.Node, decoratorName: string): boolean {
  const decorators = getDecorators(node);
  return decorators.some(d => getDecoratorName(d) === decoratorName);
}

/**
 * Gets all decorators from a node.
 */
export function getDecorators(node: ts.Node): readonly ts.Decorator[] {
  if (!ts.canHaveDecorators(node)) {
    return [];
  }
  return ts.getDecorators(node) || [];
}

/**
 * Gets the name of a decorator.
 */
export function getDecoratorName(decorator: ts.Decorator): string | undefined {
  const expression = decorator.expression;

  if (ts.isIdentifier(expression)) {
    return expression.text;
  }

  if (ts.isCallExpression(expression) && ts.isIdentifier(expression.expression)) {
    return expression.expression.text;
  }

  return undefined;
}

/**
 * Checks if a decorator is one of the known class decorators.
 */
export function isKnownDecorator(decorator: ts.Decorator): boolean {
  const name = getDecoratorName(decorator);
  return name !== undefined && KNOWN_CLASS_DECORATORS.includes(name as KnownClassDecorator);
}

/**
 * Checks if a decorator is a known property decorator.
 */
export function isKnownPropertyDecorator(decorator: ts.Decorator): boolean {
  const name = getDecoratorName(decorator);
  return name !== undefined && KNOWN_PROPERTY_DECORATORS.includes(name as KnownPropertyDecorator);
}

/**
 * Gets all known decorators from a class declaration.
 */
export function getKnownDecorators(node: ts.ClassDeclaration): KnownClassDecorator[] {
  const decorators = getDecorators(node);
  return decorators
    .map(d => getDecoratorName(d))
    .filter((name): name is KnownClassDecorator =>
      name !== undefined && KNOWN_CLASS_DECORATORS.includes(name as KnownClassDecorator)
    );
}

/**
 * Removes known decorators from a class, keeping unknown ones.
 */
export function removeKnownDecorators(
  factory: ts.NodeFactory,
  node: ts.ClassDeclaration
): ts.ModifierLike[] | undefined {
  const decorators = getDecorators(node);
  const modifiers = ts.getModifiers(node) || [];

  const remainingDecorators = decorators.filter(d => !isKnownDecorator(d));

  if (remainingDecorators.length === 0 && modifiers.length === 0) {
    return undefined;
  }

  return [...remainingDecorators, ...modifiers];
}

/**
 * Information about a class property.
 */
export interface PropertyInfo {
  name: string;
  type: ts.TypeNode | undefined;
  isOptional: boolean;
  isReadonly: boolean;
  hasInitializer: boolean;
  isPrivate: boolean;
  isNonNull: boolean;
  hasGetter: boolean;
  hasSetter: boolean;
  modifiers: ts.ModifierLike[];
  decorators: string[];
}

/**
 * Extracts property information from a class declaration.
 */
export function getClassProperties(node: ts.ClassDeclaration): PropertyInfo[] {
  const properties: PropertyInfo[] = [];

  for (const member of node.members) {
    if (ts.isPropertyDeclaration(member) && ts.isIdentifier(member.name)) {
      const modifiers = ts.getModifiers(member) || [];
      const propertyDecorators = ts.getDecorators(member) || [];
      const isStatic = modifiers.some(m => m.kind === ts.SyntaxKind.StaticKeyword);

      // Skip static properties
      if (isStatic) {
        continue;
      }

      const decoratorNames = propertyDecorators
        .map(d => getDecoratorName(d))
        .filter((name): name is string => name !== undefined);

      properties.push({
        name: member.name.text,
        type: member.type,
        isOptional: member.questionToken !== undefined,
        isReadonly: modifiers.some(m => m.kind === ts.SyntaxKind.ReadonlyKeyword),
        hasInitializer: member.initializer !== undefined,
        isPrivate: modifiers.some(m => m.kind === ts.SyntaxKind.PrivateKeyword),
        isNonNull: decoratorNames.includes('NonNull'),
        hasGetter: decoratorNames.includes('Getter'),
        hasSetter: decoratorNames.includes('Setter'),
        modifiers: [...propertyDecorators, ...modifiers],
        decorators: decoratorNames
      });
    }
  }

  return properties;
}

/**
 * Gets only required properties (not optional, no initializer).
 */
export function getRequiredProperties(properties: PropertyInfo[]): PropertyInfo[] {
  return properties.filter(p => !p.isOptional && !p.hasInitializer);
}

/**
 * Gets properties marked with @NonNull.
 */
export function getNonNullProperties(properties: PropertyInfo[]): PropertyInfo[] {
  return properties.filter(p => p.isNonNull);
}

/**
 * Checks if a class has an existing constructor.
 */
export function hasConstructor(node: ts.ClassDeclaration): boolean {
  return node.members.some(m => ts.isConstructorDeclaration(m));
}

/**
 * Gets the existing constructor from a class if it exists.
 */
export function getConstructor(
  node: ts.ClassDeclaration
): ts.ConstructorDeclaration | undefined {
  return node.members.find(
    (m): m is ts.ConstructorDeclaration => ts.isConstructorDeclaration(m)
  );
}

/**
 * Checks if a class has an existing method with a given name.
 */
export function hasMethod(node: ts.ClassDeclaration, methodName: string): boolean {
  return node.members.some(
    m =>
      ts.isMethodDeclaration(m) &&
      ts.isIdentifier(m.name) &&
      m.name.text === methodName
  );
}
