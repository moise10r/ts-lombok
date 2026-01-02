import { describe, it, expect } from 'vitest';
import * as ts from 'typescript';
import { createTransformer } from '../../src/transformer/transformer-factory';

describe('transformer integration', () => {
  function transform(sourceCode: string): string {
    // Create a virtual program
    const fileName = 'test.ts';
    const sourceFile = ts.createSourceFile(
      fileName,
      sourceCode,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS
    );

    // Create a minimal compiler host
    const compilerHost: ts.CompilerHost = {
      getSourceFile: (name) => (name === fileName ? sourceFile : undefined),
      getDefaultLibFileName: () => 'lib.d.ts',
      writeFile: () => {},
      getCurrentDirectory: () => '/',
      getCanonicalFileName: (f) => f,
      useCaseSensitiveFileNames: () => true,
      getNewLine: () => '\n',
      fileExists: (name) => name === fileName,
      readFile: () => undefined
    };

    // Create program
    const program = ts.createProgram([fileName], {
      target: ts.ScriptTarget.Latest,
      module: ts.ModuleKind.CommonJS,
      experimentalDecorators: true
    }, compilerHost);

    // Get transformer
    const transformer = createTransformer(program);

    // Transform
    const result = ts.transform(sourceFile, [transformer]);
    const transformedSourceFile = result.transformed[0];

    // Print result
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const output = printer.printFile(transformedSourceFile);

    result.dispose();

    return output;
  }

  describe('@Record', () => {
    it('transforms a simple class with @Record', () => {
      const input = `
        @Record
        class User {
          id: number;
          name: string;
        }
      `;

      const output = transform(input);

      // Should have constructor
      expect(output).toContain('constructor(id: number, name: string)');

      // Should have property assignments
      expect(output).toContain('this.id = id');
      expect(output).toContain('this.name = name');

      // Should have Object.freeze
      expect(output).toContain('Object.freeze(this)');

      // Should have toString
      expect(output).toContain('toString()');

      // Should have readonly properties
      expect(output).toContain('readonly id');
      expect(output).toContain('readonly name');

      // Should NOT have the decorator
      expect(output).not.toContain('@Record');
    });

    it('preserves existing methods', () => {
      const input = `
        @Record
        class User {
          id: number;

          customMethod() {
            return 'custom';
          }
        }
      `;

      const output = transform(input);

      expect(output).toContain('customMethod()');
      expect(output).toContain("return 'custom'");
    });

    it('does not add toString if already exists', () => {
      const input = `
        @Record
        class User {
          id: number;

          toString() {
            return 'custom toString';
          }
        }
      `;

      const output = transform(input);

      // Should have the custom toString, not generated one
      expect(output).toContain("return 'custom toString'");

      // Should only have one toString
      const toStringCount = (output.match(/toString\(\)/g) || []).length;
      expect(toStringCount).toBe(1);
    });
  });

  describe('@Value', () => {
    it('transforms the same as @Record', () => {
      const input = `
        @Value
        class Point {
          x: number;
          y: number;
        }
      `;

      const output = transform(input);

      expect(output).toContain('constructor(x: number, y: number)');
      expect(output).toContain('Object.freeze(this)');
      expect(output).toContain('toString()');
      expect(output).toContain('readonly x');
      expect(output).toContain('readonly y');
    });
  });

  describe('@Equals', () => {
    it('generates equals and hashCode methods', () => {
      const input = `
        @Equals
        class Point {
          x: number;
          y: number;
        }
      `;

      const output = transform(input);

      // Should have equals method
      expect(output).toContain('equals(other: Point)');
      expect(output).toContain('boolean');
      expect(output).toContain('other == null');
      expect(output).toContain('this === other');
      expect(output).toContain('instanceof Point');
      expect(output).toContain('this.x === other.x');
      expect(output).toContain('this.y === other.y');

      // Should have hashCode method
      expect(output).toContain('hashCode()');
      expect(output).toContain('number');
    });
  });

  describe('@With', () => {
    it('generates withX methods for each property', () => {
      const input = `
        @With
        class User {
          id: number;
          name: string;
        }
      `;

      const output = transform(input);

      // Should have withId method
      expect(output).toContain('withId(id: number)');
      expect(output).toContain('new User(id, this.name)');

      // Should have withName method
      expect(output).toContain('withName(name: string)');
      expect(output).toContain('new User(this.id, name)');
    });
  });

  describe('combined decorators', () => {
    it('combines @Record and @With', () => {
      const input = `
        @Record
        @With
        class User {
          id: number;
          name: string;
        }
      `;

      const output = transform(input);

      // From @Record
      expect(output).toContain('constructor(id: number, name: string)');
      expect(output).toContain('Object.freeze(this)');
      expect(output).toContain('toString()');

      // From @With
      expect(output).toContain('withId(id: number)');
      expect(output).toContain('withName(name: string)');
    });

    it('combines @Record and @Equals', () => {
      const input = `
        @Record
        @Equals
        class User {
          id: number;
          name: string;
        }
      `;

      const output = transform(input);

      // From @Record
      expect(output).toContain('constructor(id: number, name: string)');
      expect(output).toContain('Object.freeze(this)');
      expect(output).toContain('toString()');

      // From @Equals
      expect(output).toContain('equals(other: User)');
      expect(output).toContain('hashCode()');
    });
  });

  describe('edge cases', () => {
    it('handles empty class', () => {
      const input = `
        @Record
        class Empty {}
      `;

      const output = transform(input);

      expect(output).toContain('constructor()');
      expect(output).toContain('Object.freeze(this)');
      expect(output).toContain('toString()');
      expect(output).toContain('Empty()');
    });

    it('preserves non-ts-lombok decorators', () => {
      const input = `
        @CustomDecorator
        @Record
        class User {
          id: number;
        }
      `;

      const output = transform(input);

      expect(output).toContain('@CustomDecorator');
      expect(output).not.toContain('@Record');
    });

    it('handles class with no decorators', () => {
      const input = `
        class User {
          id: number;
        }
      `;

      const output = transform(input);

      // Should be unchanged
      expect(output).toContain('class User');
      expect(output).toContain('id: number');
      expect(output).not.toContain('constructor');
    });
  });
});
