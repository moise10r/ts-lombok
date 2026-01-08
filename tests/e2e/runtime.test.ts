import { describe, it, expect } from 'vitest';
import * as ts from 'typescript';
import * as vm from 'vm';
import { createTransformer } from '../../src/transformer/transformer-factory';

describe('e2e runtime tests', () => {
  /**
   * Transforms TypeScript code and evaluates the resulting JavaScript.
   */
  function compileAndRun<T>(sourceCode: string, evalCode: string): T {
    const fileName = 'test.ts';

    // Compiler options for emit
    const compilerOptions: ts.CompilerOptions = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      experimentalDecorators: true,
      noEmit: false,
      declaration: false
    };

    // Create a virtual file system for the compiler
    const sourceFiles: Record<string, string> = {
      [fileName]: sourceCode
    };

    // Capture emitted code
    let emittedCode = '';

    const compilerHost: ts.CompilerHost = {
      getSourceFile: (name, languageVersion) => {
        if (sourceFiles[name]) {
          return ts.createSourceFile(name, sourceFiles[name], languageVersion, true);
        }
        return undefined;
      },
      getDefaultLibFileName: () => 'lib.d.ts',
      writeFile: (name, text) => {
        if (name.endsWith('.js')) {
          emittedCode = text;
        }
      },
      getCurrentDirectory: () => '/',
      getCanonicalFileName: (f) => f,
      useCaseSensitiveFileNames: () => true,
      getNewLine: () => '\n',
      fileExists: (name) => name in sourceFiles || name === 'lib.d.ts',
      readFile: (name) => sourceFiles[name] || ''
    };

    // Create program
    const program = ts.createProgram([fileName], compilerOptions, compilerHost);

    // Get our transformer
    const transformer = createTransformer(program);

    // Emit with custom transformer
    program.emit(undefined, undefined, undefined, false, {
      before: [transformer]
    });

    if (!emittedCode) {
      throw new Error('No JavaScript code was emitted');
    }

    // Create a sandboxed context to run the code
    const context = vm.createContext({ console, Object, String });
    vm.runInContext(emittedCode, context);
    return vm.runInContext(evalCode, context);
  }

  describe('@Record runtime behavior', () => {
    it('creates instances with constructor parameters', () => {
      const source = `
        @Record
        class User {
          id: number;
          name: string;
        }
      `;

      const user = compileAndRun<{ id: number; name: string }>(
        source,
        `new User(1, 'John')`
      );

      expect(user.id).toBe(1);
      expect(user.name).toBe('John');
    });

    it('freezes instances', () => {
      const source = `
        @Record
        class User {
          id: number;
          name: string;
        }
      `;

      const isFrozen = compileAndRun<boolean>(
        source,
        `Object.isFrozen(new User(1, 'John'))`
      );

      expect(isFrozen).toBe(true);
    });

    it('generates correct toString output', () => {
      const source = `
        @Record
        class User {
          id: number;
          name: string;
        }
      `;

      const str = compileAndRun<string>(
        source,
        `new User(1, 'John').toString()`
      );

      expect(str).toBe('User(id=1, name=John)');
    });

    it('toString works with empty class', () => {
      const source = `
        @Record
        class Empty {}
      `;

      const str = compileAndRun<string>(source, `new Empty().toString()`);

      expect(str).toBe('Empty()');
    });
  });

  describe('@Equals runtime behavior', () => {
    it('equals returns true for identical values', () => {
      const source = `
        @Equals
        class Point {
          x: number;
          y: number;
        }
      `;

      const result = compileAndRun<boolean>(source, `
        const p1 = new Point();
        p1.x = 1;
        p1.y = 2;
        const p2 = new Point();
        p2.x = 1;
        p2.y = 2;
        p1.equals(p2);
      `);

      expect(result).toBe(true);
    });

    it('equals returns false for different values', () => {
      const source = `
        @Equals
        class Point {
          x: number;
          y: number;
        }
      `;

      const result = compileAndRun<boolean>(source, `
        const p1 = new Point();
        p1.x = 1;
        p1.y = 2;
        const p2 = new Point();
        p2.x = 3;
        p2.y = 4;
        p1.equals(p2);
      `);

      expect(result).toBe(false);
    });

    it('equals returns true for same instance', () => {
      const source = `
        @Equals
        class Point {
          x: number;
          y: number;
        }
      `;

      const result = compileAndRun<boolean>(source, `
        const p = new Point();
        p.x = 1;
        p.y = 2;
        p.equals(p);
      `);

      expect(result).toBe(true);
    });

    it('equals returns false for null', () => {
      const source = `
        @Equals
        class Point {
          x: number;
          y: number;
        }
      `;

      const result = compileAndRun<boolean>(source, `
        const p = new Point();
        p.x = 1;
        p.y = 2;
        p.equals(null);
      `);

      expect(result).toBe(false);
    });

    it('hashCode returns same value for equal objects', () => {
      const source = `
        @Equals
        class Point {
          x: number;
          y: number;
        }
      `;

      const result = compileAndRun<boolean>(source, `
        const p1 = new Point();
        p1.x = 1;
        p1.y = 2;
        const p2 = new Point();
        p2.x = 1;
        p2.y = 2;
        p1.hashCode() === p2.hashCode();
      `);

      expect(result).toBe(true);
    });
  });

  describe('@With runtime behavior', () => {
    it('withX returns new instance with changed value', () => {
      const source = `
        @Record
        @With
        class User {
          id: number;
          name: string;
        }
      `;

      const result = compileAndRun<{ original: { id: number; name: string }; updated: { id: number; name: string }; areDifferent: boolean }>(source, `
        const original = new User(1, 'John');
        const updated = original.withName('Jane');
        ({ original, updated, areDifferent: original !== updated });
      `);

      expect(result.original.id).toBe(1);
      expect(result.original.name).toBe('John');
      expect(result.updated.id).toBe(1);
      expect(result.updated.name).toBe('Jane');
      expect(result.areDifferent).toBe(true);
    });

    it('withX preserves other fields', () => {
      const source = `
        @Record
        @With
        class User {
          id: number;
          name: string;
          email: string;
        }
      `;

      const result = compileAndRun<{ id: number; name: string; email: string }>(source, `
        const user = new User(1, 'John', 'john@example.com');
        user.withName('Jane');
      `);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Jane');
      expect(result.email).toBe('john@example.com');
    });
  });

  describe('combined decorators runtime', () => {
    it('@Record @Equals @With all work together', () => {
      const source = `
        @Record
        @Equals
        @With
        class User {
          id: number;
          name: string;
        }
      `;

      const result = compileAndRun<{
        isFrozen: boolean;
        toString: string;
        areEqual: boolean;
        sameHash: boolean;
        withWorks: boolean;
      }>(source, `
        const u1 = new User(1, 'John');
        const u2 = new User(1, 'John');
        const u3 = u1.withName('Jane');

        ({
          isFrozen: Object.isFrozen(u1),
          toString: u1.toString(),
          areEqual: u1.equals(u2),
          sameHash: u1.hashCode() === u2.hashCode(),
          withWorks: u3.name === 'Jane' && u3.id === 1
        });
      `);

      expect(result.isFrozen).toBe(true);
      expect(result.toString).toBe('User(id=1, name=John)');
      expect(result.areEqual).toBe(true);
      expect(result.sameHash).toBe(true);
      expect(result.withWorks).toBe(true);
    });
  });
});
