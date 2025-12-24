import { describe, it, expect } from 'vitest';
import * as ts from 'typescript';
import { generateConstructor } from '../../src/generators/constructor-generator';
import { TransformationPlan } from '../../src/transformer/context';
import { PropertyInfo } from '../../src/utils/decorator-utils';

describe('constructor-generator', () => {
  const factory = ts.factory;

  function createMockPlan(properties: PropertyInfo[]): TransformationPlan {
    return {
      classDeclaration: {} as ts.ClassDeclaration,
      className: 'TestClass',
      properties,
      decorators: ['Record'],
      generateConstructor: true,
      freezeInstance: false,
      makeReadonly: true,
      generateToString: false,
      generateEquals: false,
      generateHashCode: false,
      generateWithMethods: false,
      additionalMembers: []
    };
  }

  function printNode(node: ts.Node): string {
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const sourceFile = ts.createSourceFile(
      'test.ts',
      '',
      ts.ScriptTarget.Latest,
      false,
      ts.ScriptKind.TS
    );
    return printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
  }

  it('generates constructor with no parameters for empty properties', () => {
    const plan = createMockPlan([]);
    const constructor = generateConstructor(factory, plan);

    expect(constructor.parameters.length).toBe(0);
    expect(constructor.body).toBeDefined();
  });

  it('generates constructor with parameters matching properties', () => {
    const properties: PropertyInfo[] = [
      {
        name: 'id',
        type: factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
        isOptional: false,
        isReadonly: false,
        hasInitializer: false,
        modifiers: []
      },
      {
        name: 'name',
        type: factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
        isOptional: false,
        isReadonly: false,
        hasInitializer: false,
        modifiers: []
      }
    ];

    const plan = createMockPlan(properties);
    const constructor = generateConstructor(factory, plan);

    expect(constructor.parameters.length).toBe(2);

    const output = printNode(constructor);
    expect(output).toContain('id: number');
    expect(output).toContain('name: string');
    expect(output).toContain('this.id = id');
    expect(output).toContain('this.name = name');
  });

  it('includes additional statements in constructor body', () => {
    const properties: PropertyInfo[] = [
      {
        name: 'value',
        type: factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
        isOptional: false,
        isReadonly: false,
        hasInitializer: false,
        modifiers: []
      }
    ];

    const plan = createMockPlan(properties);

    const freezeStatement = factory.createExpressionStatement(
      factory.createCallExpression(
        factory.createPropertyAccessExpression(
          factory.createIdentifier('Object'),
          factory.createIdentifier('freeze')
        ),
        undefined,
        [factory.createThis()]
      )
    );

    const constructor = generateConstructor(factory, plan, [freezeStatement]);
    const output = printNode(constructor);

    expect(output).toContain('Object.freeze(this)');
  });
});
