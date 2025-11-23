import * as ts from 'typescript';
import { TransformationPlan } from '../transformer/context';
import {
  createMethodDeclaration,
  createReturnStatement,
  createToStringTemplateLiteral,
  createHashCodeComputation,
  createEqualityCheck,
  createNewInstance,
  capitalize
} from '../utils/ast-helpers';

/**
 * Generates the toString() method.
 *
 * Example output:
 * toString(): string {
 *   return `User(id=${this.id}, name=${this.name})`;
 * }
 */
export function generateToString(
  factory: ts.NodeFactory,
  plan: TransformationPlan
): ts.MethodDeclaration {
  const fieldNames = plan.properties.map(p => p.name);
  const templateLiteral = createToStringTemplateLiteral(factory, plan.className, fieldNames);

  const body = factory.createBlock(
    [createReturnStatement(factory, templateLiteral)],
    true
  );

  return createMethodDeclaration(
    factory,
    'toString',
    [],
    factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
    body
  );
}

/**
 * Generates the equals() method.
 *
 * Example output:
 * equals(other: User): boolean {
 *   if (other == null) return false;
 *   if (this === other) return true;
 *   if (!(other instanceof User)) return false;
 *   return this.id === other.id && this.name === other.name;
 * }
 */
export function generateEquals(
  factory: ts.NodeFactory,
  plan: TransformationPlan
): ts.MethodDeclaration {
  const otherParam = 'other';
  const fieldNames = plan.properties.map(p => p.name);

  const statements: ts.Statement[] = [
    // if (other == null) return false;
    factory.createIfStatement(
      factory.createBinaryExpression(
        factory.createIdentifier(otherParam),
        factory.createToken(ts.SyntaxKind.EqualsEqualsToken),
        factory.createNull()
      ),
      factory.createReturnStatement(factory.createFalse())
    ),

    // if (this === other) return true;
    factory.createIfStatement(
      factory.createBinaryExpression(
        factory.createThis(),
        factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
        factory.createIdentifier(otherParam)
      ),
      factory.createReturnStatement(factory.createTrue())
    ),

    // if (!(other instanceof ClassName)) return false;
    factory.createIfStatement(
      factory.createPrefixUnaryExpression(
        ts.SyntaxKind.ExclamationToken,
        factory.createParenthesizedExpression(
          factory.createBinaryExpression(
            factory.createIdentifier(otherParam),
            factory.createToken(ts.SyntaxKind.InstanceOfKeyword),
            factory.createIdentifier(plan.className)
          )
        )
      ),
      factory.createReturnStatement(factory.createFalse())
    ),

    // return this.field === other.field && ...;
    createReturnStatement(
      factory,
      createEqualityCheck(factory, fieldNames, otherParam)
    )
  ];

  const body = factory.createBlock(statements, true);

  const parameter = factory.createParameterDeclaration(
    undefined,
    undefined,
    factory.createIdentifier(otherParam),
    undefined,
    factory.createTypeReferenceNode(factory.createIdentifier(plan.className), undefined),
    undefined
  );

  return createMethodDeclaration(
    factory,
    'equals',
    [parameter],
    factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
    body
  );
}

/**
 * Generates the hashCode() method.
 *
 * Example output:
 * hashCode(): number {
 *   return ((this.id * 31) + String(this.name).length) | 0;
 * }
 */
export function generateHashCode(
  factory: ts.NodeFactory,
  plan: TransformationPlan
): ts.MethodDeclaration {
  const fieldNames = plan.properties.map(p => p.name);
  const hashExpression = createHashCodeComputation(factory, fieldNames);

  const body = factory.createBlock(
    [createReturnStatement(factory, hashExpression)],
    true
  );

  return createMethodDeclaration(
    factory,
    'hashCode',
    [],
    factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
    body
  );
}

/**
 * Generates withX() methods for each property.
 *
 * Example output for property 'name':
 * withName(name: string): User {
 *   return new User(this.id, name);
 * }
 */
export function generateWithMethods(
  factory: ts.NodeFactory,
  plan: TransformationPlan
): ts.MethodDeclaration[] {
  return plan.properties.map(prop => generateWithMethod(factory, plan, prop.name, prop.type));
}

/**
 * Generates a single withX() method.
 */
function generateWithMethod(
  factory: ts.NodeFactory,
  plan: TransformationPlan,
  propertyName: string,
  propertyType?: ts.TypeNode
): ts.MethodDeclaration {
  const methodName = `with${capitalize(propertyName)}`;

  // Constructor arguments: use this.field for all except the one being changed
  const constructorArgs = plan.properties.map(p =>
    p.name === propertyName
      ? factory.createIdentifier(propertyName)
      : factory.createPropertyAccessExpression(
          factory.createThis(),
          factory.createIdentifier(p.name)
        )
  );

  const newInstance = createNewInstance(factory, plan.className, constructorArgs);

  const body = factory.createBlock(
    [createReturnStatement(factory, newInstance)],
    true
  );

  const parameter = factory.createParameterDeclaration(
    undefined,
    undefined,
    factory.createIdentifier(propertyName),
    undefined,
    propertyType,
    undefined
  );

  return createMethodDeclaration(
    factory,
    methodName,
    [parameter],
    factory.createTypeReferenceNode(factory.createIdentifier(plan.className), undefined),
    body
  );
}

/**
 * Generates getter methods for all properties.
 *
 * Example output for property 'name':
 * getName(): string {
 *   return this.name;
 * }
 */
export function generateGetters(
  factory: ts.NodeFactory,
  plan: TransformationPlan
): ts.MethodDeclaration[] {
  return plan.properties.map(prop => {
    const methodName = `get${capitalize(prop.name)}`;

    const body = factory.createBlock(
      [factory.createReturnStatement(
        factory.createPropertyAccessExpression(
          factory.createThis(),
          factory.createIdentifier(prop.name)
        )
      )],
      true
    );

    return createMethodDeclaration(
      factory,
      methodName,
      [],
      prop.type,
      body
    );
  });
}

/**
 * Generates setter methods for all properties.
 *
 * Example output for property 'name':
 * setName(name: string): void {
 *   this.name = name;
 * }
 */
export function generateSetters(
  factory: ts.NodeFactory,
  plan: TransformationPlan
): ts.MethodDeclaration[] {
  return plan.properties
    .filter(prop => !prop.isReadonly)
    .map(prop => {
      const methodName = `set${capitalize(prop.name)}`;

      const parameter = factory.createParameterDeclaration(
        undefined,
        undefined,
        factory.createIdentifier(prop.name),
        undefined,
        prop.type,
        undefined
      );

      const body = factory.createBlock(
        [factory.createExpressionStatement(
          factory.createBinaryExpression(
            factory.createPropertyAccessExpression(
              factory.createThis(),
              factory.createIdentifier(prop.name)
            ),
            factory.createToken(ts.SyntaxKind.EqualsToken),
            factory.createIdentifier(prop.name)
          )
        )],
        true
      );

      return createMethodDeclaration(
        factory,
        methodName,
        [parameter],
        factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
        body
      );
    });
}

/**
 * Generates builder pattern implementation.
 *
 * Generates:
 * - static builder(): Builder
 * - Builder class with fluent setters and build() method
 */
export function generateBuilder(
  factory: ts.NodeFactory,
  plan: TransformationPlan
): ts.ClassElement[] {
  const members: ts.ClassElement[] = [];

  // Static builder() method
  const builderMethod = factory.createMethodDeclaration(
    [factory.createModifier(ts.SyntaxKind.StaticKeyword)],
    undefined,
    factory.createIdentifier('builder'),
    undefined,
    undefined,
    [],
    factory.createTypeReferenceNode(
      factory.createIdentifier(`${plan.className}Builder`),
      undefined
    ),
    factory.createBlock(
      [factory.createReturnStatement(
        factory.createNewExpression(
          factory.createIdentifier(`${plan.className}Builder`),
          undefined,
          []
        )
      )],
      true
    )
  );

  members.push(builderMethod);

  return members;
}

/**
 * Generates singleton pattern implementation.
 *
 * Generates:
 * - private static instance field
 * - static getInstance(): ClassName
 */
export function generateSingleton(
  factory: ts.NodeFactory,
  plan: TransformationPlan
): ts.ClassElement[] {
  const members: ts.ClassElement[] = [];

  // private static instance: ClassName | null = null;
  const instanceField = factory.createPropertyDeclaration(
    [
      factory.createModifier(ts.SyntaxKind.PrivateKeyword),
      factory.createModifier(ts.SyntaxKind.StaticKeyword)
    ],
    factory.createIdentifier('instance'),
    undefined,
    factory.createUnionTypeNode([
      factory.createTypeReferenceNode(factory.createIdentifier(plan.className), undefined),
      factory.createLiteralTypeNode(factory.createNull())
    ]),
    factory.createNull()
  );

  members.push(instanceField);

  // static getInstance(): ClassName
  const getInstanceMethod = factory.createMethodDeclaration(
    [factory.createModifier(ts.SyntaxKind.StaticKeyword)],
    undefined,
    factory.createIdentifier('getInstance'),
    undefined,
    undefined,
    [],
    factory.createTypeReferenceNode(factory.createIdentifier(plan.className), undefined),
    factory.createBlock(
      [
        // if (!ClassName.instance) { ClassName.instance = new ClassName(); }
        factory.createIfStatement(
          factory.createPrefixUnaryExpression(
            ts.SyntaxKind.ExclamationToken,
            factory.createPropertyAccessExpression(
              factory.createIdentifier(plan.className),
              factory.createIdentifier('instance')
            )
          ),
          factory.createBlock([
            factory.createExpressionStatement(
              factory.createBinaryExpression(
                factory.createPropertyAccessExpression(
                  factory.createIdentifier(plan.className),
                  factory.createIdentifier('instance')
                ),
                factory.createToken(ts.SyntaxKind.EqualsToken),
                factory.createNewExpression(
                  factory.createIdentifier(plan.className),
                  undefined,
                  []
                )
              )
            )
          ], true)
        ),
        // return ClassName.instance;
        factory.createReturnStatement(
          factory.createPropertyAccessExpression(
            factory.createIdentifier(plan.className),
            factory.createIdentifier('instance')
          )
        )
      ],
      true
    )
  );

  members.push(getInstanceMethod);

  return members;
}

/**
 * Generates a logger field.
 *
 * Generates:
 * protected readonly log = console;
 */
export function generateLog(
  factory: ts.NodeFactory,
  _plan: TransformationPlan
): ts.ClassElement[] {
  const logField = factory.createPropertyDeclaration(
    [
      factory.createModifier(ts.SyntaxKind.ProtectedKeyword),
      factory.createModifier(ts.SyntaxKind.ReadonlyKeyword)
    ],
    factory.createIdentifier('log'),
    undefined,
    undefined,
    factory.createIdentifier('console')
  );

  return [logField];
}

/**
 * Generates null validation statements for @NonNull properties.
 */
export function generateNonNullValidation(
  factory: ts.NodeFactory,
  propertyName: string
): ts.Statement {
  // if (propertyName == null) { throw new Error('propertyName cannot be null or undefined'); }
  return factory.createIfStatement(
    factory.createBinaryExpression(
      factory.createIdentifier(propertyName),
      factory.createToken(ts.SyntaxKind.EqualsEqualsToken),
      factory.createNull()
    ),
    factory.createBlock([
      factory.createThrowStatement(
        factory.createNewExpression(
          factory.createIdentifier('Error'),
          undefined,
          [factory.createStringLiteral(`${propertyName} cannot be null or undefined`)]
        )
      )
    ], true)
  );
}
