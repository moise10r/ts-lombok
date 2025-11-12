import * as ts from 'typescript';

/**
 * AST helper utilities for creating TypeScript nodes.
 */

/**
 * Creates a constructor parameter from a property name and type.
 */
export function createConstructorParameter(
  factory: ts.NodeFactory,
  name: string,
  type?: ts.TypeNode
): ts.ParameterDeclaration {
  return factory.createParameterDeclaration(
    undefined,
    undefined,
    factory.createIdentifier(name),
    undefined,
    type,
    undefined
  );
}

/**
 * Creates a property assignment statement: this.name = name;
 */
export function createPropertyAssignment(
  factory: ts.NodeFactory,
  propertyName: string
): ts.ExpressionStatement {
  return factory.createExpressionStatement(
    factory.createBinaryExpression(
      factory.createPropertyAccessExpression(
        factory.createThis(),
        factory.createIdentifier(propertyName)
      ),
      factory.createToken(ts.SyntaxKind.EqualsToken),
      factory.createIdentifier(propertyName)
    )
  );
}

/**
 * Creates Object.freeze(this) statement.
 */
export function createFreezeStatement(factory: ts.NodeFactory): ts.ExpressionStatement {
  return factory.createExpressionStatement(
    factory.createCallExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier('Object'),
        factory.createIdentifier('freeze')
      ),
      undefined,
      [factory.createThis()]
    )
  );
}

/**
 * Creates a readonly property declaration.
 */
export function createReadonlyProperty(
  factory: ts.NodeFactory,
  name: string,
  type?: ts.TypeNode,
  modifiers?: ts.Modifier[]
): ts.PropertyDeclaration {
  const allModifiers = [
    factory.createModifier(ts.SyntaxKind.ReadonlyKeyword),
    ...(modifiers || [])
  ];

  return factory.createPropertyDeclaration(
    allModifiers,
    factory.createIdentifier(name),
    undefined,
    type,
    undefined
  );
}

/**
 * Creates a method declaration.
 */
export function createMethodDeclaration(
  factory: ts.NodeFactory,
  name: string,
  parameters: ts.ParameterDeclaration[],
  returnType: ts.TypeNode | undefined,
  body: ts.Block,
  modifiers?: ts.Modifier[]
): ts.MethodDeclaration {
  return factory.createMethodDeclaration(
    modifiers,
    undefined,
    factory.createIdentifier(name),
    undefined,
    undefined,
    parameters,
    returnType,
    body
  );
}

/**
 * Creates a return statement.
 */
export function createReturnStatement(
  factory: ts.NodeFactory,
  expression: ts.Expression
): ts.ReturnStatement {
  return factory.createReturnStatement(expression);
}

/**
 * Creates a template literal for toString().
 * Format: ClassName(field1=${this.field1}, field2=${this.field2})
 */
export function createToStringTemplateLiteral(
  factory: ts.NodeFactory,
  className: string,
  fieldNames: string[]
): ts.TemplateLiteral {
  if (fieldNames.length === 0) {
    return factory.createNoSubstitutionTemplateLiteral(`${className}()`);
  }

  const spans: ts.TemplateSpan[] = [];

  fieldNames.forEach((fieldName, index) => {
    const isLast = index === fieldNames.length - 1;
    const suffix = isLast ? ')' : ', ';
    const nextFieldPrefix = isLast ? '' : `${fieldNames[index + 1]}=`;

    spans.push(
      factory.createTemplateSpan(
        factory.createPropertyAccessExpression(
          factory.createThis(),
          factory.createIdentifier(fieldName)
        ),
        isLast
          ? factory.createTemplateTail(suffix)
          : factory.createTemplateMiddle(`${suffix}${nextFieldPrefix}`)
      )
    );
  });

  return factory.createTemplateExpression(
    factory.createTemplateHead(`${className}(${fieldNames[0]}=`),
    spans
  );
}

/**
 * Creates a simple hash code computation for a field.
 */
export function createHashCodeComputation(
  factory: ts.NodeFactory,
  fieldNames: string[]
): ts.Expression {
  if (fieldNames.length === 0) {
    return factory.createNumericLiteral(0);
  }

  // Simple hash: ((field1 * 31) + field2) * 31 + field3 ...
  let result: ts.Expression = createFieldHashExpression(factory, fieldNames[0]);

  for (let i = 1; i < fieldNames.length; i++) {
    result = factory.createBinaryExpression(
      factory.createBinaryExpression(
        result,
        factory.createToken(ts.SyntaxKind.AsteriskToken),
        factory.createNumericLiteral(31)
      ),
      factory.createToken(ts.SyntaxKind.PlusToken),
      createFieldHashExpression(factory, fieldNames[i])
    );
  }

  // Ensure integer result with bitwise OR 0
  return factory.createBinaryExpression(
    result,
    factory.createToken(ts.SyntaxKind.BarToken),
    factory.createNumericLiteral(0)
  );
}

/**
 * Creates a hash expression for a single field.
 */
function createFieldHashExpression(
  factory: ts.NodeFactory,
  fieldName: string
): ts.Expression {
  // (this.field == null ? 0 : typeof this.field === 'number' ? this.field : String(this.field).length)
  const fieldAccess = factory.createPropertyAccessExpression(
    factory.createThis(),
    factory.createIdentifier(fieldName)
  );

  return factory.createConditionalExpression(
    factory.createBinaryExpression(
      fieldAccess,
      factory.createToken(ts.SyntaxKind.EqualsEqualsToken),
      factory.createNull()
    ),
    factory.createToken(ts.SyntaxKind.QuestionToken),
    factory.createNumericLiteral(0),
    factory.createToken(ts.SyntaxKind.ColonToken),
    factory.createConditionalExpression(
      factory.createBinaryExpression(
        factory.createTypeOfExpression(fieldAccess),
        factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
        factory.createStringLiteral('number')
      ),
      factory.createToken(ts.SyntaxKind.QuestionToken),
      fieldAccess,
      factory.createToken(ts.SyntaxKind.ColonToken),
      factory.createPropertyAccessExpression(
        factory.createCallExpression(
          factory.createIdentifier('String'),
          undefined,
          [fieldAccess]
        ),
        factory.createIdentifier('length')
      )
    )
  );
}

/**
 * Creates an equality check expression for all fields.
 */
export function createEqualityCheck(
  factory: ts.NodeFactory,
  fieldNames: string[],
  otherParam: string
): ts.Expression {
  if (fieldNames.length === 0) {
    return factory.createTrue();
  }

  const checks = fieldNames.map(fieldName =>
    factory.createBinaryExpression(
      factory.createPropertyAccessExpression(
        factory.createThis(),
        factory.createIdentifier(fieldName)
      ),
      factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
      factory.createPropertyAccessExpression(
        factory.createIdentifier(otherParam),
        factory.createIdentifier(fieldName)
      )
    )
  );

  return checks.reduce((acc, check) =>
    factory.createBinaryExpression(
      acc,
      factory.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
      check
    )
  );
}

/**
 * Creates a new instance expression: new ClassName(args)
 */
export function createNewInstance(
  factory: ts.NodeFactory,
  className: string,
  args: ts.Expression[]
): ts.NewExpression {
  return factory.createNewExpression(
    factory.createIdentifier(className),
    undefined,
    args
  );
}

/**
 * Capitalizes the first letter of a string.
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
