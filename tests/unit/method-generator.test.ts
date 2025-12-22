import { describe, it, expect } from 'vitest';
import * as ts from 'typescript';
import {
  generateToString,
  generateEquals,
  generateHashCode,
  generateWithMethods
} from '../../src/generators/method-generator';
import { TransformationPlan } from '../../src/transformer/context';
import { PropertyInfo } from '../../src/utils/decorator-utils';

describe('method-generator', () => {
  const factory = ts.factory;

  function createMockPlan(
    className: string,
    properties: PropertyInfo[]
  ): TransformationPlan {
    return {
      classDeclaration: {} as ts.ClassDeclaration,
      className,
      properties,
      decorators: [],
      generateConstructor: false,
      freezeInstance: false,
      makeReadonly: false,
      generateToString: true,
      generateEquals: true,
      generateHashCode: true,
      generateWithMethods: true,
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

  describe('generateToString', () => {
    it('generates toString for class with no properties', () => {
      const plan = createMockPlan('Empty', []);
      const method = generateToString(factory, plan);
      const output = printNode(method);

      expect(output).toContain('toString()');
      expect(output).toContain('string');
      expect(output).toContain('Empty()');
    });

    it('generates toString with single property', () => {
      const properties: PropertyInfo[] = [
        {
          name: 'id',
          type: factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
          isOptional: false,
          isReadonly: false,
          hasInitializer: false,
          modifiers: []
        }
      ];

      const plan = createMockPlan('User', properties);
      const method = generateToString(factory, plan);
      const output = printNode(method);

      expect(output).toContain('toString()');
      expect(output).toContain('User(id=');
      expect(output).toContain('this.id');
    });

    it('generates toString with multiple properties', () => {
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

      const plan = createMockPlan('User', properties);
      const method = generateToString(factory, plan);
      const output = printNode(method);

      expect(output).toContain('User(id=');
      expect(output).toContain('name=');
      expect(output).toContain('this.id');
      expect(output).toContain('this.name');
    });
  });

  describe('generateEquals', () => {
    it('generates equals method with null check', () => {
      const properties: PropertyInfo[] = [
        {
          name: 'id',
          type: factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
          isOptional: false,
          isReadonly: false,
          hasInitializer: false,
          modifiers: []
        }
      ];

      const plan = createMockPlan('User', properties);
      const method = generateEquals(factory, plan);
      const output = printNode(method);

      expect(output).toContain('equals(other: User)');
      expect(output).toContain('boolean');
      expect(output).toContain('other == null');
      expect(output).toContain('return false');
      expect(output).toContain('this === other');
      expect(output).toContain('return true');
      expect(output).toContain('instanceof User');
      expect(output).toContain('this.id === other.id');
    });

    it('generates equals with multiple property comparisons', () => {
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

      const plan = createMockPlan('User', properties);
      const method = generateEquals(factory, plan);
      const output = printNode(method);

      expect(output).toContain('this.id === other.id');
      expect(output).toContain('this.name === other.name');
      expect(output).toContain('&&');
    });
  });

  describe('generateHashCode', () => {
    it('generates hashCode returning 0 for empty class', () => {
      const plan = createMockPlan('Empty', []);
      const method = generateHashCode(factory, plan);
      const output = printNode(method);

      expect(output).toContain('hashCode()');
      expect(output).toContain('number');
      expect(output).toContain('return 0');
    });

    it('generates hashCode with field-based computation', () => {
      const properties: PropertyInfo[] = [
        {
          name: 'id',
          type: factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
          isOptional: false,
          isReadonly: false,
          hasInitializer: false,
          modifiers: []
        }
      ];

      const plan = createMockPlan('User', properties);
      const method = generateHashCode(factory, plan);
      const output = printNode(method);

      expect(output).toContain('hashCode()');
      expect(output).toContain('number');
      expect(output).toContain('this.id');
    });
  });

  describe('generateWithMethods', () => {
    it('generates withX methods for each property', () => {
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

      const plan = createMockPlan('User', properties);
      const methods = generateWithMethods(factory, plan);

      expect(methods.length).toBe(2);

      const withIdOutput = printNode(methods[0]);
      expect(withIdOutput).toContain('withId(id: number)');
      expect(withIdOutput).toContain('User');
      expect(withIdOutput).toContain('new User(id, this.name)');

      const withNameOutput = printNode(methods[1]);
      expect(withNameOutput).toContain('withName(name: string)');
      expect(withNameOutput).toContain('new User(this.id, name)');
    });

    it('returns empty array for class with no properties', () => {
      const plan = createMockPlan('Empty', []);
      const methods = generateWithMethods(factory, plan);

      expect(methods.length).toBe(0);
    });
  });
});
